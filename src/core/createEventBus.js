export function createEventBus() {
	const listeners = new Map();

	function on(eventName, callback) {
		if (!listeners.has(eventName)) {
			listeners.set(eventName, new Set());
		}

		listeners.get(eventName).add(callback);

		// Возвращаем функцию отписки.
		return () => {
			listeners.get(eventName)?.delete(callback);
		};
	}

	function emit(eventName, payload) {
		const callbacks = listeners.get(eventName);

		if (!callbacks) return;

		for (const callback of callbacks) {
			callback(payload);
		}
	}

	function dispose() {
		listeners.clear();
	}

	return {
		on,
		emit,
		dispose,
	};
}
