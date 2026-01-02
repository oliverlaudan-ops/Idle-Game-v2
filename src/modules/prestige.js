// ============================================
// Prestige-Logik für Space Colonies
// ============================================

import { calculatePrestigeBonuses } from './prestige-upgrades.js';

/**
 * Berechnet wie viele Prestige-Punkte der Spieler erhalten würde
 * Basiert auf der insgesamt gesammelten Energie
 */
export function calculatePrestigePoints(gameState) {
  const energyResource = gameState.resources?.energy;
  if (!energyResource) return 0;
  
  const totalEnergy = energyResource.totalEarned || energyResource.amount || 0;
  
  // Formel: Prestige-Punkte = Wurzel(Energie / 100.000)
  // Bei 100.000 Energie = 1 Prestige-Punkt
  // Bei 400.000 Energie = 2 Prestige-Punkte
  // Bei 1.000.000 Energie = ~3.16 Prestige-Punkte
  // Bei 10.000.000 Energie = 10 Prestige-Punkte
  
  const basePoints = Math.sqrt(totalEnergy / 100000);
  
  // Achievement-Boni anwenden
  const achievementBonus = gameState.achievementPrestigeBonus || 1;
  
  // Prestige-Upgrade-Boni (aus vorherigen Prestiges)
  let prestigeMultiplier = 1;
  if (gameState.prestigeUpgrades) {
    const upgrades = gameState.prestigeUpgrades.map(u => ({
      ...u,
      level: u.level || 0
    }));
    
    // Erstelle temporäre Upgrade-Objekte zum Berechnen
    const tempUpgrades = [];
    for (const saved of upgrades) {
      // Hier müssten wir die originalen Definitionen laden
      // Für jetzt nutzen wir direkt die gespeicherten Werte
      if (saved.id === 'prestige_gain' && saved.level > 0) {
        prestigeMultiplier += saved.level * 0.2; // +20% pro Level
      }
    }
  }
  
  const totalPoints = Math.floor(basePoints * achievementBonus * prestigeMultiplier);
  
  return Math.max(0, totalPoints);
}

/**
 * Führt den Prestige-Reset durch
 */
export function doPrestige(game, gameState) {
  // Berechne neue Prestige-Punkte
  const newPrestigePoints = calculatePrestigePoints(gameState);
  const currentPrestige = gameState.resources?.prestige?.amount || 0;
  const gained = newPrestigePoints - currentPrestige;
  
  console.log(`⭐ Prestige! Erhalte ${gained} neue Prestige-Punkte (Total: ${newPrestigePoints})`);
  
  // Speichere Prestige-Punkte und Prestige-Upgrades (behalten)
  const preservedPrestigePoints = newPrestigePoints;
  const preservedPrestigeUpgrades = gameState.prestigeUpgrades ? [...gameState.prestigeUpgrades] : [];
  const preservedAchievements = gameState.unlockedAchievements ? [...gameState.unlockedAchievements] : [];
  const preservedPrestigeCount = (gameState.prestigeCount || 0) + 1;
  const preservedTotalPrestige = (gameState.totalPrestigePoints || 0) + gained;
  
  // Reset alle Ressourcen (außer Prestige)
  if (gameState.resources) {
    for (const [id, resource] of Object.entries(gameState.resources)) {
      if (id === 'prestige') continue; // Prestige-Punkte behalten
      
      resource.amount = 0;
      resource.totalEarned = 0;
      resource.unlocked = false;
    }
    
    // Energie wieder freischalten
    if (gameState.resources.energy) {
      gameState.resources.energy.unlocked = true;
      gameState.resources.energy.amount = 10; // Startwert
    }
    
    // Wasser freischalten (ist am Anfang verfügbar)
    if (gameState.resources.water) {
      gameState.resources.water.unlocked = true;
    }
    
    // Prestige-Ressource setzen
    if (gameState.resources.prestige) {
      gameState.resources.prestige.amount = preservedPrestigePoints;
      gameState.resources.prestige.unlocked = true;
    }
  }
  
  // Reset Upgrades
  gameState.upgrades = {};
  
  // Reset Forschung
  gameState.completedResearch = [];
  
  // Prestige-Daten wiederherstellen
  gameState.prestigeUpgrades = preservedPrestigeUpgrades;
  gameState.unlockedAchievements = preservedAchievements;
  gameState.prestigeCount = preservedPrestigeCount;
  gameState.totalPrestigePoints = preservedTotalPrestige;
  
  // Timestamp aktualisieren
  gameState.lastOnline = Date.now();
  
  // Speichern
  gameState.save();
  
  console.log('✅ Prestige-Reset abgeschlossen!');
}

/**
 * Gibt den effektiven Prestige-Bonus zurück (veraltet, wird nicht mehr verwendet)
 * Die neuen Boni werden direkt in core.js angewendet
 */
export function getEffectivePrestigeBonus(gameState) {
  // Diese Funktion wird für Abwärtskompatibilität behalten
  // Die eigentlichen Boni werden jetzt über calculatePrestigeBonuses() berechnet
  return 1;
}
