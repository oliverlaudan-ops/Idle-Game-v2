export function updateUI(currencies) {
  document.getElementById('currency-display').textContent = 
    `Punkte: ${currencies.points} (Prod: ${currencies.productionPerSecond}/s)`;
  
  const generatorsDiv = document.getElementById('generators');
  const cost = currencies.generatorCost();
  generatorsDiv.innerHTML = `
    <div>Generator: ${currencies.generators} (${currencies.productionPerSecond}/s)</div>
    <button onclick="game.currencies.buyGenerator()">
      Kaufen (Kosten: ${cost})
    </button>
  `;
}
