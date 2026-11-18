export function createWallet(initialGold = 0) {
	let gold = initialGold;

	function addGold(amount) {
		if (amount <= 0) return;

		gold += amount;
	}

	function removeGold(amount) {
		if (amount <= 0 || gold < amount) {
			return false;
		}

		gold -= amount;
		return true;
	}

	function getGold() {
		return gold;
	}

	return {
		addGold,
		removeGold,
		getGold,
	};
}
