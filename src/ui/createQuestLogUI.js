export function createQuestLogUI(questManager, events) {
	const root = document.createElement('div');
	root.className = 'quest-log';

	root.innerHTML = `
    <div class="quest-log__panel">
      <header class="quest-log__header">
        <h2>Quest Journal</h2>
        <button class="quest-log__close" type="button">×</button>
      </header>

      <div class="quest-log__content"></div>
    </div>
  `;

	document.body.appendChild(root);

	const content = root.querySelector('.quest-log__content');
	const closeButton = root.querySelector('.quest-log__close');

	let opened = false;

	const STATUS_LABELS = {
		available: 'Available',
		active: 'In progress',
		ready_to_report: 'Ready to report',
		completed: 'Completed',
		locked: 'Locked',
	};

	function render() {
		content.replaceChildren();

		const quests = questManager.getQuests();

		for (const quest of quests) {
			const card = document.createElement('article');
			card.className = 'quest-log__item';

			const title = document.createElement('h3');
			title.textContent = quest.title;

			const status = document.createElement('span');
			status.className = `quest-log__status quest-log__status--${quest.status}`;
			status.textContent = STATUS_LABELS[quest.status] ?? quest.status;

			const description = document.createElement('p');
			description.textContent = quest.description;

			card.append(title, status, description);

			const objectives = document.createElement('ul');
			objectives.className = 'quest-log__objectives';

			for (const objective of quest.objectives) {
				const item = document.createElement('li');

				item.textContent = `${objective.description} — ${objective.progress}/${objective.required}`;

				if (objective.progress >= objective.required) {
					item.classList.add('quest-log__objective--completed');
				}

				objectives.appendChild(item);
			}

			card.appendChild(objectives);

			if (quest.reward?.gold) {
				const reward = document.createElement('p');
				reward.className = 'quest-log__reward';
				reward.textContent = `Reward: ${quest.reward.gold} gold`;

				card.appendChild(reward);
			}

			content.appendChild(card);
		}
	}

	function open() {
		render();
		root.classList.add('quest-log--visible');
		opened = true;
	}

	function close() {
		root.classList.remove('quest-log--visible');
		opened = false;
	}

	function toggle() {
		if (opened) {
			close();
		} else {
			open();
		}
	}

	closeButton.addEventListener('click', close);

	const unsubscribers = [
		events.on('quest:accepted', render),
		events.on('quest:updated', render),
		events.on('quest:available', render),
		events.on('quest:completed', render),
	];

	return {
		open,
		close,
		toggle,
		isOpen: () => opened,

		dispose() {
			for (const unsubscribe of unsubscribers) {
				unsubscribe();
			}

			root.remove();
		},
	};
}
