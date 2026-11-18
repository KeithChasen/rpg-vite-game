import { QUESTS } from './questDefinitions.js';

export function createQuestManager(events) {
	const quests = new Map();

	for (const definition of Object.values(QUESTS)) {
		quests.set(definition.id, {
			...definition,

			status: definition.id === 'wolf_hunt' ? 'available' : 'locked',

			objectives: definition.objectives.map(objective => ({
				...objective,
				progress: 0,
			})),
		});
	}

	function getQuest(questId) {
		const quest = quests.get(questId);

		if (!quest) return null;

		return {
			...quest,
			objectives: quest.objectives.map(objective => ({
				...objective,
			})),
		};
	}

	function getQuests() {
		return [...quests.keys()].map(getQuest);
	}

	function acceptQuest(questId) {
		const quest = quests.get(questId);

		if (!quest || quest.status !== 'available') {
			return false;
		}

		quest.status = 'active';

		events.emit('quest:accepted', {
			questId,
		});

		return true;
	}

	function updateObjective(type, target, amount = 1) {
		for (const quest of quests.values()) {
			if (quest.status !== 'active') continue;

			for (const objective of quest.objectives) {
				if (objective.type !== type) continue;

				const matchesTarget =
					type === 'kill'
						? objective.target === target
						: objective.itemId === target;

				if (!matchesTarget) continue;

				objective.progress = Math.min(
					objective.progress + amount,
					objective.required
				);
			}

			const completed = quest.objectives.every(
				objective => objective.progress >= objective.required
			);

			if (completed) {
				quest.status = 'ready_to_report';

				events.emit('quest:readyToReport', {
					questId: quest.id,
				});
			}
		}
	}

	function reportWolfHunt() {
		const quest = quests.get('wolf_hunt');

		if (quest.status !== 'ready_to_report') {
			return false;
		}

		quest.status = 'completed';

		const nextQuest = quests.get('wolf_chief');
		nextQuest.status = 'available';

		events.emit('quest:completed', {
			questId: 'wolf_hunt',
		});

		events.emit('quest:available', {
			questId: 'wolf_chief',
		});

		return true;
	}

	function reportWolfChief(inventory, wallet) {
		const quest = quests.get('wolf_chief');

		if (!quest || quest.status !== 'active') {
			return false;
		}

		const fangObjective = quest.objectives.find(
			objective => objective.id === 'deliver_fang'
		);

		if (!fangObjective || inventory.getItemCount('wolf_chief_fang') < 1) {
			return false;
		}

		inventory.removeItem('wolf_chief_fang', 1);

		quest.objectives.find(
			objective => objective.id === 'kill_chief'
		).progress = 1;

		fangObjective.progress = 1;

		quest.status = 'completed';

		wallet.addGold(quest.reward.gold);

		events.emit('quest:completed', {
			questId: 'wolf_chief',
		});

		return true;
	}

	const unsubscribeKill = events.on('enemy:killed', ({ enemyType }) => {
		updateObjective('kill', enemyType);
	});

	function dispose() {
		unsubscribeKill();
	}

	return {
		getQuest,
		getQuests,
		acceptQuest,
		reportWolfHunt,
		reportWolfChief,
		dispose,
	};
}
