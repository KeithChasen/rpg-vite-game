export const QUESTS = {
	wolf_hunt: {
		id: 'wolf_hunt',
		title: 'Wolf Hunt',
		description: 'Protect the settlement from the wolves.',

		objectives: [
			{
				id: 'kill_wolves',
				event: 'enemy:killed',
				match: { enemyType: 'wolf' },
				required: 5,
				description: 'Kill 5 wolves',
			},
		],

		reward: {
			gold: 0,
		},
	},

	wolf_chief: {
		id: 'wolf_chief',
		title: 'The Alpha',
		description: 'Kill the leader of the wolf pack and bring his fang.',

		requires: ['wolf_hunt'],

		objectives: [
			{
				id: 'kill_chief',
				event: 'enemy:killed',
				match: { enemyType: 'wolf_chief' },
				required: 1,
				description: 'Kill the wolf chief',
			},
			{
				id: 'deliver_fang',
				turnIn: {
					itemId: 'wolf_chief_fang',
				},
				required: 1,
				description: 'Bring the wolf chief fang',
			},
		],

		reward: {
			gold: 50,
		},
	},
};
