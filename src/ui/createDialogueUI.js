export function createDialogueUI() {
	const root = document.createElement('div');
	root.className = 'dialogue';
	root.innerHTML = `
    <div class="dialogue__panel">
      <div class="dialogue__header">
        <h2 class="dialogue__speaker"></h2>
        <button class="dialogue__close" type="button">×</button>
      </div>

      <p class="dialogue__text"></p>
      <div class="dialogue__choices"></div>
    </div>
  `;

	document.body.appendChild(root);

	const speakerElement = root.querySelector('.dialogue__speaker');
	const textElement = root.querySelector('.dialogue__text');
	const choicesElement = root.querySelector('.dialogue__choices');
	const closeButton = root.querySelector('.dialogue__close');

	let opened = false;

	function close() {
		root.classList.remove('dialogue--visible');
		opened = false;
	}

	function open({ speaker, text, choices = [], onChoice }) {
		speakerElement.textContent = speaker;
		textElement.textContent = text;
		choicesElement.replaceChildren();

		for (const choice of choices) {
			const button = document.createElement('button');

			button.className = 'dialogue__choice';
			button.textContent = choice.text;
			button.type = 'button';

			button.addEventListener('click', () => {
				onChoice?.(choice.id);
			});

			choicesElement.appendChild(button);
		}

		root.classList.add('dialogue--visible');
		opened = true;
	}

	closeButton.addEventListener('click', close);

	return {
		open,
		close,
		isOpen: () => opened,
		dispose() {
			root.remove();
		},
	};
}
