// src/lib/visualizer/main.ts

import THREE from './three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { addCourtToScene } from './court';
import { standard3ShotDrill } from './drills';
import { createPlayer, createBall, animateEntities, animateBall } from './utils';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 40, 60);

const canvas = document.getElementById('court') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

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
const players = [
  createPlayer('blue'),
  createPlayer('blue'),
  createPlayer('red'),
  createPlayer('red')
];
players.forEach(p => scene.add(p));

const ball = createBall();
scene.add(ball);

// Drill logic
const steps = standard3ShotDrill.steps;
let currentStep = 0;

function updateScene(stepIndex: number) {
  const step = steps[stepIndex];
  const playerPositions = step.players.map(p => ({ x: p.x, z: p.z }));
  animateEntities(players, playerPositions);
  animateBall(ball, step.ball);
}

// Controls
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');

if (nextBtn && prevBtn) {
  nextBtn.addEventListener('click', () => {
    if (currentStep < steps.length - 1) updateScene(++currentStep);
  });

  prevBtn.addEventListener('click', () => {
    if (currentStep > 0) updateScene(--currentStep);
  });
}

updateScene(currentStep);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
