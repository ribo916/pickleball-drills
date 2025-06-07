import THREE from './three';
import { gsap } from 'gsap';

/**
 * Create a player mesh
 */
export function createPlayer(color: string = 'blue'): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(0.7);
  const material = new THREE.MeshStandardMaterial({ color });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.7;
  mesh.castShadow = true;
  return mesh;
}

/**
 * Create the ball mesh
 */
export function createBall(): THREE.Mesh {
  const bumpTexture = new THREE.TextureLoader().load('/textures/pickleball-bump.png');
  bumpTexture.wrapS = THREE.RepeatWrapping;
  bumpTexture.wrapT = THREE.RepeatWrapping;
  bumpTexture.repeat.set(1.5, 1.5); // was 4, 6, or higher

  const material = new THREE.MeshStandardMaterial({
    color: '#d4ff00',  // updated for brightness
    map: bumpTexture,
    bumpScale: 0.15
  });
  

  const geometry = new THREE.SphereGeometry(0.4, 64, 64);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.4;
  mesh.castShadow = true;
  return mesh;
}


/**
 * Animate positions of a list of meshes using gsap
 */
export function animateEntities(
  entities: THREE.Object3D[],
  positions: { x: number; z: number }[],
  duration: number = 0.6
): void {
  entities.forEach((mesh, i) => {
    const pos = positions[i];
    gsap.to(mesh.position, { x: pos.x, z: pos.z, duration, ease: 'linear' });
  });
}

/**
 * Animate the ball with a net-crossing arc based on actual Z midpoint
 */
export function animateBall(
  ball: THREE.Object3D,
  position: { x: number; z: number },
  duration: number = 0.6
): void {
  if (!ball || !ball.position) return;

  const arcHeight = 3.67; // 10 inches above 2.83 net height

  const startZ = ball.position.z;
  const endZ = position.z;
  const zTotal = endZ - startZ;
  const netCrossTime = zTotal === 0 ? 0.5 : (0 - startZ) / zTotal;
  const clampedTime = Math.max(0.1, Math.min(0.9, netCrossTime));
  const peakTime = duration * clampedTime;

  const timeline = gsap.timeline();

  timeline.to(ball.position, {
    x: position.x,
    z: position.z,
    duration,
    ease: 'linear'
  }, 0);

  timeline.to(ball.position, {
    y: arcHeight,
    duration: peakTime,
    ease: 'linear'
  }, 0);

  timeline.to(ball.position, {
    y: 0.4,
    duration: duration - peakTime,
    ease: 'linear'
  }, peakTime);
}
