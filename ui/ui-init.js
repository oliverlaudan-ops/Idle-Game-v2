/**
 * ui-init.js
 * UI-Initialisierung, Event-Listener und DOM-Setup
 */

// Modul Import
import {
  renderAll,
  renderStatsBar,
  renderActions,
  renderUpgrades,
  renderAchievements
} from './ui-render.js';

import { showAchievementNotification } from '../src/modules/notification-system.js';
import gameState from '../src/modules/game-state.js';

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

  setupSaveButtons(game);
}

// ========= Utility-Buttons ======
function setupSaveButtons(game) {
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const resetBtn = document.getElementById('resetBtn');
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
        renderAll(game);
        showNotification('Spielstand importiert!');
      } catch (e) {
        showNotification('Fehler: Ungültiger Spielstand.');
        console.error(e);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (!confirm('🚨 WARNUNG: Spiel wirklich vollständig zurücksetzen?\n\nAlle Daten werden gelöscht:\n- Ressourcen\n- Upgrades\n- Forschung\n- Prestige-Punkte\n- Achievements\n\nDieser Vorgang kann nicht rückgängig gemacht werden!')) {
        return;
      }
      
      console.log('🔴 ========== RESET GESTARTET ==========');
      console.log('Schritt 1: Setze Reset-Flag...');
      
      // WICHTIG: Flag setzen BEVOR wir localStorage löschen
      // sessionStorage überlebt den Reload aber nicht das Schließen des Tabs
      sessionStorage.setItem('gameResetInProgress', 'true');
      console.log('✅ Reset-Flag gesetzt');
      
      console.log('Schritt 2: Game Loop stoppen...');
      game.stopGameLoop();
      console.log('✅ Game Loop gestoppt');
      
      console.log('Schritt 3: LocalStorage komplett löschen...');
      localStorage.clear();
      console.log('✅ localStorage gelöscht');
      console.log('🔍 Verifikation:', localStorage.getItem('gameState'));
      
      console.log('🟥 ========== RESET ABGESCHLOSSEN ==========');
      console.log('🔄 Lade Seite neu SOFORT...');
      
      // Sofort neu laden ohne Verzögerung
      window.location.reload();
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
      
      // Prestige-Container
      const prestigeContainer = document.getElementById('prestigeContainer');
      if (prestigeContainer) {
        if (target === 'prestige') {
          prestigeContainer.style.display = 'block';
        } else {
          prestigeContainer.style.display = 'none';
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
let autosaveInterval = null;

function setupAutosave(game) {
  // Autosave nur starten wenn kein Reset aktiv ist
  if (sessionStorage.getItem('gameResetInProgress') === 'true') {
    console.log('⚠️ Autosave deaktiviert - Reset läuft');
    return;
  }
  
  autosaveInterval = setInterval(() => {
    // Prüfe nochmal ob Reset aktiv ist
    if (sessionStorage.getItem('gameResetInProgress') === 'true') {
      console.log('⚠️ Autosave übersprungen - Reset läuft');
      return;
    }
    
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
    renderActions(game); // Action-Buttons auch bei jedem Tick updaten
    
    // Upgrades nur rendern wenn Tab aktiv ist (Performance)
    const upgradeGrid = document.getElementById('upgradeGrid');
    if (upgradeGrid && upgradeGrid.style.display !== 'none') {
      renderUpgrades(game);
    }
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
      
      // Nicht speichern während Reset
      if (sessionStorage.getItem('gameResetInProgress') === 'true') {
        showNotification('Speichern während Reset deaktiviert.');
        return;
      }
      
      game.syncToState();
      gameState.save();
      showNotification('Spiel gespeichert!');
    }
    
    // Strg+R: Vollständiges Re-Render
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      renderAll(game);
      showNotification('UI aktualisiert!');
    }
    
    // Leertaste: Energie klicken
    if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      game.handleClick('energy');
      renderStatsBar(game);
      renderActions(game);
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
  
  // gameState Constructor hat bereits Reset-Flag geprüft und ggf. gelöscht
  // Hier müssen wir nichts mehr machen
  
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
