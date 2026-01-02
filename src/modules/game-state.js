/**
 * game-state.js
 * Zentraler Spielstand-Manager
 */

export class GameState {
  constructor() {
    // Versuche gespeicherten State zu laden
    const storageValue = localStorage.getItem('gameState');
    let savedState = null;

    if (storageValue && storageValue !== 'undefined') {
      try {
        savedState = JSON.parse(storageValue);
        Object.assign(this, savedState);
      } catch (e) {
        console.warn('Konnte gespeicherten State nicht laden:', e);
      }
    }

    // Initialisiere mit Defaults falls nichts geladen wurde
    this.resources = this.resources ?? {};
    this.upgrades = this.upgrades ?? {};
    this.completedResearch = this.completedResearch ?? [];
    this.prestigeUpgrades = this.prestigeUpgrades ?? [];
    this.achievements = this.achievements ?? [];
    
    // Space-System
    this.maxSpace = this.maxSpace ?? 10;
    
    // Achievement-Tracking
    this.totalClicks = this.totalClicks ?? 0;
    this.prestigeCount = this.prestigeCount ?? 0;
    this.totalPrestigePoints = this.totalPrestigePoints ?? 0;
    this.achievementPrestigeBonus = this.achievementPrestigeBonus ?? 1;
    this.startTime = this.startTime ?? Date.now();
    
    // Offline-Tracking
    this.lastOnline = this.lastOnline ?? Date.now();
  }

  // Spielstand speichern
  save() {
    this.lastOnline = Date.now();
    const stateJSON = JSON.stringify(this);
    localStorage.setItem('gameState', stateJSON);
    console.log('💾 Spielstand gespeichert');
  }

  // Spielstand zurücksetzen
  reset() {
    // Alles zurücksetzen
    this.resources = {};
    this.upgrades = {};
    this.completedResearch = [];
    this.prestigeUpgrades = [];
    this.achievements = [];
    this.maxSpace = 10;
    this.totalClicks = 0;
    this.prestigeCount = 0;
    this.totalPrestigePoints = 0;
    this.achievementPrestigeBonus = 1;
    this.startTime = Date.now();
    this.lastOnline = Date.now();
    
    // LocalStorage löschen
    localStorage.removeItem('gameState');
    console.log('🗑️ Spielstand zurückgesetzt');
  }

  // Export als Base64
  export() {
    try {
      const stateJSON = JSON.stringify(this);
      const encoded = btoa(stateJSON);
      return encoded;
    } catch (e) {
      console.error('Export fehlgeschlagen:', e);
      return null;
    }
  }

  // Import von Base64
  import(encodedState) {
    try {
      const decoded = atob(encodedState);
      const parsedState = JSON.parse(decoded);
      Object.assign(this, parsedState);
      this.save();
      return true;
    } catch (e) {
      console.error('Import fehlgeschlagen:', e);
      return false;
    }
  }
}

// Singleton-Instanz
const gameState = new GameState();

export default gameState;
