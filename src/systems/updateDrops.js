const PICKUP_RANGE = 1.8;

export function updateDrops({ drops, player, input, inventory }) {
	if (!input.isDown('KeyE')) return;

	for (let i = drops.length - 1; i >= 0; i--) {
		const drop = drops[i];

		const distance = Math.hypot(
			player.position.x - drop.position.x,
			player.position.z - drop.position.z
		);

		if (distance > PICKUP_RANGE) continue;

		inventory.addItem(drop.itemId, drop.amount);

		drop.dispose();
		drops.splice(i, 1);
	}
}
