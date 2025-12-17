/**
 * ui-init.js
 * UI-Initialisierung, Event-Listener und DOM-Setup
 */

// Modul Import
import {
  renderAll,
  renderStatsBar,
  renderUpgrades,
  renderAchievements,
  showAchievementNotification
} from './ui-render.js';

import gameState from '../modules/game-state.js';

// ========== DOM Setup ==========

export function setupDOM(game) {
  // DOM-Elemente in Game-Instanz speichern
  game.statsBarEl = document.getElementById('statsBar');
  game.actionsEl = document.getElementById('actions');
  game.upgradeGridEl = document.getElementById('upgradeGrid');
  game.researchGridEl = document.getElementById('researchGrid');
  
  // Tab-Switching einrichten
  setupTabs();
  
  // Window-Resize-Handler für sticky Actions
  setupResizeHandler();
  
  // Autosave einrichten
  setupAutosave(game);

  setupSaveButtons(game); // <— NEU
}

// ========= Utility-Buttons ======
function setupSaveButtons(game) {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const resetBtn  = document.getElementById('resetBtn');
  const saveField = document.getElementById('saveString');
   // Export-Button 
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      game.syncToState();
      const encoded = gameState.export();
      if (saveField) saveField.value = encoded;
      navigator.clipboard?.writeText(encoded).catch(() => {});
      showNotification('Spielstand exportiert (in Feld & evtl. Zwischenablage).');
    });
  }
  // Import-Button
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      if (!saveField || !saveField.value.trim()) return;
      try {
        gameState.import(saveField.value.trim());
        game.syncFromState();
        game.recalculateResourceBonuses();
        renderAll(game);
        showNotification('Spielstand importiert!');
      } catch (e) {
        showNotification('Fehler: Ungültiger Spielstand.');
      }
    });
  }

  if (resetBtn) {
  // ui-init.js – im setupSaveButtons(game)
  resetBtn.addEventListener('click', () => {
    if (!confirm('Spiel wirklich vollständig zurücksetzen?')) return;
  
      localStorage.removeItem('gameState'); // nur hier
    
      gameState.reset();
      game.resources = {};
      game.upgrades = [];
      game.prestigeUpgrades = [];
      game.totalClicks = 0;
      game.prestigeCount = 0;
      game.totalPrestigePoints = 0;
      game.achievementPrestigeBonus = 1;
      game.startTime = Date.now();
    
      game.setupGameData();
      game.syncFromState();
      game.recalculateResourceBonuses();
    
      game.syncToState();
      gameState.save();
      renderAll(game);
      alert('Spiel vollständig zurückgesetzt!');
      });
    }
}

// ========== Tab-System ==========

function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      
      // Tab-Buttons aktualisieren
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Tab-Inhalte umschalten
      document.querySelectorAll('.upgrade-grid').forEach(grid => {
        if (grid.dataset.tab === target) {
          grid.style.display = 'flex'; // Flex für Spalten-Layout
        } else {
          grid.style.display = 'none';
        }
      });
      
      // Achievement-Container
      const achievementsContainer = document.getElementById('achievementsContainer');
      if (achievementsContainer) {
        if (target === 'achievements') {
          achievementsContainer.style.display = 'block';
        } else {
          achievementsContainer.style.display = 'none';
        }
      }
    });
  });
  
  // Standard-Tab aktivieren (erster Tab)
  if (tabButtons.length > 0) {
    tabButtons[0].click();
  }
}

// ========== Window Resize Handler ==========

function setupResizeHandler() {
  let resizeTimeout;
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      updateActionsStickyTop();
    }, 100);
  });
}

function updateActionsStickyTop() {
  const statsBar = document.querySelector('.stats-bar');
  const actions = document.querySelector('.actions');
  
  if (statsBar && actions) {
    const barHeight = statsBar.offsetHeight;
    actions.style.top = (barHeight + 12) + 'px';
  }
}

// ========== Autosave ==========

let autosaveCounter = 0;

function setupAutosave(game) {
  setInterval(() => {
    game.syncToState();
    gameState.save();
    autosaveCounter++;

    // Alle 2 Autosaves (1 Minute) kurzes Feedback
    if (autosaveCounter % 2 === 0) {
      showNotification('Spiel automatisch gespeichert.', 2000);
    }
  }, 30000);
}

// ========== Game Loop Callback ==========

export function setupGameLoop(game) {
  // Callback für Tick-Updates setzen
  game.onTick = () => {
    renderStatsBar(game);
    renderUpgrades(game);
  };
  
  // Game Loop starten
  game.startGameLoop();
}

// ========== Keyboard Shortcuts ==========

export function setupKeyboardShortcuts(game) {
  document.addEventListener('keydown', (e) => {
    // Strg+S: Manuelles Speichern
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      game.syncToState();
      gameState.save(); // ← WICHTIG!
      showNotification('Spiel gespeichert!');
    }
    
    // Strg+R: Vollständiges Re-Render
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      renderAll(game);
      showNotification('UI aktualisiert!');
    }
    
    // Zahlen 1-9: Schnell-Aktionen für Ressourcen
    if (e.key >= '1' && e.key <= '9') {
      const index = parseInt(e.key) - 1;
      const resources = Object.values(game.resources).filter(r => r.unlocked);
      
      if (resources[index]) {
        const btn = document.getElementById(resources[index].id + 'Btn');
        if (btn) btn.click();
      }
    }
  });
}

// ========== Notifications ==========

function showNotification(message, duration = 2000) {
  // Prüfen ob bereits eine Notification existiert
  let notification = document.getElementById('notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
  }
  
  notification.textContent = message;
  notification.style.display = 'block';
  
  // Nach duration ausblenden
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }, duration);
}

// ========== Initialization Helper ==========

export function initializeGame(game) {
  console.log('🎮 Initialisiere Spiel...');
  
  // 1. Game-Daten laden
  game.setupGameData();
  console.log('✅ Game-Daten geladen');
  
  // 2. Spielstand laden
  game.syncFromState();
  console.log('✅ Spielstand geladen');
  
  // 3. Achievements laden
  game.setupAchievements();
  console.log('✅ Achievements geladen');
  
  // 4. Achievement-Callback setzen
  game.onAchievementUnlock = (achievement) => {
    showAchievementNotification(achievement);
    renderAchievements(game);
    game.recalculateResourceBonuses();
    renderAll(game);
  };
  
  // 5. DOM einrichten
  setupDOM(game);
  console.log('✅ DOM eingerichtet');
  
  // 6. Initial rendern
  renderAll(game);
  renderAchievements(game);
  console.log('✅ UI gerendert');
  
  // 7. Game Loop starten
  setupGameLoop(game);
  console.log('✅ Game Loop gestartet');
  
  // 8. Keyboard Shortcuts
  setupKeyboardShortcuts(game);
  console.log('✅ Keyboard Shortcuts aktiviert');
  
  console.log('🎉 Spiel erfolgreich gestartet!');
}

// ========== CSS für Notifications ==========

// Animation für Notifications als Style-Tag einfügen
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
