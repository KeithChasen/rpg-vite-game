import * as THREE from 'three';
import { createMesh } from '../utils/threeHelpers.js';

/** Creates the player's low-poly placeholder model. */
export function createPlayer(scene, { x = 0, z = 0 } = {}) {
	const root = new THREE.Group();
	root.position.set(x, 0, z);

	const bodyMaterial = new THREE.MeshStandardMaterial({
		color: 0x3d7190,
		flatShading: true,
		roughness: 1,
	});

	const skinMaterial = new THREE.MeshStandardMaterial({
		color: 0xd7a77d,
		flatShading: true,
		roughness: 1,
	});

	const trousersMaterial = new THREE.MeshStandardMaterial({
		color: 0x303744,
		flatShading: true,
		roughness: 1,
	});

	const beltMaterial = new THREE.MeshStandardMaterial({
		color: 0x8a633c,
		flatShading: true,
		roughness: 1,
	});

	const body = createMesh(
		new THREE.BoxGeometry(0.8, 1, 0.45),
		bodyMaterial,
		[0, 1.25, 0]
	);

	const head = createMesh(
		new THREE.DodecahedronGeometry(0.34, 0),
		skinMaterial,
		[0, 2.05, 0]
	);

	const legs = createMesh(
		new THREE.BoxGeometry(0.62, 0.55, 0.4),
		trousersMaterial,
		[0, 0.48, 0]
	);

	const belt = createMesh(
		new THREE.BoxGeometry(0.84, 0.13, 0.48),
		beltMaterial,
		[0, 0.9, 0]
	);

	root.add(body, head, legs, belt);
	scene.add(root);

	return {
		root,
		position: root.position,
		speed: 6,
		collisionRadius: 0.45, // player's collision radius

		attackDamage: 25,
		attackRange: 2.4,
		attackCooldown: 0.55,
		attackTimer: 0,

		dispose() {
			scene.remove(root);

			for (const material of [
				bodyMaterial,
				skinMaterial,
				trousersMaterial,
				beltMaterial,
			]) {
				material.dispose();
			}

			body.geometry.dispose();
			head.geometry.dispose();
			legs.geometry.dispose();
			belt.geometry.dispose();
		},
	};
}
