/** src/modules/core.js
Kern-Logik mit integriertem Content-System
**/

// Modul-Import
import gameState from './game-state.js';
import resourceDefinitions from './resources-def.js';
import upgradeDefinitions, { calculateUpgradeCost, checkUpgradeUnlock } from './upgrades-def.js';
import researchDefinitions, { checkResearchUnlock } from './research-def.js';
import prestigeUpgradesList, { calculatePrestigeBonuses } from './prestige-upgrades.js';
import { calculatePrestigePoints, doPrestige } from './prestige.js';
import achievementManager from './achievement-manager.js';

// Konstruktor
class Game {
  constructor() {
    // Ressourcen-Verwaltung
    this.resources = {};
    
    // Upgrade/Gebäude-Verwaltung
    this.upgrades = {}; // { upgradeId: count }
    this.upgradeDefinitions = [];
    
    // Forschungs-Verwaltung
    this.completedResearch = [];
    this.researchDefinitions = [];
    
    // Prestige-Verwaltung
    this.prestigeUpgrades = [];
    this.prestigeBonuses = null;
    
    // Bauplatz-System
    this.maxSpace = 10; // Startplätze
    this.usedSpace = 0;
    
    // Game Loop
    this.tickMs = 1000;
    this.tickTimer = null;
    
    // DOM-Referenzen (werden von ui-init.js gesetzt)
    this.statsBarEl = null;
    this.actionsEl = null;
    this.upgradeGridEl = null;
    this.researchGridEl = null;
    
    // Achievement-Tracking
    this.totalClicks = 0;
    this.prestigeCount = 0;
    this.totalPrestigePoints = 0;
    this.startTime = Date.now();
    this.achievementPrestigeBonus = 1;
  }

  // ========== Resource Management ==========
  
  initializeResources() {
    for (const def of resourceDefinitions) {
      this.resources[def.id] = {
        id: def.id,
        name: def.name,
        icon: def.icon,
        description: def.description,
        amount: def.startAmount || 0,
        totalEarned: 0, // Für Achievements
        unlocked: def.unlocked || false,
        category: def.category,
        perSecond: def.perSecond || 0,
        clickValue: def.clickValue || 0,
        baseClickValue: def.clickValue || 0, // Basis-Wert speichern
        color: def.color
      };
    }
  }
  
  getResource(id) {
    return this.resources[id];
  }
  
  addResourceAmount(resourceId, amount) {
    const resource = this.resources[resourceId];
    if (!resource) return false;
    
    resource.amount += amount;
    resource.totalEarned += amount;
    return true;
  }
  
  canAfford(costs) {
    for (const [resourceId, amount] of Object.entries(costs)) {
      const resource = this.resources[resourceId];
      if (!resource || resource.amount < amount) {
        return false;
      }
    }
    return true;
  }
  
  spendResources(costs) {
    if (!this.canAfford(costs)) return false;
    
    for (const [resourceId, amount] of Object.entries(costs)) {
      this.resources[resourceId].amount -= amount;
    }
    return true;
  }
  
  // ========== Click Handler ==========
  
  handleClick(resourceId = 'energy') {
    const resource = this.resources[resourceId];
    if (!resource || !resource.unlocked) return;
    
    let clickValue = resource.clickValue || 1;
    
    // Prestige-Boni anwenden
    if (this.prestigeBonuses) {
      clickValue += this.prestigeBonuses.clickPower;
      clickValue *= (1 + this.prestigeBonuses.clickMultiplier);
    }
    
    this.addResourceAmount(resourceId, clickValue);
    this.totalClicks++;
    
    // Achievements prüfen
    this.checkAchievements();
  }

  // ========== Upgrade/Building Management ==========
  
  initializeUpgrades() {
    // Erstelle NEUE Kopien der Upgrade-Definitionen
    this.upgradeDefinitions = upgradeDefinitions.map(def => ({
      ...def,
      // Stelle sicher dass unlocked vom Original kommt
      unlocked: def.unlocked || false
    }));
    
    // Initialisiere Counts
    for (const def of this.upgradeDefinitions) {
      if (!this.upgrades[def.id]) {
        this.upgrades[def.id] = 0;
      }
    }
  }
  
