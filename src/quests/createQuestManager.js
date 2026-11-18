import { QUESTS } from './questDefinitions.js';

export function createQuestManager(events, { inventory, wallet }) {
	const quests = new Map();

	// Initialize quests and their objectives.
	for (const definition of Object.values(QUESTS)) {
		quests.set(definition.id, {
			...definition,

			status: definition.requires?.length ? 'locked' : 'available',

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
			objectives: quest.objectives.map(objective => ({ ...objective })),
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

		events.emit('quest:accepted', { questId });

		events.emit('quest:updated', {
			questId,
			status: quest.status,
		});

		return true;
	}

	function updateObjective(objective, payload = {}) {
		if (objective.progress >= objective.required) return;

		// Check whether the event payload matches the objective.
		const matches = Object.entries(objective.match ?? {}).every(
			([key, value]) => payload[key] === value
		);

		if (!matches) return;

		const amount = payload.amount ?? 1;

		objective.progress = Math.min(
			objective.progress + amount,
			objective.required
		);
	}

	function updateQuestProgress(quest) {
		// Turn-in objectives are completed only when reporting the quest.
		const regularObjectives = quest.objectives.filter(
			objective => !objective.turnIn
		);

		const completed = regularObjectives.every(
			objective => objective.progress >= objective.required
		);

		if (!completed || quest.status !== 'active') return;

		quest.status = 'ready_to_report';

		events.emit('quest:updated', {
			questId: quest.id,
			status: quest.status,
		});

		events.emit('quest:readyToReport', {
			questId: quest.id,
		});
	}

	function handleGameEvent(eventName, payload) {
		for (const quest of quests.values()) {
			if (quest.status !== 'active') continue;

			for (const objective of quest.objectives) {
				if (objective.event !== eventName) continue;

				updateObjective(objective, payload);
			}

			updateQuestProgress(quest);
		}
	}

	function unlockAvailableQuests() {
		for (const quest of quests.values()) {
			if (quest.status !== 'locked') continue;

			const requirementsMet = (quest.requires ?? []).every(
				requiredQuestId => quests.get(requiredQuestId)?.status === 'completed'
			);

			if (!requirementsMet) continue;

			quest.status = 'available';

			events.emit('quest:available', {
				questId: quest.id,
			});
		}
	}

	function reportQuest(questId) {
		const quest = quests.get(questId);

		if (!quest || quest.status !== 'ready_to_report') {
			return false;
		}

		// Validate all turn-in objectives before consuming anything.
		for (const objective of quest.objectives) {
			if (!objective.turnIn) continue;

			const { itemId } = objective.turnIn;

			if (inventory.getItemCount(itemId) < objective.required) {
				return false;
			}
		}

		// Consume required items.
		for (const objective of quest.objectives) {
			if (!objective.turnIn) continue;

			const { itemId } = objective.turnIn;

			const removed = inventory.removeItem(itemId, objective.required);

			if (!removed) {
				throw new Error(`Failed to remove quest item: ${itemId}`);
			}

			objective.progress = objective.required;
		}

		// Apply rewards.
		if (quest.reward?.gold) {
			wallet.addGold(quest.reward.gold);
		}

		quest.status = 'completed';

		events.emit('quest:completed', { questId });

		events.emit('quest:updated', {
			questId,
			status: quest.status,
		});

		unlockAvailableQuests();

		return true;
	}

	// Subscribe to all event types used by quest objectives.
	const eventNames = new Set();

	for (const quest of quests.values()) {
		for (const objective of quest.objectives) {
			if (objective.event) {
				eventNames.add(objective.event);
			}
		}
	}

	const unsubscribers = [...eventNames].map(eventName =>
		events.on(eventName, payload => {
			handleGameEvent(eventName, payload);
		})
	);

	function dispose() {
		for (const unsubscribe of unsubscribers) {
			unsubscribe();
		}
	}

	return {
		getQuest,
		getQuests,
		acceptQuest,
		reportQuest,
		dispose,
	};
}
