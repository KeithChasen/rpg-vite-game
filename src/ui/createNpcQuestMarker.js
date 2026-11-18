import * as THREE from 'three';

export function createNpcQuestMarker(npc, questManager, events) {
	const canvas = document.createElement('canvas');
	canvas.width = 128;
	canvas.height = 128;

	const context = canvas.getContext('2d');
	const texture = new THREE.CanvasTexture(canvas);

	const sprite = new THREE.Sprite(
		new THREE.SpriteMaterial({
			map: texture,
			transparent: true,
			depthTest: false,
		})
	);

	sprite.position.set(0, 3.5, 0);
	sprite.scale.set(1.1, 1.1, 1);
	sprite.renderOrder = 10;

	npc.root.add(sprite);

	function update() {
		const quests = questManager.getQuests();

		// Priority: report > available > active.
		const priority = {
			ready_to_report: 3,
			available: 2,
			active: 1,
		};

		const relevantQuest = quests
			.filter(quest => priority[quest.status])
			.sort((a, b) => priority[b.status] - priority[a.status])[0];

		context.clearRect(0, 0, 128, 128);

		if (!relevantQuest) {
			sprite.visible = false;
			texture.needsUpdate = true;
			return;
		}

		sprite.visible = true;

		const marker = {
			available: { symbol: '!', color: '#e5b94c' },
			ready_to_report: { symbol: '?', color: '#78c99a' },
			active: { symbol: '…', color: '#8ba4c7' },
		}[relevantQuest.status];

		context.beginPath();
		context.arc(64, 64, 49, 0, Math.PI * 2);
		context.fillStyle = marker.color;
		context.fill();

		context.lineWidth = 6;
		context.strokeStyle = '#252a32';
		context.stroke();

		context.fillStyle = '#252a32';
		context.font = 'bold 76px Arial';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(marker.symbol, 64, 66);

		texture.needsUpdate = true;
	}

	const unsubscribers = [
		events.on('quest:accepted', update),
		events.on('quest:updated', update),
		events.on('quest:available', update),
		events.on('quest:completed', update),
	];

	update();

	return {
		update,

		dispose() {
			for (const unsubscribe of unsubscribers) {
				unsubscribe();
			}

			npc.root.remove(sprite);
			texture.dispose();
			sprite.material.dispose();
		},
	};
}