  getUpgradeDefinition(upgradeId) {
    return this.upgradeDefinitions.find(u => u.id === upgradeId);
  }
  
  getUpgradeCount(upgradeId) {
    return this.upgrades[upgradeId] || 0;
  }
  
  getTotalBuildings() {
    let total = 0;
    for (const def of this.upgradeDefinitions) {
      if (def.type === 'generator') {
        total += this.upgrades[def.id] || 0;
      }
    }
    return total;
  }
  
  getUsedSpace() {
    let used = 0;
    for (const def of this.upgradeDefinitions) {
      const count = this.upgrades[def.id] || 0;
      used += (def.size || 0) * count;
    }
    return used;
  }
  
  canBuyUpgrade(upgradeId) {
    const def = this.getUpgradeDefinition(upgradeId);
    if (!def || !def.unlocked) return false;
    
    // Prüfe max count
    const currentCount = this.getUpgradeCount(upgradeId);
    if (def.maxCount !== -1 && currentCount >= def.maxCount) {
      return false;
    }
    
    // Prüfe Platz (nur für Gebäude mit Größe > 0)
    if (def.size > 0) {
      const usedSpace = this.getUsedSpace();
      if (usedSpace + def.size > this.maxSpace) {
        return false;
      }
    }
    
    // Prüfe Kosten
    const cost = calculateUpgradeCost(def, currentCount);
    return this.canAfford(cost);
  }
  
  buyUpgrade(upgradeId) {
    if (!this.canBuyUpgrade(upgradeId)) return false;
    
    const def = this.getUpgradeDefinition(upgradeId);
    const currentCount = this.getUpgradeCount(upgradeId);
    const cost = calculateUpgradeCost(def, currentCount);
    
    if (!this.spendResources(cost)) return false;
    
    this.upgrades[upgradeId] = currentCount + 1;
    
    // Effekte anwenden (bei Effizienz-Upgrades etc.)
    this.recalculateProduction();
    
    // Prüfe neue Unlocks
    this.checkUpgradeUnlocks();
    
    // Achievements prüfen
    this.checkAchievements();
    
    console.log(`✅ Gekauft: ${def.icon} ${def.name} (${currentCount + 1})`);
    return true;
  }
  
  canDemolishUpgrade(upgradeId) {
    const def = this.getUpgradeDefinition(upgradeId);
    if (!def) return false;
    
    const currentCount = this.getUpgradeCount(upgradeId);
    return currentCount > 0;
  }
  
  demolishUpgrade(upgradeId) {
    if (!this.canDemolishUpgrade(upgradeId)) return false;
    
    const def = this.getUpgradeDefinition(upgradeId);
    const currentCount = this.getUpgradeCount(upgradeId);
    
    // Berechne die Kosten des letzten Kaufs
    const lastCost = calculateUpgradeCost(def, currentCount - 1);
    
    // Gebe 50% zurück
    const refund = {};
    for (const [resourceId, amount] of Object.entries(lastCost)) {
      refund[resourceId] = Math.floor(amount * 0.5);
    }
    
    // Reduziere Count
    this.upgrades[upgradeId] = currentCount - 1;
    
    // Gebe Ressourcen zurück
    for (const [resourceId, amount] of Object.entries(refund)) {
      this.addResourceAmount(resourceId, amount);
    }
    
    // Produktion neu berechnen
    this.recalculateProduction();
    
    console.log(`💥 Abgerissen: ${def.icon} ${def.name} - Rückerstattung: 50%`);
    return true;
  }
  
  checkUpgradeUnlocks() {
    for (const def of this.upgradeDefinitions) {
      if (!def.unlocked && checkUpgradeUnlock(def.id, gameState, this.upgrades)) {
        def.unlocked = true;
        console.log(`🔓 Upgrade freigeschaltet: ${def.icon} ${def.name}`);
      }
    }
  }

  // ========== Research Management ==========
  
  initializeResearch() {
    // Erstelle NEUE Kopien der Research-Definitionen
    this.researchDefinitions = researchDefinitions.map(def => ({
      ...def,
      // Stelle sicher dass unlocked vom Original kommt
      unlocked: def.unlocked || false
    }));
  }
  
