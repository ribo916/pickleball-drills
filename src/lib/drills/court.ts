// court.ts
import THREE from './three';

export function addCourtToScene(scene: THREE.Scene): void {
  const courtWidth = 20;
  const courtLength = 44;
  const kitchenDepth = 7;

  // Load textured border
  const borderTexture = new THREE.TextureLoader().load('/textures/green-border-texture.png');
  borderTexture.wrapS = THREE.RepeatWrapping;
  borderTexture.wrapT = THREE.RepeatWrapping;
  borderTexture.repeat.set(1.5, 1.5);

  const outerCourt = new THREE.Mesh(
    new THREE.PlaneGeometry(courtWidth + 16, courtLength + 16),
    new THREE.MeshStandardMaterial({
      map: borderTexture,
      color: '#4A7742',
      side: THREE.DoubleSide
    })
  );
  outerCourt.rotation.x = -Math.PI / 2;
  outerCourt.receiveShadow = true;
  scene.add(outerCourt);

  const texture = new THREE.TextureLoader().load('/textures/court-surface.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);

  const mainCourt = new THREE.Mesh(
    new THREE.PlaneGeometry(courtWidth, courtLength),
    new THREE.MeshStandardMaterial({
      map: texture,
      color: '#0747A6', 
      side: THREE.DoubleSide
    })
    
  );
  mainCourt.rotation.x = -Math.PI / 2;
  mainCourt.position.y = 0.01;
  mainCourt.receiveShadow = true;
  scene.add(mainCourt);

  const fill = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
  scene.add(fill);

  const kitchenMaterial = new THREE.MeshStandardMaterial({ color: '#6AAFE6', side: THREE.DoubleSide });

  const kitchenNear = new THREE.Mesh(
    new THREE.PlaneGeometry(courtWidth, kitchenDepth),
    kitchenMaterial
  );
  kitchenNear.rotation.x = -Math.PI / 2;
  kitchenNear.position.set(0, 0.02, -3.5);
  kitchenNear.receiveShadow = true;
  scene.add(kitchenNear);

  const kitchenFar = new THREE.Mesh(
    new THREE.PlaneGeometry(courtWidth, kitchenDepth),
    kitchenMaterial
  );
  kitchenFar.rotation.x = -Math.PI / 2;
  kitchenFar.position.set(0, 0.02, 3.5);
  kitchenFar.receiveShadow = true;
  scene.add(kitchenFar);

  const courtLines = new THREE.Group();
  const lineMaterial = new THREE.LineBasicMaterial({ color: 'white' });

  const addLine = (x1: number, z1: number, x2: number, z2: number): void => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, 0.03, z1),
      new THREE.Vector3(x2, 0.03, z2)
    ]);
    courtLines.add(new THREE.Line(geometry, lineMaterial));
  };

  addLine(-10, -22, 10, -22);
  addLine(-10, 22, 10, 22);
  addLine(-10, -7, 10, -7);
  addLine(-10, 7, 10, 7);
  addLine(-10, -22, -10, 22);
  addLine(10, -22, 10, 22);
  addLine(0, -22, 0, 22);
  addLine(-10, 0, 10, 0);

  scene.add(courtLines);

  // Load net texture
  const netTexture = new THREE.TextureLoader().load('/textures/net-grid.png');
  netTexture.wrapS = THREE.RepeatWrapping;
  netTexture.wrapT = THREE.RepeatWrapping;
  netTexture.repeat.set(6, 1.5); // less horizontal & vertical tiling
  
  const netMaterial = new THREE.MeshStandardMaterial({
    map: netTexture,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true // let tape render correctly over net
  });
  
  const net = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 2.83),
    netMaterial
  );
  net.position.set(0, 2.83 / 2, 0);
  scene.add(net);

  const tape = new THREE.Mesh(
    new THREE.BoxGeometry(20, 0.1, 0.12),
    new THREE.MeshStandardMaterial({ color: 'white' })
  );
  tape.position.set(0, 2.83 + 0.01, 0); // tighter to net
  scene.add(tape);

  // Net poles
  const poleHeight = 2.83;
  const poleRadius = 0.1;
  const poleMaterial = new THREE.MeshStandardMaterial({ color: '#444' });

  const leftPole = new THREE.Mesh(
    new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 16),
    poleMaterial
  );
  leftPole.position.set(-10, poleHeight / 2, 0);
  leftPole.castShadow = true;
  scene.add(leftPole);

  const rightPole = new THREE.Mesh(
    new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 16),
    poleMaterial
  );
  rightPole.position.set(10, poleHeight / 2, 0);
  rightPole.castShadow = true;
  scene.add(rightPole);
}
