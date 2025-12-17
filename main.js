// main.js – Entry Point (v2)

import Game from './src/modules/core.js';
import { initializeGame } from './src/ui/ui-init.js';

import gameState from './src/modules/game-state.js';
import {
  calculateOfflineProgress,
  applyOfflineProgress,
  formatDuration,
  shouldShowOfflineProgress
} from './src/modules/offline-progress.js';

// ========== Global Game Instance ==========

let gameInstance = null;

// ========== Game Start ==========

function startGame() {
  console.log('🚀 Starte Idle Game...');
  
  try {
    // Game-Instanz erstellen
    gameInstance = new Game();
    
    // Vollständige Initialisierung
    initializeGame(gameInstance);
    
    // Offline-Progress prüfen ← NEU
    checkOfflineProgress(gameInstance);
    
    // Global verfügbar machen (für Debugging in Console)
    window.game = gameInstance;
    window.gameState = gameState;
    
    console.log('✨ Game erfolgreich gestartet!');
    console.log('💡 Tipp: Du kannst "game" und "gameState" in der Console verwenden');
    
  } catch (error) {
    console.error('❌ Fehler beim Starten des Spiels:', error);
    showErrorScreen(error);
  }
}

// ========== Offline Progress Check ========== NEU

function checkOfflineProgress(game) {
  const now = Date.now();
  const lastOnline = gameState.lastOnline || now;
  const offlineTimeMs = now - lastOnline;
  const offlineTimeSec = Math.floor(offlineTimeMs / 1000);
  
  console.log(`⏰ Offline-Zeit: ${formatDuration(offlineTimeSec)}`);
  
  if (shouldShowOfflineProgress(offlineTimeSec)) {
    const progress = calculateOfflineProgress(game, offlineTimeSec);
    applyOfflineProgress(game, progress);
    showOfflineModal(progress);
  }
  
  // Zeitstempel aktualisieren
  gameState.lastOnline = now;
  gameState.save();
}

function showOfflineModal(progress) {
  const modal = document.createElement('div');
  modal.className = 'offline-modal-overlay';
  
  const content = document.createElement('div');
  content.className = 'offline-modal';
  
  let earningsList = '';
  for (let key in progress.earnings) {
    const amount = progress.earnings[key];
    if (amount > 0) {
      const resource = gameInstance.getResource(key);
      earningsList += `<div class="offline-earning">
        <span>${resource.icon} ${resource.name}:</span>
        <strong>+${formatAmount(amount)}</strong>
      </div>`;
    }
  }
  
  content.innerHTML = `
    <h2>💤 Willkommen zurück!</h2>
    <p class="offline-time">Du warst <strong>${formatDuration(progress.time)}</strong> offline</p>
    <p class="offline-efficiency">Offline-Effizienz: <strong>${(progress.efficiency * 100).toFixed(0)}%</strong></p>
    
    <div class="offline-earnings">
      <h3>Gesammelte Ressourcen:</h3>
      ${earningsList}
    </div>
    
    ${progress.wasCapped ? '<p class="offline-warning">⚠️ Maximal 8 Stunden werden berechnet</p>' : ''}
    
    <button class="offline-close-btn" onclick="this.closest('.offline-modal-overlay').remove()">
      Weiter spielen
    </button>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  console.log('💤 Offline-Progress angezeigt:', progress);
}

// ========== Error Handling ==========

function showErrorScreen(error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #f44336;
    color: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    z-index: 99999;
    max-width: 500px;
  `;
  
  errorDiv.innerHTML = `
    <h2>⚠️ Fehler beim Laden</h2>
    <p>${error.message}</p>
    <p style="font-size: 0.9em; margin-top: 20px;">
      Bitte überprüfe die Browser-Console für Details.
    </p>
    <button onclick="location.reload()" style="
      margin-top: 20px;
      padding: 10px 20px;
      background: white;
      color: #f44336;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    ">Seite neu laden</button>
  `;
  
  document.body.appendChild(errorDiv);
}

// Hilfsfunktion für Formatierung (von ui-render importieren oder hier duplizieren)
function formatAmount(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(0);
}

// ========== Page Load Event ==========

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startGame);
} else {
  // DOM bereits geladen
  startGame();
}

// ========== Page Unload - Autosave ==========

window.addEventListener('beforeunload', () => {
  if (gameInstance) {
    gameInstance.syncToState();
    gameState.save();
    console.log('💾 Spiel vor dem Schließen gespeichert');
  }
});

// ========== Visibility Change - Pause/Resume ==========

document.addEventListener('visibilitychange', () => {
  if (!gameInstance) return;
  
  if (document.hidden) {
    console.log('⏸️ Tab inaktiv - Game Loop pausiert');
    gameInstance.stopGameLoop();
    gameInstance.syncToState();
    gameState.save();
  } else {
    console.log('▶️ Tab aktiv - Game Loop fortgesetzt');
    
    // Offline-Progress beim Zurückkehren prüfen
    checkOfflineProgress(gameInstance);
    
    gameInstance.startGameLoop();
  }
});

// ========== Export für andere Module ==========

export function getGameInstance() {
  return gameInstance;
}

export { gameInstance };
