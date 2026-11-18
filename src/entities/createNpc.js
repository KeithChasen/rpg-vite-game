import * as THREE from 'three';

export function createNpc(scene, { x = 0, z = 0 } = {}) {
	const root = new THREE.Group();
	root.position.set(x, 0, z);

	const materials = {
		skin: new THREE.MeshStandardMaterial({ color: 0xd5a078 }),
		clothes: new THREE.MeshStandardMaterial({ color: 0x526b82 }),
		dark: new THREE.MeshStandardMaterial({ color: 0x34343a }),
		hair: new THREE.MeshStandardMaterial({ color: 0x49352c }),
	};

	const geometries = [];

	function addPart(geometry, material, position) {
		geometries.push(geometry);

		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(...position);
		mesh.castShadow = true;
		mesh.receiveShadow = true;

		root.add(mesh);
		return mesh;
	}

	// Body
	addPart(
		new THREE.BoxGeometry(0.65, 0.9, 0.4),
		materials.clothes,
		[0, 1.05, 0]
	);

	// Head
	addPart(
		new THREE.DodecahedronGeometry(0.28, 1),
		materials.skin,
		[0, 1.75, 0]
	);

	// Hair
	addPart(
		new THREE.SphereGeometry(0.29, 8, 6),
		materials.hair,
		[0, 1.91, -0.04]
	);

	// Legs
	addPart(
		new THREE.BoxGeometry(0.22, 0.65, 0.25),
		materials.dark,
		[-0.17, 0.35, 0]
	);

	addPart(
		new THREE.BoxGeometry(0.22, 0.65, 0.25),
		materials.dark,
		[0.17, 0.35, 0]
	);

	// Arms
	addPart(
		new THREE.BoxGeometry(0.2, 0.75, 0.22),
		materials.clothes,
		[-0.43, 1.05, 0]
	);

	addPart(
		new THREE.BoxGeometry(0.2, 0.75, 0.22),
		materials.clothes,
		[0.43, 1.05, 0]
	);

	scene.add(root);

	return {
		root,
		position: root.position,
		interactionRadius: 2.5,

		dispose() {
			scene.remove(root);

			geometries.forEach(geometry => geometry.dispose());

			Object.values(materials).forEach(material => {
				material.dispose();
			});
		},
	};
}
