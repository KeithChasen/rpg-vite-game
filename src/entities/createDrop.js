import * as THREE from 'three';

export function createDrop(scene, { x, z, itemId, amount = 1 }) {
	const root = new THREE.Group();
	root.position.set(x, 0.35, z);

	const geometry = new THREE.DodecahedronGeometry(0.25, 0);
	const material = new THREE.MeshStandardMaterial({
		color: 0xe6b83f,
		roughness: 0.5,
		metalness: 0.2,
	});

	const mesh = new THREE.Mesh(geometry, material);
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	root.add(mesh);
	scene.add(root);

	return {
		root,
		position: root.position,
		itemId,
		amount,

		dispose() {
			scene.remove(root);
			geometry.dispose();
			material.dispose();
		},
	};
}
