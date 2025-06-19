// src/lib/visualizer/main.ts

import THREE from './three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addCourtToScene } from './court';
import { drillsStore } from '$lib/stores/drills';
import type { Drill, DrillStep } from '$lib/types/drills';
import { createPlayer, createBall, animateBall } from './utils';
import gsap from 'gsap';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let players: THREE.Mesh[];
let ball: THREE.Mesh;
let animationFrameId: number;

// --- Coordinate Overlay Logic ---
let showCoordinateOverlay = false;
let courtLabels: THREE.Sprite[] = [];

export function setShowCoordinateOverlay(show: boolean) {
  showCoordinateOverlay = show;
  updateCourtCoordinateLabels();
}

function createTextSprite(text: string, color: string = '#fff'): THREE.Sprite {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 6;
  ctx.strokeText(text, size/2, size/2);
  ctx.fillText(text, size/2, size/2);
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  const material = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(9, 3.6, 1); // 50% larger than before
  sprite.material.rotation = 0; // Make readable from top-down
  return sprite;
}

function updateCourtCoordinateLabels() {
  if (!scene) return;
  // Remove old labels
  courtLabels.forEach(label => scene.remove(label));
  courtLabels = [];
  if (!showCoordinateOverlay) return;

  // Key court intersection points (where lines meet and net sides)
  // Court is 20x44, centered at (0,0), lines at x=-10,0,10 and z=-22,-7,0,7,22
  const xs = [-10, 0, 10];
  const zs = [-22, -7, 0, 7, 22];
  // Place labels at all intersections
  for (const x of xs) {
    for (const z of zs) {
      const label = createTextSprite(`(${x}, ${z})`, '#fff');
      label.position.set(x, 0.05, z); // just above court
      scene.add(label);
      courtLabels.push(label);
    }
  }
  // Net sides (left/right)
  const netZ = 0;
  const netY = 0.05;
  const netXs = [-10, 10];
  for (const x of netXs) {
    const label = createTextSprite(`(${x}, ${netZ})`, '#ffb300');
    label.position.set(x, netY, netZ);
    scene.add(label);
    courtLabels.push(label);
  }
}

// Handle window resize
function onWindowResize() {
  if (!camera || !renderer) return;
  
  const width = window.innerWidth;
  const height = window.innerHeight - 56; // Subtract title bar height
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

export function initVisualization() {
  const canvas = document.getElementById('court') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 40, 60);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight - 56);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.maxPolarAngle = Math.PI / 2.1; // Prevent going below court
  controls.minDistance = 20; // Prevent zooming too close
  controls.maxDistance = 100; // Prevent zooming too far

  window.addEventListener('resize', onWindowResize);

  // Add court (static)
  addCourtToScene(scene);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 1.2);
  light.position.set(10, 20, 10);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 100;
  scene.add(light);

  // Players and ball
  players = [
    createPlayer('blue'),
    createPlayer('blue'),
    createPlayer('red'),
    createPlayer('red')
  ];
  players.forEach(p => {
    p.visible = false; // Hide all players initially
    scene.add(p);
  });

  ball = createBall();
  scene.add(ball);

  // Subscribe to store changes
  drillsStore.subscribe(data => {
    if (data) {
      updateScene(drillsStore.getCurrentStepIndex());
    }
  });

  // Start animation loop
  animate();
}

function updateScene(stepIndex: number) {
  const currentDrill = drillsStore.getCurrentDrill() as Drill | null;
  if (!currentDrill) return;

  const step = currentDrill.steps[stepIndex] as DrillStep | undefined;
  if (!step) return;

  // Hide all players first
  players.forEach(p => p.visible = false);

  // Show and animate only the players needed for this drill
  const playerPositions = step.players.map((p: { x: number; z: number }) => ({ x: p.x, z: p.z }));
  playerPositions.forEach((pos, i) => {
    if (i < players.length) {
      players[i].visible = true;
      gsap.to(players[i].position, { x: pos.x, z: pos.z, duration: 0.6, ease: 'linear' });
    }
  });

  // Animate the ball
  animateBall(ball, step.ball);
  // Also update court labels
  updateCourtCoordinateLabels();
}

function animate() {
  animationFrameId = requestAnimationFrame(animate);
  
  // Update controls with damping
  controls?.update();
  
  // Render scene
  renderer?.render(scene, camera);
}

export function cleanup() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  // Remove event listeners
  window.removeEventListener('resize', onWindowResize);
  
  // Dispose of Three.js resources
  scene?.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  });
  
  renderer?.dispose();
  controls?.dispose();
}
