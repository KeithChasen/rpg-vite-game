const MOVEMENT_KEYS = new Set([
	'KeyW',
	'KeyA',
	'KeyS',
	'KeyD',
	'ArrowUp',
	'ArrowLeft',
	'ArrowDown',
	'ArrowRight',
]);

export function createInput(target = window) {
	const pressed = new Set();

	function onKeyDown(event) {
		if (MOVEMENT_KEYS.has(event.code)) {
			event.preventDefault();
		}

		pressed.add(event.code);
	}

	function onKeyUp(event) {
		pressed.delete(event.code);
	}

	function onBlur() {
		pressed.clear();
	}

	target.addEventListener('keydown', onKeyDown);
	target.addEventListener('keyup', onKeyUp);
	window.addEventListener('blur', onBlur);

	return {
		isDown(...codes) {
			return codes.some(code => pressed.has(code));
		},

		dispose() {
			target.removeEventListener('keydown', onKeyDown);
			target.removeEventListener('keyup', onKeyUp);
			window.removeEventListener('blur', onBlur);
			pressed.clear();
		},
	};
}
