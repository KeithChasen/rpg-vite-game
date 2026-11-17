import * as THREE from 'three';
import { createRandom } from '../utils/random.js';
import { createMesh } from '../utils/threeHelpers.js';

const DEFAULTS = {
  attempts: 55,
  innerRadius: 7,
  outerRadius: 30,
  treeChance: 0.78,
  centerClearance: 6,
  seed: 42,
};

/**
 * Creates decorative trees and rocks.
 * Returns object positions too, so a future collision system can reuse them.
 */
export function createEnvironment(scene, options = {}) {
  const config = { ...DEFAULTS, ...options };
  const random = createRandom(config.seed);
  const obstacles = [];
  const treeGroup = new THREE.Group();
  const rockGroup = new THREE.Group();

  // Shared geometries/materials: don't allocate a new material for every tree.
  const trunkGeometry = new THREE.CylinderGeometry(0.25, 0.35, 1.4, 6);
  const foliageGeometry = new THREE.ConeGeometry(1.3, 2.8, 7);
  const rockGeometry = new THREE.DodecahedronGeometry(1, 0);

  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x5a3d26, flatShading: true, roughness: 1 });
  const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x23472f, flatShading: true, roughness: 1 });
  const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x6b7078, flatShading: true, roughness: 1 });

  for (let i = 0; i < config.attempts; i += 1) {
    const angle = random() * Math.PI * 2;
    // sqrt gives a more even distribution across the island's surface area.
    const distance = Math.sqrt(
      random() * (config.outerRadius ** 2 - config.innerRadius ** 2) + config.innerRadius ** 2,
    );
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;

    if (Math.hypot(x, z) < config.centerClearance) continue;

    if (random() < config.treeChance) {
      const tree = new THREE.Group();
      tree.add(createMesh(trunkGeometry, trunkMaterial, [0, 0.7, 0]));

      const foliageHeight = 2 + random() * 2;
      const foliage = createMesh(foliageGeometry, foliageMaterial, [0, 1.4 + foliageHeight / 2, 0]);
      foliage.scale.y = foliageHeight / 2.8;
      tree.add(foliage);
      tree.position.set(x, 0, z);
      tree.rotation.y = random() * Math.PI * 2;
      treeGroup.add(tree);
      obstacles.push({ x, z, radius: 0.8, type: 'tree' });
    } else {
      const scale = 0.9 + random() * 0.5;
      const rock = createMesh(rockGeometry, rockMaterial, [x, 0.4, z]);
      rock.scale.setScalar(scale);
      rock.rotation.set(random() * 0.3, random() * Math.PI, random() * 0.3);
      rockGroup.add(rock);
      obstacles.push({ x, z, radius: 1.1 * scale, type: 'rock' });
    }
  }

  scene.add(treeGroup, rockGroup);

  return {
    treeGroup,
    rockGroup,
    obstacles,
    dispose() {
      scene.remove(treeGroup, rockGroup);
      trunkGeometry.dispose();
      foliageGeometry.dispose();
      rockGeometry.dispose();
      trunkMaterial.dispose();
      foliageMaterial.dispose();
      rockMaterial.dispose();
    },
  };
}
