export function updateNpcInteraction({ npc, player, input, onInteract }) {
	if (!input.wasPressed('KeyE')) return;

	const distance = Math.hypot(
		player.position.x - npc.position.x,
		player.position.z - npc.position.z
	);

	if (distance > npc.interactionRadius) return;

	onInteract();
}
