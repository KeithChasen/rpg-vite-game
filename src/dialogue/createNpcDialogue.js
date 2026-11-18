export function createNpcDialogue({ dialogueUI, questManager }) {
	function close() {
		dialogueUI.close();
	}

	function open() {
		const wolfHunt = questManager.getQuest('wolf_hunt');
		const wolfChief = questManager.getQuest('wolf_chief');

		if (wolfHunt.status === 'available') {
			showWolfHuntOffer();
			return;
		}

		if (wolfHunt.status === 'active') {
			showDialogue(
				'Village Elder',
				'The wolves are still threatening our settlement. Please deal with them.'
			);
			return;
		}

		if (wolfHunt.status === 'ready_to_report') {
			showWolfHuntReport();
			return;
		}

		if (wolfChief.status === 'available') {
			showDialogue(
				'Village Elder',
				'You have done well. But the real threat is still out there. Find the wolf chief and bring me his fang.',
				[
					{
						id: 'accept',
						text: 'I will hunt down the chief.',
					},
					{
						id: 'refuse',
						text: 'Not now.',
					},
				],
				choiceId => {
					if (choiceId === 'accept') {
						questManager.acceptQuest('wolf_chief');
					}

					close();
				}
			);
			return;
		}

		if (wolfChief.status === 'active') {
			showDialogue(
				'Village Elder',
				'Find the wolf chief and bring me his fang. Be careful — he is stronger than the other wolves.'
			);
			return;
		}

		if (wolfChief.status === 'ready_to_report') {
			showDialogue(
				'Village Elder',
				'You have defeated the chief! Have you brought his fang?',
				[
					{
						id: 'report',
						text: 'Here is the fang.',
					},
					{
						id: 'refuse',
						text: 'I will return later.',
					},
				],
				choiceId => {
					if (choiceId === 'report') {
						const completed = questManager.reportQuest('wolf_chief');

						if (!completed) {
							showDialogue(
								'Village Elder',
								'You do not have the wolf chief fang. Bring it to me first.'
							);
							return;
						}
					}

					close();
				}
			);
			return;
		}

		showDialogue(
			'Village Elder',
			'Thank you for helping our settlement. You are always welcome here.'
		);
	}

	function showWolfHuntOffer() {
		showDialogue(
			'Village Elder',
			'The wolves have become a serious threat to our settlement. Will you help us?',
			[
				{
					id: 'accept',
					text: 'I will kill the wolves.',
				},
				{
					id: 'refuse',
					text: 'Not now.',
				},
			],
			choiceId => {
				if (choiceId === 'accept') {
					questManager.acceptQuest('wolf_hunt');
				}

				close();
			}
		);
	}

	function showWolfHuntReport() {
		showDialogue(
			'Village Elder',
			'Have you dealt with the wolves?',
			[
				{
					id: 'report',
					text: 'The wolves are dead.',
				},
			],
			() => {
				questManager.reportQuest('wolf_hunt');
				close();
			}
		);
	}

	function showDialogue(speaker, text, choices = [], onChoice) {
		dialogueUI.open({
			speaker,
			text,
			choices: choices.length ? choices : [{ id: 'close', text: 'Goodbye.' }],
			onChoice: choiceId => {
				onChoice?.(choiceId);
				if (!onChoice) close();
			},
		});
	}

	return {
		open,
		close,
	};
}
