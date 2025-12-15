import { CurrencyManager } from './src/currencies.js';
import { LayerManager } from './src/layers.js';
import { updateUI } from './src/ui.js';

export const game = {
  currencies: new CurrencyManager(),
  layers: new LayerManager()
};

let lastTime = 0;

function gameLoop(time) {
  const delta = (time - lastTime) / 1000;
  game.currencies.update(delta);
  game.layers.checkUnlocks();
  updateUI(game.currencies, game.layers);
  lastTime = time;
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
