import * as THREE from 'three';

export function createEnemy(scene, { x = 0, z = 0 } = {}) {
	const root = new THREE.Group();
	root.position.set(x, 0, z);

	const furMaterial = new THREE.MeshStandardMaterial({
		color: 0x55505a,
		flatShading: true,
		roughness: 1,
	});

	const darkMaterial = new THREE.MeshStandardMaterial({
		color: 0x292630,
		flatShading: true,
		roughness: 1,
	});

	const eyeMaterial = new THREE.MeshStandardMaterial({
		color: 0xff3333,
		emissive: 0x661111,
	});

	function addPart(geometry, material, x, y, z) {
		const part = new THREE.Mesh(geometry, material);
		part.position.set(x, y, z);
		part.castShadow = true;
		part.receiveShadow = true;
		root.add(part);
		return part;
	}

	// Body
	addPart(new THREE.BoxGeometry(1.1, 0.65, 0.55), furMaterial, 0, 0.8, 0);

	// Head
	addPart(new THREE.DodecahedronGeometry(0.38, 0), furMaterial, 0, 1.15, -0.48);

	// Snout
	addPart(new THREE.BoxGeometry(0.35, 0.22, 0.4), darkMaterial, 0, 1.05, -0.8);

	// Ears
	for (const side of [-1, 1]) {
		const ear = addPart(
			new THREE.ConeGeometry(0.13, 0.4, 4),
			darkMaterial,
			side * 0.24,
			1.55,
			-0.48
		);

		ear.rotation.z = side * -0.2;

		// Eyes
		addPart(
			new THREE.SphereGeometry(0.055, 6, 6),
			eyeMaterial,
			side * 0.29,
			1.2,
			-0.7
		);
	}

	// Legs
	const legGeometry = new THREE.BoxGeometry(0.18, 0.55, 0.2);

	for (const sideX of [-1, 1]) {
		for (const sideZ of [-1, 1]) {
			addPart(legGeometry, darkMaterial, sideX * 0.34, 0.3, sideZ * 0.16);
		}
	}

	scene.add(root);

	return {
		root,
		position: root.position,

		speed: 2.5,
		detectionRadius: 9,
		attackRadius: 1.5,
		collisionRadius: 0.55,

		hp: 60,
		maxHp: 60,

		state: 'idle',

		dispose() {
			scene.remove(root);

			root.traverse(object => {
				if (object.isMesh) {
					object.geometry.dispose();
				}
			});

			furMaterial.dispose();
			darkMaterial.dispose();
			eyeMaterial.dispose();
		},
	};
}
