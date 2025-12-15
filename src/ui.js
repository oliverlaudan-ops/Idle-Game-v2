export function updateUI(currencies, layers) {
  document.getElementById('currency-display').textContent = 
    `Punkte: ${currencies.points}`;
  
  const generatorsDiv = document.getElementById('generators');
  generatorsDiv.innerHTML = `
    <button onclick="game.currencies.addGenerator()">
      Generator kaufen (Kosten: ${game.currencies.points.generators * 10 + 10})
    </button>
  `;
}