  getResearchDefinition(researchId) {
    return this.researchDefinitions.find(r => r.id === researchId);
  }
  
  isResearchCompleted(researchId) {
    return this.completedResearch.includes(researchId);
  }
  
  canResearch(researchId) {
    const def = this.getResearchDefinition(researchId);
    if (!def || !def.unlocked || this.isResearchCompleted(researchId)) {
      return false;
    }
    
    return this.canAfford(def.cost);
  }
  
  performResearch(researchId) {
    if (!this.canResearch(researchId)) return false;
    
    const def = this.getResearchDefinition(researchId);
    
    if (!this.spendResources(def.cost)) return false;
    
    this.completedResearch.push(researchId);
    
    // Effekte anwenden
    this.recalculateProduction();
    
    // Prüfe neue Unlocks
    this.checkResearchUnlocks();
    
    // Achievements prüfen
    this.checkAchievements();
    
    console.log(`🔬 Erforscht: ${def.icon} ${def.name}`);
    return true;
  }
  
  checkResearchUnlocks() {
    for (const def of this.researchDefinitions) {
      if (!def.unlocked && checkResearchUnlock(def.id, gameState, this.completedResearch)) {
        def.unlocked = true;
        console.log(`🔓 Forschung freigeschaltet: ${def.icon} ${def.name}`);
      }
    }
    
    // Prüfe auch Ressourcen-Unlocks
    this.checkResourceUnlocks();
  }
  
  checkResourceUnlocks() {
    for (const [id, resource] of Object.entries(this.resources)) {
      if (resource.unlocked) continue;
      
      const def = resourceDefinitions.find(r => r.id === id);
      if (!def || !def.unlockCondition) continue;
      
      const condition = def.unlockCondition;
      const currentAmount = this.resources[condition.resource]?.amount || 0;
      
      if (currentAmount >= condition.amount) {
        resource.unlocked = true;
        console.log(`🔓 Ressource freigeschaltet: ${resource.icon} ${resource.name}`);
      }
    }
  }

  // ========== Production Calculation ==========
  
  recalculateProduction() {
    // Alle Produktionsraten zurücksetzen
    for (const resource of Object.values(this.resources)) {
      resource.perSecond = 0;
      // Click-Werte auf Basis zurücksetzen
      resource.clickValue = resource.baseClickValue || 0;
    }
    
    // Click-Werte von Click-Upgrades hinzufügen
    this.recalculateClickValues();
    
    // Basis-Produktion aus Gebäuden
    for (const def of this.upgradeDefinitions) {
      const count = this.upgrades[def.id] || 0;
      if (count === 0 || !def.produces) continue;
      
      for (const [resourceId, baseAmount] of Object.entries(def.produces)) {
        const resource = this.resources[resourceId];
        if (!resource) continue;
        
        let production = baseAmount * count;
        
        // Effizienz-Upgrades anwenden
        production *= this.getEfficiencyMultiplier(def.id, resourceId);
        
        // Forschungs-Boni anwenden
        production *= this.getResearchMultiplier(resourceId);
        
        // Prestige-Boni anwenden
        if (this.prestigeBonuses) {
          production *= (1 + this.prestigeBonuses.globalProduction);
          production *= (1 + this.prestigeBonuses.buildingProduction);
          
          if (this.prestigeBonuses.resourceProduction[resourceId]) {
            production *= (1 + this.prestigeBonuses.resourceProduction[resourceId]);
          }
        }
        
        resource.perSecond += production;
      }
    }
    
    // Platz neu berechnen
    this.usedSpace = this.getUsedSpace();
    this.maxSpace = 10; // Basis
    
    // Platz-Erweiterungen durch Upgrades
    for (const def of this.upgradeDefinitions) {
      if (def.type === 'space' && this.upgrades[def.id] > 0) {
        this.maxSpace += def.effect.spaceIncrease;
      }
    }
    
    // Permanente Platz-Boni aus Prestige
    if (this.prestigeBonuses) {
      this.maxSpace += this.prestigeBonuses.permanentSpace;
    }
  }
  
