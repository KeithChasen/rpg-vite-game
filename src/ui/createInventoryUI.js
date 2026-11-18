import { ITEMS } from '../world/items.js';

export function createInventoryUI(inventory) {
	const element = document.createElement('div');

	element.className = 'inventory hidden';

	element.innerHTML = `
    <div class="inventory-panel">
      <div class="inventory-header">
        <h2>Inventory</h2>
        <span class="inventory-hint">Press I to close</span>
      </div>

      <div class="inventory-grid"></div>
    </div>
  `;

	document.body.appendChild(element);

	const grid = element.querySelector('.inventory-grid');

	function render() {
		grid.innerHTML = '';

		const items = inventory.getItems();

		for (const [itemId, amount] of Object.entries(items)) {
			const item = ITEMS[itemId];

			if (!item) continue;

			const slot = document.createElement('div');
			slot.className = 'inventory-slot';

			slot.innerHTML = `
        <div class="inventory-icon">${item.icon}</div>
        <div class="inventory-item-name">${item.name}</div>
        <div class="inventory-item-amount">x${amount}</div>
      `;

			slot.title = item.description;

			grid.appendChild(slot);
		}
	}

	function open() {
		render();
		element.classList.remove('hidden');
	}

	function close() {
		element.classList.add('hidden');
	}

	function toggle() {
		if (element.classList.contains('hidden')) {
			open();
		} else {
			close();
		}
	}

	function dispose() {
		element.remove();
	}

	return {
		open,
		close,
		toggle,
		dispose,
	};
}
