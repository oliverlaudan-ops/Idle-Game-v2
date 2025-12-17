/**
 * core.js
 * Kernspiellogik ohne DOM-Manipulation
 */

import gameState from './game-state.js';
import resourcesList from './resources-def.js';
import upgradesList from './upgrades-def.js';
import researchUpgradesList from './research-def.js';
import prestigeUpgradesList, { PrestigeUpgrade } from './prestige-upgrades.js';
import { calculatePrestigePoints, doPrestige, getEffectivePrestigeBonus } from './prestige.js';
import achievementManager from './achievement-manager.js'; // ← NEU

class Game {
  constructor() {
    this.resources = {};
    this.upgrades = [];
    this.prestigeUpgrades = [];
    this.tickMs = 1000;
    this.tickTimer = null;
    
    // DOM-Referenzen (werden von ui-init.js gesetzt)
    this.statsBarEl = null;
    this.actionsEl = null;
    this.upgradeGridEl = null;
    this.researchGridEl = null;
    
    // Achievement-Tracking ← NEU
    this.totalClicks = 0;
    this.prestigeCount = 0;
    this.totalPrestigePoints = 0;
    this.startTime = Date.now();
    this.achievementPrestigeBonus = 1;
  }

  // ========== Resource Management ==========
  
  addResource(res) {
    this.resources[res.id] = res;
  }

  getResource(id) {
    return this.resources[id];
  }

  // ========== Upgrade Management ==========
  
  addUpgrade(upg) {
    this.upgrades.push(upg);
  }

  // ========== Game Data Setup ==========
  
  setupGameData() {
    // Resources laden
    for (const res of resourcesList) {
      this.addResource(Object.assign(Object.create(Object.getPrototypeOf(res)), res));
    }

    // Standard-Upgrades laden
    for (const upg of upgradesList) {
      this.addUpgrade(Object.assign(Object.create(Object.getPrototypeOf(upg)), upg));
    }

    // Forschungs-Upgrades laden
    for (const upg of researchUpgradesList) {
      this.addUpgrade(Object.assign(Object.create(Object.getPrototypeOf(upg)), upg));
    }

    // Prestige-Upgrades laden
    this.prestigeUpgrades = prestigeUpgradesList.map(
      upg => Object.assign(new PrestigeUpgrade({}), upg)
    );
  }

  // ========== Achievement Setup ========== ← NEU
  
  setupAchievements() {
    achievementManager.loadAchievements();
    achievementManager.syncFromState();
    
    // Callback für Achievement-Unlock setzen
    achievementManager.onAchievementUnlock = (achievement) => {
      if (this.onAchievementUnlock) {
        this.onAchievementUnlock(achievement);
      }
    };
  }

  // ========== Achievement Checking ========== ← NEU
  
  checkAchievements() {
    return achievementManager.checkAll(this);
  }

  // ========== Game Logic ==========
  
  recalculateResourceBonuses() {
    // Alle Ressourcen zurücksetzen
    for (const key in this.resources) {
      this.resources[key].rpc = (key === 'stein') ? 1 : 0;
      this.resources[key].rps = 0;
    }

    // Upgrade-Effekte anwenden
    for (let upg of this.upgrades) {
      if (upg.level > 0) {
        for (let i = 0; i < upg.level; ++i) {
          if (typeof upg.applyFn === 'function') {
            upg.applyFn(this);
          }
        }
      }
    }

    // Ressourcen freischalten
    for (let upg of this.upgrades) {
      if (upg.level > 0 && upg.unlocksResourceId) {
        const res = this.getResource(upg.unlocksResourceId);
        if (res) {
          res.unlocked = true;
          if (res.rpc === 0) res.rpc = 1;
        }
      }
    }
  }

  // ========== Game Loop ==========
  
  tick() {
    const mult = getEffectivePrestigeBonus(gameState);
    
    for (let key in this.resources) {
      const res = this.resources[key];
      if (res.unlocked && res.rps > 0) {
        res.add(res.rps * mult);
      }
    }
    
    // Achievements bei jedem Tick prüfen ← NEU
    this.checkAchievements();
  }

  startGameLoop() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
    }
    
    this.tickTimer = setInterval(() => {
      this.tick();
      // Callback für UI-Update (wird von außen gesetzt)
      if (this.onTick) {
        this.onTick();
      }
    }, this.tickMs);
  }

  stopGameLoop() {
    if (this.tickTimer) {
      clearInterval(this.tickTimer);
      this.tickTimer = null;
    }
  }

  // ========== Save/Load State ==========
  
  syncToState() {
    for (let key in this.resources) {
      gameState[key] = this.resources[key].amount;
    }
    
    gameState.upgrades = this.upgrades.map(u => ({
      id: u.id,
      level: u.level
    }));
    
    gameState.prestigeUpgrades = this.prestigeUpgrades.map(u => ({
      id: u.id,
      level: u.level
    }));
    
    // Achievement-Tracking speichern ← NEU
    gameState.totalClicks = this.totalClicks;
    gameState.prestigeCount = this.prestigeCount;
    gameState.totalPrestigePoints = this.totalPrestigePoints;
    gameState.startTime = this.startTime;
    gameState.achievementPrestigeBonus = this.achievementPrestigeBonus;
    
    achievementManager.syncToState();
  }

  syncFromState() {
    // Ressourcen-Mengen laden
    for (let key in this.resources) {
      this.resources[key].amount = gameState[key] ?? 0;
    }

    // Upgrade-Levels laden
    if (Array.isArray(gameState.upgrades)) {
      for (let u of this.upgrades) {
        let saved = gameState.upgrades.find(su => su.id === u.id);
        u.level = saved ? saved.level : 0;
      }
    }

    // Prestige-Upgrade-Levels laden
    if (Array.isArray(gameState.prestigeUpgrades)) {
      for (let u of this.prestigeUpgrades) {
        let saved = gameState.prestigeUpgrades.find(su => su.id === u.id);
        u.level = saved ? saved.level : 0;
      }
    }

    // Achievement-Tracking laden ← NEU
    this.totalClicks = gameState.totalClicks ?? 0;
    this.prestigeCount = gameState.prestigeCount ?? 0;
    this.totalPrestigePoints = gameState.totalPrestigePoints ?? 0;
    this.startTime = gameState.startTime ?? Date.now();
    this.achievementPrestigeBonus = gameState.achievementPrestigeBonus ?? 1;

    this.recalculateResourceBonuses();
  }

  // ========== Prestige Logic ==========
  
  canPrestige() {
    // Prüft, ob mindestens 1 Prestige-Punkt gewonnen werden würde
    const pointsNow = calculatePrestigePoints(gameState);
    const currentPoints = gameState.prestige || 0;
    const gained = pointsNow - currentPoints;
    
    return gained > 0;
  }

  performPrestige() {
    if (!this.canPrestige()) return false;

    const pointsGained = calculatePrestigePoints(gameState);
    doPrestige(this, gameState);
    
    // Achievement-Tracking aktualisieren ← NEU
    this.prestigeCount++;
    this.totalPrestigePoints = gameState.prestige || 0;
    
    // Game neu initialisieren
    this.syncFromState();
    
    // Achievements prüfen ← NEU
    this.checkAchievements();
    
    return true;
  }

  getPrestigeInfo() {
    const pointsNow = calculatePrestigePoints(gameState);
    const currentPoints = gameState.prestige || 0;
    const gained = pointsNow - currentPoints;
    const effBonus = getEffectivePrestigeBonus(gameState);
    
    return {
      currentPoints,
      pointsAfterPrestige: pointsNow,
      gained,
      effectiveBonus: effBonus
    };
  }
}

export default Game;
