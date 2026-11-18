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

	const playerMaterials = [
		bodyMaterial,
		skinMaterial,
		trousersMaterial,
		beltMaterial,
	];

	function setHitVisual(active) {
		for (const material of playerMaterials) {
			material.emissive.setHex(active ? 0x992222 : 0x000000);
		}
	}

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

	// Health bar
	const healthBar = new THREE.Group();
	healthBar.position.set(0, 2.55, 0);

	const healthBarBackgroundMaterial = new THREE.MeshBasicMaterial({
		color: 0x29232a,
		depthTest: false,
		side: THREE.DoubleSide,
	});

	const healthBarFillMaterial = new THREE.MeshBasicMaterial({
		color: 0x55cc66,
		depthTest: false,
		side: THREE.DoubleSide,
	});

	const healthBarBackground = new THREE.Mesh(
		new THREE.PlaneGeometry(0.9, 0.12),
		healthBarBackgroundMaterial
	);

	const healthBarFill = new THREE.Mesh(
		new THREE.PlaneGeometry(0.86, 0.08),
		healthBarFillMaterial
	);

	healthBarFill.position.z = 0.01;

	healthBarBackground.renderOrder = 10;
	healthBarFill.renderOrder = 11;

	healthBar.add(healthBarBackground, healthBarFill);
	root.add(healthBar);

	function updateHealthBar(hp, maxHp) {
		const ratio = Math.max(0, hp / maxHp);

		healthBarFill.scale.x = ratio;
		healthBarFill.position.x = -0.43 * (1 - ratio);

		healthBarFillMaterial.color.setHex(ratio < 0.3 ? 0xe04444 : 0x55cc66);

		healthBar.visible = hp < maxHp;
	}

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

		hp: 100,
		maxHp: 100,

		defense: 0,

		invulnerabilityTimer: 0,
		hitTimer: 0,
		isDead: false,

		updateHealthBar,
		setHitVisual,

		dispose() {
			scene.remove(root);

			// for (const material of [
			// 	bodyMaterial,
			// 	skinMaterial,
			// 	trousersMaterial,
			// 	beltMaterial,
			// ]) {
			// 	material.dispose();
			// }

			playerMaterials.dispose();

			body.geometry.dispose();
			head.geometry.dispose();
			legs.geometry.dispose();
			belt.geometry.dispose();

			healthBarBackground.geometry.dispose();
			healthBarFill.geometry.dispose();

			healthBarBackgroundMaterial.dispose();
			healthBarFillMaterial.dispose();
		},
	};
}
