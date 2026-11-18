import { createDrop } from '../entities/createDrop.js';

const LOOT_TABLES = {
	wolf: [
		{
			itemId: 'wolf_fang',
			chance: 0.7,
			amount: 1,
		},
		{
			itemId: 'wolf_pelt',
			chance: 0.4,
			amount: 1,
		},
	],

	wolf_chief: [
		{
			itemId: 'wolf_chief_fang',
			chance: 1,
			amount: 1,
		},
		{
			itemId: 'wolf_pelt',
			chance: 1,
			amount: 2,
		},
	],
};

export function updateEnemyDrops(enemies, drops, scene) {
	for (const enemy of enemies) {
		if (enemy.state !== 'dead' || enemy.dropSpawned) {
			continue;
		}

		// Mark enemy before generating loot.
		enemy.dropSpawned = true;

		const lootTable = LOOT_TABLES[enemy.type] ?? LOOT_TABLES.wolf;

		for (const loot of lootTable) {
			if (Math.random() > loot.chance) {
				continue;
			}

			const offsetX = (Math.random() - 0.5) * 0.8;
			const offsetZ = (Math.random() - 0.5) * 0.8;

			const drop = createDrop(scene, {
				x: enemy.position.x + offsetX,
				z: enemy.position.z + offsetZ,
				itemId: loot.itemId,
				amount: loot.amount,
			});

			drops.push(drop);
		}
	}
}
