import { CurrencyManager } from './src/currencies.js';
import { updateUI } from './src/ui.js';
import { startGameLoop } from './src/gameLoop.js';

export const game = {
  currencies: new CurrencyManager()
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <div id="currency-display">Punkte: 0</div>
    <button id="click-btn">Klicken (+1)</button>
    <div id="generators-container"></div>
  `;
  
  document.getElementById('click-btn').onclick = () => game.currencies.click();
  
  const gameLoop = startGameLoop(game, updateUI);
  requestAnimationFrame(gameLoop);
});
