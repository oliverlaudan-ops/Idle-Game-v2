export function updateUI(game) {
  const currencies = game.currencies;

  const currencyDisplay = document.getElementById('currency-display');
  const generatorsInfo = document.getElementById('generators-info');
  const buyBtn = document.getElementById('buy-generator-btn');
  const upgradesInfo = document.getElementById('upgrades-info');

  if (!currencyDisplay || !generatorsInfo || !buyBtn) return;

  currencyDisplay.textContent =
    `Punkte: ${currencies.points} (Prod: ${currencies.productionPerSecond}/s)`;

  const cost = currencies.generatorCost;

  generatorsInfo.textContent =
    `Generatoren: ${currencies.generators} (je ${currencies.baseProduction}/s) — Kosten: ${cost} Punkte`;

  buyBtn.disabled = currencies.points < cost;
  
  upgradesInfo.innerHTML = `
    <div>Klick-Power: x${currencies.clickPower}</div>
    <button id="buy-click-upgrade-btn" ${currencies.points < currencies.clickUpgradeCost ? 'disabled' : ''}>
      Klick x2 (Kosten: ${currencies.clickUpgradeCost})
    </button>
    <div>Generator-Multi: x${currencies.generatorMultiplier}</div>
    <button id="buy-generator-upgrade-btn" ${currencies.points < currencies.generatorUpgradeCost ? 'disabled' : ''}>
      Generator x2 (Kosten: ${currencies.generatorUpgradeCost})
    </button>
`;
}
