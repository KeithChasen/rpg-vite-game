/**
 * Checks whether an enemy overlaps with an obstacle.
 */
function collidesWithObstacle(x, z, enemy, obstacles) {
	return obstacles.some(obstacle => {
		const distance = Math.hypot(x - obstacle.x, z - obstacle.z);

		return distance < enemy.collisionRadius + obstacle.radius;
	});
}

/**
 * Handles player attacks and enemy damage.
 */
export function updateCombat(
	player,
	input,
	enemies,
	deltaTime,
	obstacles = [],
	worldRadius = 35
) {
	// Update attack cooldown.
	player.attackTimer = Math.max(0, player.attackTimer - deltaTime);

	// No attack key or cooldown still active.
	if (!input.isDown('Space') || player.attackTimer > 0) {
		return;
	}

	// Start attack cooldown.
	player.attackTimer = player.attackCooldown;

	// Calculate player's forward direction.
	const forwardX = -Math.sin(player.root.rotation.y);
	const forwardZ = -Math.cos(player.root.rotation.y);

	for (const enemy of enemies) {
		if (enemy.state === 'dead') continue;

		// Direction from player to enemy.
		const dx = enemy.position.x - player.position.x;
		const dz = enemy.position.z - player.position.z;

		const distance = Math.hypot(dx, dz);

		// Check attack range.
		if (distance > player.attackRange + enemy.collisionRadius) {
			continue;
		}

		// Normalize direction to enemy.
		const directionX = dx / distance;
		const directionZ = dz / distance;

		// Check whether enemy is in front of player.
		const dot = forwardX * directionX + forwardZ * directionZ;

		if (dot < 0.35) continue;

		// Apply damage.
		enemy.hp = Math.max(0, enemy.hp - player.attackDamage);

		// Update visual health bar.
		enemy.updateHealthBar(enemy.hp, enemy.maxHp);

		// Trigger hit reaction.
		enemy.hitTimer = 0.18;

		// Knockback direction.
		const knockbackDistance = 0.7;

		const knockbackX = directionX * knockbackDistance;
		const knockbackZ = directionZ * knockbackDistance;

		// Apply knockback along X.
		const nextX = enemy.position.x + knockbackX;

		if (!collidesWithObstacle(nextX, enemy.position.z, enemy, obstacles)) {
			enemy.position.x = nextX;
		}

		// Apply knockback along Z.
		const nextZ = enemy.position.z + knockbackZ;

		if (!collidesWithObstacle(enemy.position.x, nextZ, enemy, obstacles)) {
			enemy.position.z = nextZ;
		}

		// Keep enemy inside the island.
		const enemyDistance = Math.hypot(enemy.position.x, enemy.position.z);

		if (enemyDistance > worldRadius) {
			const scale = worldRadius / enemyDistance;

			enemy.position.x *= scale;
			enemy.position.z *= scale;
		}

		// Handle enemy death.
		if (enemy.hp <= 0) {
			enemy.state = 'dead';
			enemy.deathTimer = enemy.deathDuration;
		}
	}
}
