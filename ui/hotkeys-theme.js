/**
 * hotkeys-theme.js
 * Hotkey-System und Theme-Toggle für Space Colonies
 */

import { renderAll } from './ui-render.js';
import gameState from '../src/modules/game-state.js';

// Theme-Management
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.applyTheme(this.currentTheme);
  }
  
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Update theme toggle button icon
    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
      toggleBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    
    console.log(`🎨 Theme gewechselt: ${theme}`);
  }
  
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }
}

// Hotkey-Manager
class HotkeyManager {
  constructor(game) {
    this.game = game;
    this.hotkeyHelpVisible = false;
  }
  
  initialize() {
    document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    
    // Theme Toggle Button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        window.themeManager.toggle();
      });
    }
    
    // Hotkey Help Button
    const hotkeyBtn = document.getElementById('hotkeyBtn');
    if (hotkeyBtn) {
      hotkeyBtn.addEventListener('click', () => {
        this.toggleHotkeyHelp();
      });
    }
    
    // Close Hotkey Help Button
    const closeBtn = document.getElementById('closeHotkeyHelp');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideHotkeyHelp();
      });
    }
    
    // Close on overlay click
    const helpOverlay = document.getElementById('hotkeyHelp');
    if (helpOverlay) {
      helpOverlay.addEventListener('click', (e) => {
        if (e.target === helpOverlay) {
          this.hideHotkeyHelp();
        }
      });
    }
    
    console.log('⌨️ Hotkey-System initialisiert');
  }
  
  handleKeyPress(e) {
    // Ignore wenn in Input-Feld
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
      return;
    }
    
    // ESC - Close Hotkey Help
    if (e.key === 'Escape' && this.hotkeyHelpVisible) {
      e.preventDefault();
      this.hideHotkeyHelp();
      return;
    }
    
    // H oder ? - Show Hotkey Help
    if ((e.key === 'h' || e.key === 'H' || e.key === '?') && !this.hotkeyHelpVisible) {
      e.preventDefault();
      this.showHotkeyHelp();
      return;
    }
    
    // Hotkey Help visible - ignore other hotkeys
    if (this.hotkeyHelpVisible) {
      return;
    }
    
    // Shift + T - Theme Toggle
    if (e.shiftKey && (e.key === 't' || e.key === 'T')) {
      e.preventDefault();
      window.themeManager.toggle();
      return;
    }
    
    // Ctrl + S - Manual Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      gameState.save();
      console.log('💾 Manuell gespeichert');
      return;
    }
    
    // Ctrl + R - Reload UI (ohne Page Refresh)
    if (e.ctrlKey && e.key === 'r') {
      e.preventDefault();
      renderAll(this.game);
      console.log('🔄 UI neu geladen');
      return;
    }
    
    // Leertaste - Energie sammeln
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      this.game.handleClick('energy');
      renderAll(this.game);
      return;
    }
    
    // Zahlen 1-5 - Tab-Navigation
    const tabMap = {
      '1': 'upgrades',
      '2': 'research',
      '3': 'statistics',
      '4': 'achievements',
      '5': 'prestige'
    };
    
    if (tabMap[e.key]) {
      e.preventDefault();
      this.switchTab(tabMap[e.key]);
      return;
    }
  }
  
  switchTab(tabName) {
    // Deaktiviere alle Tab-Buttons
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Verstecke alle Tab-Content-Container (nur die divs im .tab-content Bereich)
    const upgradeGrid = document.getElementById('upgradeGrid');
    const researchGrid = document.getElementById('researchGrid');
    const statsContainer = document.getElementById('statisticsContainer');
    const achievementsContainer = document.getElementById('achievementsContainer');
    const prestigeContainer = document.getElementById('prestigeContainer');
    
    if (upgradeGrid) upgradeGrid.style.display = 'none';
    if (researchGrid) researchGrid.style.display = 'none';
    if (statsContainer) statsContainer.style.display = 'none';
    if (achievementsContainer) achievementsContainer.style.display = 'none';
    if (prestigeContainer) prestigeContainer.style.display = 'none';
    
    // Aktiviere gewählten Tab-Button
    const selectedTab = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    if (selectedTab) {
      selectedTab.classList.add('active');
    }
    
    // Zeige gewählten Content
    let selectedContent = null;
    
    switch(tabName) {
      case 'upgrades':
        selectedContent = upgradeGrid;
        if (selectedContent) selectedContent.style.display = 'flex';
        break;
      case 'research':
        selectedContent = researchGrid;
        if (selectedContent) selectedContent.style.display = 'flex';
        break;
      case 'statistics':
        selectedContent = statsContainer;
        if (selectedContent) {
          selectedContent.style.display = 'block';
          // Render statistics
          import('./ui-render.js').then(module => {
            module.renderStatistics(this.game);
          });
        }
        break;
      case 'achievements':
        selectedContent = achievementsContainer;
        if (selectedContent) {
          selectedContent.style.display = 'block';
          // Render achievements
          import('./ui-render.js').then(module => {
            module.renderAchievements(this.game);
          });
        }
        break;
      case 'prestige':
        selectedContent = prestigeContainer;
        if (selectedContent) selectedContent.style.display = 'block';
        break;
    }
    
    console.log(`📋 Tab gewechselt: ${tabName}`);
  }
  
  showHotkeyHelp() {
    const helpOverlay = document.getElementById('hotkeyHelp');
    if (helpOverlay) {
      helpOverlay.style.display = 'flex';
      this.hotkeyHelpVisible = true;
    }
  }
  
  hideHotkeyHelp() {
    const helpOverlay = document.getElementById('hotkeyHelp');
    if (helpOverlay) {
      helpOverlay.style.display = 'none';
      this.hotkeyHelpVisible = false;
    }
  }
  
  toggleHotkeyHelp() {
    if (this.hotkeyHelpVisible) {
      this.hideHotkeyHelp();
    } else {
      this.showHotkeyHelp();
    }
  }
}

// Initialisierung
export function initializeHotkeysAndTheme(game) {
  // Theme Manager
  window.themeManager = new ThemeManager();
  
  // Hotkey Manager
  const hotkeyManager = new HotkeyManager(game);
  hotkeyManager.initialize();
  
  // Tab-Switching per Click
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      hotkeyManager.switchTab(tabName);
    });
  });
  
  return hotkeyManager;
}

export default { initializeHotkeysAndTheme };