  recalculateClickValues() {
    // Click-Upgrades anwenden (für energy)
    for (const def of this.upgradeDefinitions) {
      if (def.type !== 'click') continue;
      const count = this.upgrades[def.id] || 0;
      if (count === 0) continue;
      
      // Click-Upgrades gelten immer für Energie
      if (def.effect && def.effect.clickBonus) {
        const energyResource = this.resources.energy;
        if (energyResource) {
          energyResource.clickValue += def.effect.clickBonus;
        }
      }
    }
  }
  
  getEfficiencyMultiplier(buildingId, resourceId) {
    let multiplier = 1;
    
    // Prüfe Effizienz-Upgrades
    for (const def of this.upgradeDefinitions) {
      if (def.type !== 'efficiency') continue;
      if (this.upgrades[def.id] === 0) continue;
      if (!def.effect || !def.effect.target) continue;
      
      if (def.effect.target === buildingId) {
        multiplier *= def.effect.multiplier;
      }
    }
    
    return multiplier;
  }
  
  getResearchMultiplier(resourceId) {
    let multiplier = 1;
    
    for (const researchId of this.completedResearch) {
      const def = this.getResearchDefinition(researchId);
      if (!def || !def.effect) continue;
      
      const effect = def.effect;
      
      // Globale Multiplikatoren
      if (effect.type === 'global_multiplier') {
        multiplier *= effect.multiplier;
      }
      
      // Ressourcen-spezifische Multiplikatoren
      if (effect.type === 'production_multiplier' && effect.resource === resourceId) {
        multiplier *= effect.multiplier;
      }

      // 🆕 FIX Fusionsbeherrschung - HIER EINFÜGEN (nach production_multiplier Block)
      if (effect.type === 'building_specific' && effect.target === buildingId) {
        multiplier *= effect.multiplier;
        console.log(`🔬 ${researchDef.name}: ${buildingId} ×${effect.multiplier}`);
      }
      
      // Multiple Ressourcen
      if (effect.type === 'production_multiplier' && effect.resources) {
        if (effect.resources.includes(resourceId)) {
          multiplier *= effect.multiplier;
        }
      }
    }
    
    return multiplier;
  }

  // ========== Game Data Setup ==========
  
  setupGameData() {
    console.log('🚀 Initialisiere Spieldaten...');
    
    this.initializeResources();
    this.initializeUpgrades();
    this.initializeResearch();
    
    // Prestige-Upgrades laden
    this.prestigeUpgrades = prestigeUpgradesList;
    
    // Prestige-Boni berechnen
    this.prestigeBonuses = calculatePrestigeBonuses(this.prestigeUpgrades);
    
    console.log('✅ Spieldaten initialisiert');
  }

  // ========== Achievement Setup ==========
  
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

  // ========== Achievement Checking ==========
  
  checkAchievements() {
    return achievementManager.checkAll(this);
  }

  // ========== Game Loop ==========
  
  tick() {
    // Ressourcen-Produktion
    for (const resource of Object.values(this.resources)) {
      if (resource.unlocked && resource.perSecond > 0) {
        this.addResourceAmount(resource.id, resource.perSecond);
      }
    }
    
    // Prüfe Unlocks
    this.checkResourceUnlocks();
    this.checkUpgradeUnlocks();
    this.checkResearchUnlocks();
    
    // Achievements prüfen
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
    // Ressourcen speichern
    gameState.resources = {};
    for (const [id, resource] of Object.entries(this.resources)) {
      gameState.resources[id] = {
        amount: resource.amount,
        totalEarned: resource.totalEarned,
        unlocked: resource.unlocked
      };
    }
    
    // Upgrades speichern
    gameState.upgrades = this.upgrades;
    
    // Forschung speichern
    gameState.completedResearch = this.completedResearch;
    
    // Prestige-Upgrades speichern
    gameState.prestigeUpgrades = this.prestigeUpgrades.map(u => ({
      id: u.id,
      level: u.level
    }));
    
    // Space speichern
    gameState.maxSpace = this.maxSpace;
    
    // Achievement-Tracking speichern
    gameState.totalClicks = this.totalClicks;
    gameState.prestigeCount = this.prestigeCount;
    gameState.totalPrestigePoints = this.totalPrestigePoints;
    gameState.startTime = this.startTime;
    gameState.achievementPrestigeBonus = this.achievementPrestigeBonus;
    
    achievementManager.syncToState();
  }

