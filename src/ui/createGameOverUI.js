export function createGameOverUI({ onRespawn }) {
	const overlay = document.createElement('div');
	overlay.className = 'game-over';

	overlay.innerHTML = `
    <div class="game-over__panel">
      <div class="game-over__eyebrow">YOUR JOURNEY ENDS HERE</div>

      <h1 class="game-over__title">YOU DIED</h1>

      <div class="game-over__divider"></div>

      <p class="game-over__description">
        The wilderness has claimed another life.
      </p>

      <button class="game-over__button">
        <span>RESPAWN</span>
        <span class="game-over__arrow">→</span>
      </button>

      <div class="game-over__footer">
        YOUR ADVENTURE IS NOT OVER
      </div>
    </div>
  `;

	document.body.appendChild(overlay);

	const respawnButton = overlay.querySelector('.game-over__button');

	respawnButton.addEventListener('click', () => {
		hide();
		onRespawn();
	});

	function show() {
		overlay.classList.add('game-over--visible');
	}

	function hide() {
		overlay.classList.remove('game-over--visible');
	}

	function isOpen() {
		return overlay.classList.contains('game-over--visible');
	}

	function dispose() {
		respawnButton.removeEventListener('click', hide);
		overlay.remove();
	}

	return {
		show,
		hide,
		isOpen,
		dispose,
	};
}
