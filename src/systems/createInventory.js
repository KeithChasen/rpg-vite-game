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

	return {
		addItem,
		getItemCount,
		getItems,
	};
}
