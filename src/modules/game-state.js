/**
 * game-state.js
 * Zentraler Spielstand-Manager
 */

import resourceDefinitions from './resources-def.js';

export class GameState {
  constructor() {
    // WICHTIG: Erst prüfen ob Reset aktiv ist!
    const resetInProgress = sessionStorage.getItem('gameResetInProgress');
    
    if (resetInProgress === 'true') {
      console.log('🔴 RESET ERKANNT im GameState Constructor!');
      console.log('🗑️ Lösche localStorage VOR dem Laden...');
      localStorage.clear();
      sessionStorage.removeItem('gameResetInProgress');
      console.log('✅ Reset abgeschlossen - starte mit leeren Daten');
    }
    
    // Versuche gespeicherten State zu laden (nur wenn kein Reset)
    const storageValue = localStorage.getItem('gameState');
    let savedState = null;

    if (storageValue && storageValue !== 'undefined') {
      try {
        savedState = JSON.parse(storageValue);
        Object.assign(this, savedState);
        console.log('📥 Spielstand aus localStorage geladen');
      } catch (e) {
        console.warn('Konnte gespeicherten State nicht laden:', e);
      }
    } else {
      console.log('ℹ️ Kein Spielstand gefunden - starte neu');
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
    
    // 🆕 Statistics Tracking
    this.statistics = this.statistics ?? {
      totalResourcesEarned: {},
      peakProduction: {},
      totalUpgradesBought: 0,
      totalUpgradesSold: 0,
      mostOwnedBuilding: { id: null, count: 0 },
      totalResearchCompleted: 0,
      prestigeHistory: [],
      playtimeSeconds: 0,
      lastUpdateTime: Date.now()
    };
    
    // Milestone-Tracking
    this.reachedMilestones = this.reachedMilestones ?? [];
    
    // Offline-Tracking
    this.lastOnline = this.lastOnline ?? Date.now();
    
    // Wenn resources leer ist, initialisiere mit Startwerten
    if (Object.keys(this.resources).length === 0) {
      console.log('ℹ️ Ressourcen sind leer - initialisiere mit Startwerten');
      for (const def of resourceDefinitions) {
        this.resources[def.id] = {
          amount: def.startAmount || 0,
          totalEarned: 0,
          unlocked: def.unlocked || false
        };
      }
    }
  }

  // Spielstand speichern
  save() {
    // Nicht speichern während Reset
    if (sessionStorage.getItem('gameResetInProgress') === 'true') {
      console.log('⚠️ Speichern blockiert - Reset läuft');
      return;
    }
    
    this.lastOnline = Date.now();
    const stateJSON = JSON.stringify(this);
    localStorage.setItem('gameState', stateJSON);
    console.log('💾 Spielstand gespeichert');
  }

  // Spielstand zurücksetzen
  reset() {
    console.log('🔴 ========== RESET GESTARTET ==========');
    
    // Ressourcen mit Startwerten initialisieren
    this.resources = {};
    for (const def of resourceDefinitions) {
      this.resources[def.id] = {
        amount: def.startAmount || 0,
        totalEarned: 0,
        unlocked: def.unlocked || false
      };
    }
    console.log('✅ Ressourcen zurückgesetzt:', Object.keys(this.resources).length);
    
    // ALLE Upgrades zurücksetzen
    this.upgrades = {};
    console.log('✅ Upgrades zurückgesetzt (leer)');
    
    // Alle anderen Daten zurücksetzen
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
    
    // 🆕 Statistics zurücksetzen
    this.statistics = {
      totalResourcesEarned: {},
      peakProduction: {},
      totalUpgradesBought: 0,
      totalUpgradesSold: 0,
      mostOwnedBuilding: { id: null, count: 0 },
      totalResearchCompleted: 0,
      prestigeHistory: [],
      playtimeSeconds: 0,
      lastUpdateTime: Date.now()
    };
    
    // Milestones zurücksetzen
    this.reachedMilestones = [];
    
    console.log('✅ Alle Tracking-Daten zurückgesetzt');
    
    // LocalStorage komplett löschen - OHNE danach zu speichern!
    console.log('🗑️ Lösche localStorage komplett...');
    localStorage.clear();
    
    console.log('✅ localStorage gelöscht');
    console.log('🔍 Verifikation - localStorage.getItem("gameState"):', localStorage.getItem('gameState'));
    console.log('🟬 ========== RESET ABGESCHLOSSEN ==========');
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
