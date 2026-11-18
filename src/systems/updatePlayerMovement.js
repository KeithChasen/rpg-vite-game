import * as THREE from 'three';

const UP = ['KeyW', 'ArrowUp'];
const DOWN = ['KeyS', 'ArrowDown'];
const LEFT = ['KeyA', 'ArrowLeft'];
const RIGHT = ['KeyD', 'ArrowRight'];

const direction = new THREE.Vector3();

/**
 * Checks whether a position overlaps with any obstacle.
 */
function collidesWithObstacle(x, z, playerRadius, obstacles) {
	return obstacles.some(obstacle => {
		const distance = Math.hypot(x - obstacle.x, z - obstacle.z);

		return distance < playerRadius + obstacle.radius;
	});
}

/**
 * Updates player position using input, elapsed time and collisions.
 */
export function updatePlayerMovement(
	player,
	input,
	deltaTime,
	worldRadius = 35,
	obstacles = []
) {
	direction.set(0, 0, 0);

	if (input.isDown(...UP)) direction.z -= 1;
	if (input.isDown(...DOWN)) direction.z += 1;
	if (input.isDown(...LEFT)) direction.x -= 1;
	if (input.isDown(...RIGHT)) direction.x += 1;

	if (direction.lengthSq() === 0) return;

	direction.normalize();

	const moveX = direction.x * player.speed * deltaTime;
	const moveZ = direction.z * player.speed * deltaTime;

	// Move along X first.
	const nextX = player.position.x + moveX;

	if (
		!collidesWithObstacle(
			nextX,
			player.position.z,
			player.collisionRadius,
			obstacles
		)
	) {
		player.position.x = nextX;
	}

	// Then move along Z.
	const nextZ = player.position.z + moveZ;

	if (
		!collidesWithObstacle(
			player.position.x,
			nextZ,
			player.collisionRadius,
			obstacles
		)
	) {
		player.position.z = nextZ;
	}

	// Keep the player inside the island.
	const distanceFromCenter = Math.hypot(player.position.x, player.position.z);

	if (distanceFromCenter > worldRadius) {
		const scale = worldRadius / distanceFromCenter;

		player.position.x *= scale;
		player.position.z *= scale;
	}

	// Rotate the model towards the movement direction.
	player.root.rotation.y = Math.atan2(direction.x, direction.z) + Math.PI;
}
