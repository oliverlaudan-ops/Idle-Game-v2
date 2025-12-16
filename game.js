// deployment Test
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
      <div id="generators-info"></div>
      <button id="buy-generator-btn" type="button">Generator kaufen</button>
    </div>

    <div id="upgrades-container">
      <div id="upgrades-info"></div>
    </div>

    <div id="layers-container"></div>
  `;

  // NUR Event Handler für statische Buttons (die wirklich existieren)
  document.getElementById('click-btn').onclick = () => game.currencies.click();
  document.getElementById('buy-generator-btn').onclick = () => game.currencies.buyGenerator();

  // ❌ Upgrade-Buttons dynamisch → KEINE Handler hier!

  updateUI(game);
  const gameLoop = startGameLoop(game, updateUI);
  requestAnimationFrame(gameLoop);
});
