const MOVEMENT_KEYS = new Set([
	'KeyW',
	'KeyA',
	'KeyS',
	'KeyD',
	'ArrowUp',
	'ArrowLeft',
	'ArrowDown',
	'ArrowRight',
	'Space',
	'KeyE',
	'KeyI',
	'KeyJ',
]);

export function createInput(target = window) {
	const pressed = new Set();
	const justPressed = new Set();

	function onKeyDown(event) {
		if (MOVEMENT_KEYS.has(event.code)) {
			event.preventDefault();
		}

		// Регистрируем только первое нажатие, а не повторное событие удержания.
		if (!pressed.has(event.code)) {
			justPressed.add(event.code);
		}

		pressed.add(event.code);
	}

	function onKeyUp(event) {
		pressed.delete(event.code);
	}

	function onBlur() {
		pressed.clear();
		justPressed.clear();
	}

	target.addEventListener('keydown', onKeyDown);
	target.addEventListener('keyup', onKeyUp);
	window.addEventListener('blur', onBlur);

	return {
		isDown(...codes) {
			return codes.some(code => pressed.has(code));
		},

		wasPressed(code) {
			return justPressed.has(code);
		},

		endFrame() {
			justPressed.clear();
		},

		dispose() {
			target.removeEventListener('keydown', onKeyDown);
			target.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('blur', onBlur);

			pressed.clear();
			justPressed.clear();
		},
	};
}
