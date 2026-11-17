import './style.css';
import { createGame } from './core/createGame.js';

const game = createGame(document.querySelector('#app'));
game.start();

// Keep a reference while developing; later this will be managed by the game lifecycle.
if (import.meta.env.DEV) {
  window.game = game;
}
