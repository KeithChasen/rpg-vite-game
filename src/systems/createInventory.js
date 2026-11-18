export function createInventory() {
	const items = new Map();

	function addItem(itemId, amount = 1) {
		const currentAmount = items.get(itemId) ?? 0;
		items.set(itemId, currentAmount + amount);
	}

	function getItemCount(itemId) {
		return items.get(itemId) ?? 0;
	}

	function getItems() {
		return Object.fromEntries(items);
	}

	function removeItem(itemId, amount = 1) {
		const currentAmount = items.get(itemId) ?? 0;

		if (currentAmount < amount) {
			return false;
		}

		const newAmount = currentAmount - amount;

		if (newAmount === 0) {
			items.delete(itemId);
		} else {
			items.set(itemId, newAmount);
		}

		return true;
	}

	return {
		addItem,
		getItemCount,
		getItems,
		removeItem,
	};
}
