// game-state.js
import resourcesList from './resources-def.js'; // Liste aller Ressourcen

export class GameState {
constructor() {
    const storageValue = localStorage.getItem("gameState");
    let savedState = null;

    if (storageValue && storageValue !== "undefined") {
      try {
        savedState = JSON.parse(storageValue);
        Object.assign(this, savedState);
      } catch (e) {
        // Ignoriere kaputte Saves, verwende Default
      }
    }

    // Alle aktuell definierten Ressourcen initialisieren
    const resIds = resourcesList.map(r => r.id);  // z.B. ['stein','holz',...]
    resIds.forEach(id => {
      this[id] = this[id] ?? 0;
    });

    // Gesamtverdienst-Tracking dynamisch aufbauen
    this.totalEarned = this.totalEarned ?? {};
    resIds.forEach(id => {
      if (typeof this.totalEarned[id] !== 'number') {
        this.totalEarned[id] = 0;
      }
    });

    this.upgrades         = this.upgrades         ?? [];
    this.prestigeUpgrades = this.prestigeUpgrades ?? [];

    // Prestige-System
    this.prestige           = this.prestige           ?? 0;
    this.prestigeBaseBonus  = this.prestigeBaseBonus  ?? 1;
    this.prestigeUpgradeMult = this.prestigeUpgradeMult ?? 1;

    // Sonstige Flags / Tracking
    this.hasOfflineBonus        = this.hasOfflineBonus        ?? false;
    this.totalClicks            = this.totalClicks            ?? 0;
    this.prestigeCount          = this.prestigeCount          ?? 0;
    this.totalPrestigePoints    = this.totalPrestigePoints    ?? 0;
    this.achievementPrestigeBonus = this.achievementPrestigeBonus ?? 1;
    this.startTime              = this.startTime              ?? Date.now();

    // Offline-Tracking
    this.lastOnline = this.lastOnline ?? Date.now();

    this.save();
  }


  // Spielstand speichern
  save() {
    this.lastOnline = Date.now(); // ← Zeitstempel aktualisieren
    localStorage.setItem("gameState", JSON.stringify(this));
  }

  // Spielstand zurücksetzen
  // game-state.js – reset ohne removeItem
reset() {
  // Alle Ressourcen anhand totalEarned zurücksetzen
  if (this.totalEarned) {
    for (const res in this.totalEarned) {
      this[res] = 0;
      this.totalEarned[res] = 0;
    }
  }

  for (const key of Object.keys(this)) {
    if (['prestige', 'prestigeBaseBonus', 'prestigeUpgradeMult'].includes(key)) continue;
    if (typeof this[key] === 'number' && !(key in (this.totalEarned || {}))) {
      this[key] = 0;
    }
  }

  this.upgrades = [];
  this.prestigeUpgrades = [];

  this.prestige = 0;
  this.prestigeBaseBonus = 1;
  this.prestigeUpgradeMult = 1;

  this.totalClicks = 0;
  this.prestigeCount = 0;
  this.totalPrestigePoints = 0;
  this.achievementPrestigeBonus = 1;

  this.hasOfflineBonus = false;
  this.lastOnline = Date.now();

  this.save();
}

  // Export: Serialisiert und kodiert den Spielstand als Base64
  export() {
    const savedState = JSON.stringify(this);
    const encoded = btoa(savedState);
    alert("Exportiert: " + encoded);
    return encoded;
  }

  // Importiert und setzt einen Spielstand aus einem Base64-String
  import(encodedState) {
    try {
      const decoded = atob(encodedState);
      const parsedState = JSON.parse(decoded);
      Object.assign(this, parsedState);
      this.save();
      alert("Import erfolgreich!");
    } catch (e) {
      alert("Fehler beim Importieren: " + e.message);
    }
  }
}

const gameState = new GameState();

// WICHTIG:
export default gameState;
// Falls du die Klasse auch brauchst:
// export { GameState };
