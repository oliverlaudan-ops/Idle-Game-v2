import { CurrencyManager } from './src/currencies.js';
import { LayerManager } from './src/layers.js';
import { updateUI } from './src/ui.js';
import { startGameLoop } from './src/gameLoop.js';

export const game = {
  currencies: new CurrencyManager(),
  layers: new LayerManager()
};

window.game = game;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('game-container');
  container.innerHTML = `
    <div id="currency-display">Punkte: 0</div>
    <button id="click-btn" type="button">Klicken (+1)</button>

    <div id="generators-container">
      <div id="generators-info" style="margin-bottom :10px"></div>
      <button id="buy-generator-btn" type="button">Generator kaufen</button>
    </div>

    <div id="layers-container"></div>
  `;

  document.getElementById('click-btn').onclick = () => game.currencies.click();
  document.getElementById('buy-generator-btn').onclick = () => game.currencies.buyGenerator();

  // Erstes UI-Update
  updateUI(game);

  const gameLoop = startGameLoop(game, updateUI);
  requestAnimationFrame(gameLoop);
});