  syncFromState() {
    console.log('📥 Lade Spielstand...');
    console.log('gameState.upgrades:', gameState.upgrades);
    console.log('gameState.resources:', Object.keys(gameState.resources || {}).length, 'Ressourcen');
    
    // Ressourcen laden
    if (gameState.resources) {
      for (const [id, data] of Object.entries(gameState.resources)) {
        if (this.resources[id]) {
          this.resources[id].amount = data.amount || 0;
          this.resources[id].totalEarned = data.totalEarned || 0;
          this.resources[id].unlocked = data.unlocked || false;
        }
      }
    }
    
    // Upgrades laden - WICHTIG: Erst Definitions neu initialisieren!
    this.initializeUpgrades();
    
    if (gameState.upgrades) {
      this.upgrades = {...gameState.upgrades};
      console.log('✅ Upgrades geladen:', Object.keys(this.upgrades).filter(k => this.upgrades[k] > 0));
    } else {
      console.log('ℹ️ Keine Upgrades im State vorhanden');
    }
    
    // Forschung laden - WICHTIG: Erst Definitions neu initialisieren!
    this.initializeResearch();
    
    if (gameState.completedResearch) {
      this.completedResearch = [...gameState.completedResearch];
      console.log('✅ Forschungen geladen:', this.completedResearch.length);
    } else {
      console.log('ℹ️ Keine Forschungen im State vorhanden');
    }
    
    // Prestige-Upgrades laden
    if (gameState.prestigeUpgrades) {
      for (const saved of gameState.prestigeUpgrades) {
        const upgrade = this.prestigeUpgrades.find(u => u.id === saved.id);
        if (upgrade) {
          upgrade.level = saved.level || 0;
        }
      }
    }
    
    // Prestige-Boni neu berechnen
    this.prestigeBonuses = calculatePrestigeBonuses(this.prestigeUpgrades);
    
    // Space laden
    if (gameState.maxSpace) {
      this.maxSpace = gameState.maxSpace;
    }
    
    // Achievement-Tracking laden
    this.totalClicks = gameState.totalClicks || 0;
    this.prestigeCount = gameState.prestigeCount || 0;
    this.totalPrestigePoints = gameState.totalPrestigePoints || 0;
    this.startTime = gameState.startTime || Date.now();
    this.achievementPrestigeBonus = gameState.achievementPrestigeBonus || 1;

    // Produktion neu berechnen
    this.recalculateProduction();
    
    // Unlocks prüfen
    this.checkResourceUnlocks();
    this.checkUpgradeUnlocks();
    this.checkResearchUnlocks();
    
    console.log('✅ Spielstand vollständig geladen');
  }

  // ========== Prestige Logic ==========
  
  canPrestige() {
    // Prüft, ob mindestens 1 Prestige-Punkt gewonnen werden würde
    const pointsNow = calculatePrestigePoints(gameState);
    const currentPoints = gameState.resources?.prestige?.amount || 0;
    const gained = pointsNow - currentPoints;
    
    return gained > 0;
  }

  performPrestige() {
    if (!this.canPrestige()) return false;

    const pointsGained = calculatePrestigePoints(gameState) - (gameState.resources?.prestige?.amount || 0);
    doPrestige(this, gameState);
    
    // Achievement-Tracking aktualisieren
    this.prestigeCount++;
    this.totalPrestigePoints += pointsGained;
    
    // Game neu initialisieren
    this.syncFromState();
    
    // Achievements prüfen
    this.checkAchievements();
    
    console.log(`⭐ Prestige durchgeführt! +${pointsGained} Prestige-Punkte`);
    return true;
  }

  getPrestigeInfo() {
    const pointsNow = calculatePrestigePoints(gameState);
    const currentPoints = gameState.resources?.prestige?.amount || 0;
    const gained = pointsNow - currentPoints;
    
    return {
      currentPoints,
      pointsAfterPrestige: pointsNow,
      gained,
      prestigeBonuses: this.prestigeBonuses
    };
  }
}

export default Game;
