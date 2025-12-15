export function updateUI(game) {
  const currencies = game.currencies;

  const currencyDisplay = document.getElementById('currency-display');
  const generatorsInfo = document.getElementById('generators-info');
  const buyBtn = document.getElementById('buy-generator-btn');

  if (!currencyDisplay || !generatorsInfo || !buyBtn) return;

  currencyDisplay.textContent =
    `Punkte: ${currencies.points} (Prod: ${currencies.productionPerSecond}/s)`;

  const cost = currencies.generatorCost;

  generatorsInfo.textContent =
    `Generatoren: ${currencies.generators} (je ${currencies.baseProduction}/s) — Kosten: ${cost} Punkte`;

  buyBtn.disabled = currencies.points < cost;
}
