import { CurrencyManager } from './src/currencies.js';
import { LayerManager } from './src/layers.js';
import { updateUI } from './src/ui.js';

const currencies = new CurrencyManager();
const layers = new LayerManager(currencies);
let lastTime = 0;

function gameLoop(time) {
  const delta = (time - lastTime) / 1000;
  currencies.update(delta);
  layers.checkUnlocks();
  updateUI(currencies, layers);
  lastTime = time;
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
