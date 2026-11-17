import * as THREE from 'three';
import { createMesh } from '../utils/threeHelpers.js';

export function createIsland(scene, { radius = 38 } = {}) {
  const islandMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d5a34,
    flatShading: true,
    roughness: 1,
  });

  const island = createMesh(
    new THREE.CylinderGeometry(radius + 2, radius + 3, 1, 48),
    islandMaterial,
    [0, -0.5, 0],
  );
  island.receiveShadow = true;
  scene.add(island);

  const seaMaterial = new THREE.MeshStandardMaterial({
    color: 0x1c3550,
    roughness: 1,
    metalness: 0,
  });
  const sea = createMesh(new THREE.PlaneGeometry(300, 300), seaMaterial, [0, -0.9, 0]);
  sea.rotation.x = -Math.PI / 2;
  sea.receiveShadow = true;
  scene.add(sea);

  return { island, sea, radius };
}
