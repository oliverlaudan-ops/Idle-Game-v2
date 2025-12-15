export function updateUI(game) {
  const currencies = game.currencies;
  const layers = game.layers;
  
  document.getElementById('currency-display').textContent = 
    `Punkte: ${currencies.points} (Prod: ${currencies.productionPerSecond}/s)`;
  
  // Generatoren
  const generatorsDiv = document.getElementById('generators-container');
  const cost = currencies.generatorCost();
  generatorsDiv.innerHTML = `
    <div>Generator: ${currencies.generators} (${currencies.productionPerSecond}/s)</div>
    <button onclick="game.currencies.buyGenerator()">
      Kaufen (Kosten: ${cost})
    </button>
  `;
  
  // Layers anzeigen
  const layersDiv = document.getElementById('layers-container');
  layersDiv.innerHTML = layers.unlockedLayers.map(layer => 
    `<div>Layer ${layer.id}: ${layer.name} ${layer.unlocked ? '✅' : '🔒'}</div>`
  ).join('');
}
