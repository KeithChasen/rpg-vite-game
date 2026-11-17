import * as THREE from 'three';

const UP = ['KeyW', 'ArrowUp'];
const DOWN = ['KeyS', 'ArrowDown'];
const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];

const direction = new THREE.Vector3();

/** Updates player position using input and elapsed frame time. */
export function updatePlayerMovement(
	player,
	input,
	deltaTime,
	worldRadius = 35
) {
	direction.set(0, 0, 0);

	if (input.isDown(...UP)) direction.z -= 1;
	if (input.isDown(...DOWN)) direction.z += 1;
	if (input.isDown(...LEFT)) direction.x -= 1;
	if (input.isDown(...RIGHT)) direction.x += 1;

	if (direction.lengthSq() === 0) return;

	// Prevent diagonal movement from being faster than straight movement.
	direction.normalize();

	player.position.x += direction.x * player.speed * deltaTime;
	player.position.z += direction.z * player.speed * deltaTime;

	// Keep the player on the island. Obstacles will be handled in the next step.
	const distanceFromCenter = Math.hypot(player.position.x, player.position.z);

	if (distanceFromCenter > worldRadius) {
		const scale = worldRadius / distanceFromCenter;

		player.position.x *= scale;
		player.position.z *= scale;
	}

	// The model's forward direction is local -Z.
	player.root.rotation.y = Math.atan2(direction.x, direction.z) + Math.PI;
}
