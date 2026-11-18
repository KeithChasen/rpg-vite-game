/**
 * Checks whether an enemy can occupy a given position.
 */
function collidesWithObstacle(x, z, enemyRadius, obstacles) {
	return obstacles.some(obstacle => {
		const distance = Math.hypot(x - obstacle.x, z - obstacle.z);

		return distance < enemyRadius + obstacle.radius;
	});
}

/**
 * Updates enemy AI and movement.
 */
export function updateEnemies(
	enemies,
	player,
	deltaTime,
	obstacles = [],
	worldRadius = 35
) {
	for (const enemy of enemies) {
		if (enemy.state === 'dead') continue;

		// Calculate distance and direction to player.
		const dx = player.position.x - enemy.position.x;
		const dz = player.position.z - enemy.position.z;

		const distance = Math.hypot(dx, dz);

		// Player is outside detection range.
		if (distance > enemy.detectionRadius) {
			enemy.state = 'idle';
			continue;
		}

		// Player is close enough to attack.
		if (distance <= enemy.attackRadius) {
			enemy.state = 'attacking';
		} else {
			enemy.state = 'chasing';
		}

		// Rotate enemy towards player.
		if (distance > 0.001) {
			enemy.root.rotation.y = Math.atan2(dx, dz) + Math.PI;
		}

		// Only move while chasing.
		if (enemy.state !== 'chasing') continue;

		// Normalize movement direction.
		const directionX = dx / distance;
		const directionZ = dz / distance;

		const moveX = directionX * enemy.speed * deltaTime;
		const moveZ = directionZ * enemy.speed * deltaTime;

		// Move along X.
		const nextX = enemy.position.x + moveX;

		if (
			!collidesWithObstacle(
				nextX,
				enemy.position.z,
				enemy.collisionRadius,
				obstacles
			)
		) {
			enemy.position.x = nextX;
		}

		// Move along Z.
		const nextZ = enemy.position.z + moveZ;

		if (
			!collidesWithObstacle(
				enemy.position.x,
				nextZ,
				enemy.collisionRadius,
				obstacles
			)
		) {
			enemy.position.z = nextZ;
		}

		// Keep enemy inside the island.
		const enemyDistance = Math.hypot(enemy.position.x, enemy.position.z);

		if (enemyDistance > worldRadius) {
			const scale = worldRadius / enemyDistance;

			enemy.position.x *= scale;
			enemy.position.z *= scale;
		}
	}
}
