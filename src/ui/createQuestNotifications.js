export function createQuestNotifications(events, questManager) {
	const root = document.createElement('div');
	root.className = 'quest-notifications';

	document.body.appendChild(root);

	const timers = new Set();

	function show(message) {
		const notification = document.createElement('div');
		notification.className = 'quest-notification';
		notification.textContent = message;

		root.appendChild(notification);

		requestAnimationFrame(() => {
			notification.classList.add('quest-notification--visible');
		});

		const timer = window.setTimeout(() => {
			notification.classList.remove('quest-notification--visible');

			window.setTimeout(() => {
				notification.remove();
			}, 300);

			timers.delete(timer);
		}, 3500);

		timers.add(timer);
	}

	function getTitle(questId) {
		return questManager.getQuest(questId)?.title ?? questId;
	}

	const unsubscribers = [
		events.on('quest:accepted', ({ questId }) => {
			show(`Quest started: ${getTitle(questId)}`);
		}),

		events.on('quest:readyToReport', ({ questId }) => {
			show(`Quest updated: ${getTitle(questId)} — return to the NPC.`);
		}),

		events.on('quest:available', ({ questId }) => {
			show(`New quest available: ${getTitle(questId)}`);
		}),

		events.on('quest:completed', ({ questId }) => {
			show(`Quest completed: ${getTitle(questId)}!`);
		}),
	];

	return {
		dispose() {
			for (const unsubscribe of unsubscribers) {
				unsubscribe();
			}

			for (const timer of timers) {
				window.clearTimeout(timer);
			}

			root.remove();
		},
	};
}
