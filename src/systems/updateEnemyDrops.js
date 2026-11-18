import { createDrop } from '../entities/createDrop.js';

const LOOT_TABLE = [
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
];

export function updateEnemyDrops(enemies, drops, scene) {
	for (const enemy of enemies) {
		if (enemy.state !== 'dead' || enemy.dropSpawned) {
			continue;
		}

		// Помечаем врага до генерации предметов.
		enemy.dropSpawned = true;

		for (const loot of LOOT_TABLE) {
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
