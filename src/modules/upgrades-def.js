// ============================================
// Upgrades/Gebäude-Definitionen für Space Colonies
// ============================================

/**
 * Upgrade-Struktur:
 * - id: Eindeutige ID
 * - name: Anzeigename
 * - description: Beschreibung
 * - icon: Emoji
 * - type: 'generator' | 'efficiency' | 'click' | 'space' | 'unlock'
 * - size: Bauplatz-Größe (1-3)
 * - maxCount: Maximale Anzahl (-1 = unbegrenzt)
 * - baseCost: Grundkosten {resourceId: amount}
 * - costScaling: Multiplikator pro Kauf (Standard: 1.15)
 * - produces: Was wird produziert {resourceId: amountPerSecond}
 * - requires: Freischalt-Bedingungen (optional)
 */

const upgradeDefinitions = [
  
  // ============================================
  // PHASE 1: FRÜHE KOLONIE - ENERGIE & WASSER
  // ============================================
  
  // --- Energie-Generatoren ---
  
  {
    id: 'solar_panel',
    name: 'Solarpanel',
    icon: '☀️',
    description: 'Sammelt Sonnenenergie. Klein und effizient.',
    type: 'generator',
    size: 1,
    maxCount: -1, // Unbegrenzt
    baseCost: {
      energy: 10
    },
    costScaling: 1.15,
    produces: {
      energy: 0.5 // 0.5 Energie/Sekunde
    },
    unlocked: true
  },
  
  {
    id: 'fusion_reactor',
    name: 'Fusionsreaktor',
    icon: '⚛️',
    description: 'Fortgeschrittener Energiereaktor. Benötigt viel Platz, aber sehr produktiv.',
    type: 'generator',
    size: 3,
    maxCount: -1,
    baseCost: {
      energy: 500,
      metal: 50,
      crystals: 10
    },
    costScaling: 1.2,
    produces: {
      energy: 10 // 10 Energie/Sekunde
    },
    unlocked: false,
    requires: {
      resource: 'crystals',
      amount: 20
    }
  },
  
  // --- Wasser-Generatoren ---
  
  {
    id: 'water_extractor',
    name: 'Wassersammler',
    icon: '💧',
    description: 'Extrahiert Wasser aus der Atmosphäre.',
    type: 'generator',
    size: 1,
    maxCount: -1,
    baseCost: {
      energy: 25
    },
    costScaling: 1.15,
    produces: {
      water: 0.2
    },
    unlocked: true
  },
  
  {
    id: 'ice_mining',
    name: 'Eis-Bergbau',
    icon: '❄️',
    description: 'Gewinnt Wasser aus unterirdischen Eisvorkommen.',
    type: 'generator',
    size: 2,
    maxCount: -1,
    baseCost: {
      energy: 200,
      metal: 30
    },
    costScaling: 1.18,
    produces: {
      water: 2
    },
    unlocked: false,
    requires: {
      resource: 'metal',
      amount: 50
    }
  },
  
  // --- Nahrungs-Generatoren ---
  
  {
    id: 'hydroponic_farm',
    name: 'Hydroponik-Farm',
    icon: '🌾',
    description: 'Produziert Nahrung aus Wasser und Energie.',
    type: 'generator',
    size: 2,
    maxCount: -1,
    baseCost: {
      energy: 50,
      water: 30
    },
    costScaling: 1.15,
    produces: {
      food: 0.15
    },
    unlocked: false,
    requires: {
      resource: 'water',
      amount: 10
    }
  },
  
  {
    id: 'biodome',
    name: 'Bio-Dom',
    icon: '🌱',
    description: 'Großes Ökosystem zur Nahrungsproduktion.',
    type: 'generator',
    size: 3,
    maxCount: -1,
    baseCost: {
      energy: 300,
      water: 100,
      metal: 50
    },
    costScaling: 1.2,
    produces: {
      food: 1.5
    },
    unlocked: false,
    requires: {
      resource: 'metal',
      amount: 100
    }
  },
  
  // --- Bevölkerungs-Generatoren ---
  
  {
    id: 'habitat',
    name: 'Wohnmodul',
    icon: '🏘️',
    description: 'Unterkunft für neue Kolonisten.',
    type: 'generator',
    size: 2,
    maxCount: -1,
    baseCost: {
      energy: 80,
      water: 50,
      food: 100
    },
    costScaling: 1.2,
    produces: {
      population: 0.05 // Langsames Wachstum
    },
    unlocked: false,
    requires: {
      resource: 'food',
      amount: 20
    }
  },
  
  {
    id: 'colony_center',
    name: 'Koloniezentrum',
    icon: '🏛️',
    description: 'Zentrales Gebäude das mehr Kolonisten anzieht.',
    type: 'generator',
    size: 3,
    maxCount: 5, // Maximal 5 Stück
    baseCost: {
      energy: 500,
      metal: 100,
      food: 300
    },
    costScaling: 1.3,
    produces: {
      population: 0.2
    },
    unlocked: false,
    requires: {
      upgrade: 'habitat',
      count: 3
    }
  },
  
  // ============================================
  // PHASE 2: INDUSTRIALISIERUNG
  // ============================================
  
  // --- Gestein & Metall ---
  
  {
    id: 'quarry',
    name: 'Steinbruch',
    icon: '⛏️',
    description: 'Fördert Gestein aus dem Boden.',
    type: 'generator',
    size: 2,
    maxCount: -1,
    baseCost: {
      energy: 100,
      population: 10
    },
    costScaling: 1.15,
    produces: {
      stone: 0.3
    },
    unlocked: false,
    requires: {
      resource: 'population',
      amount: 5
    }
  },
  
  {
    id: 'metal_refinery',
    name: 'Metall-Raffinerie',
    icon: '🏭',
    description: 'Verarbeitet Gestein zu Metall.',
    type: 'generator',
    size: 3,
    maxCount: -1,
    baseCost: {
      energy: 200,
      stone: 200,
      population: 15
    },
    costScaling: 1.18,
    produces: {
      metal: 0.2
    },
    consumes: {
      stone: 0.5 // Verbraucht 0.5 Gestein pro Sekunde
    },
    unlocked: false,
    requires: {
      resource: 'stone',
      amount: 50
    }
  },
  
  // --- Kristalle ---
  
  {
    id: 'crystal_mine',
    name: 'Kristall-Mine',
    icon: '💎',
    description: 'Fördert seltene Kristalle aus tiefen Schichten.',
    type: 'generator',
    size: 2,
    maxCount: -1,
    baseCost: {
      energy: 300,
      metal: 100,
      population: 20
    },
    costScaling: 1.2,
    produces: {
      crystals: 0.1
    },
    unlocked: false,
    requires: {
      resource: 'metal',
      amount: 100
    }
  },
  
  {
    id: 'crystal_synthesizer',
    name: 'Kristall-Synthesizer',
    icon: '✨',
    description: 'Synthetisiert Kristalle aus Energie.',
    type: 'generator',
    size: 3,
    maxCount: -1,
    baseCost: {
      energy: 1000,
      metal: 200,
      crystals: 50
    },
    costScaling: 1.25,
    produces: {
      crystals: 0.5
    },
    consumes: {
      energy: 2 // Verbraucht 2 Energie pro Sekunde
    },
    unlocked: false,
    requires: {
      resource: 'crystals',
      amount: 50
    }
  },
  
  // ============================================
  // PHASE 3: EXPANSION
  // ============================================
  
  // --- Treibstoff ---
  
  {
    id: 'fuel_refinery',
    name: 'Treibstoff-Raffinerie',
    icon: '⛽',
    description: 'Produziert hochenergetischen Treibstoff.',
    type: 'generator',
    size: 3,
    maxCount: -1,
    baseCost: {
      energy: 500,
      metal: 150,
      crystals: 50
    },
    costScaling: 1.2,
    produces: {
      fuel: 0.1
    },
    consumes: {
      crystals: 0.05,
      energy: 1
    },
    unlocked: false,
    requires: {
      resource: 'crystals',
      amount: 50
    }
  },
  
  // --- Forschung ---
  
  {
    id: 'research_lab',
    name: 'Forschungslabor',
    icon: '🔬',
    description: 'Generiert Forschungspunkte für neue Technologien.',
    type: 'generator',
    size: 2,
    maxCount: -1,
    baseCost: {
      energy: 200,
      metal: 80,
      population: 10
    },
    costScaling: 1.18,
    produces: {
      research: 0.1
    },
    unlocked: false,
    requires: {
      resource: 'population',
      amount: 10
    }
  },
  
  {
    id: 'quantum_computer',
    name: 'Quantencomputer',
    icon: '💻',
    description: 'Fortgeschrittene Forschungseinrichtung.',
    type: 'generator',
    size: 3,
    maxCount: -1,
    baseCost: {
      energy: 1000,
      metal: 300,
      crystals: 100
    },
    costScaling: 1.25,
    produces: {
      research: 1
    },
    unlocked: false,
    requires: {
      upgrade: 'research_lab',
      count: 5
    }
  },
  
  // ============================================
  // EFFIZIENZ-UPGRADES
  // ============================================
  
  {
    id: 'solar_efficiency_1',
    name: 'Verbesserte Solarzellen',
    icon: '🔆',
    description: 'Erhöht die Energieproduktion aller Solarpanels um 50%.',
    type: 'efficiency',
    size: 0, // Nimmt keinen Platz
    maxCount: 1,
    baseCost: {
      energy: 100,
      metal: 20
    },
    effect: {
      target: 'solar_panel',
      multiplier: 1.5
    },
    unlocked: false,
    requires: {
      upgrade: 'solar_panel',
      count: 5
    }
  },
  
  {
    id: 'solar_efficiency_2',
    name: 'Hochleistungs-Solarzellen',
    icon: '🔆',
    description: 'Erhöht die Energieproduktion aller Solarpanels um weitere 100%.',
    type: 'efficiency',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 500,
      metal: 100,
      crystals: 20
    },
    effect: {
      target: 'solar_panel',
      multiplier: 2
    },
    unlocked: false,
    requires: {
      upgrade: 'solar_efficiency_1',
      count: 1
    }
  },
  
  {
    id: 'water_efficiency',
    name: 'Wasser-Recycling',
    icon: '♻️',
    description: 'Verdoppelt die Wasserproduktion aller Wassersammler.',
    type: 'efficiency',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 200,
      water: 100
    },
    effect: {
      target: 'water_extractor',
      multiplier: 2
    },
    unlocked: false,
    requires: {
      upgrade: 'water_extractor',
      count: 5
    }
  },
  
  {
    id: 'farming_automation',
    name: 'Automatisierte Landwirtschaft',
    icon: '🤖',
    description: 'Erhöht die Nahrungsproduktion aller Farmen um 100%.',
    type: 'efficiency',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 300,
      metal: 80,
      population: 15
    },
    effect: {
      target: 'hydroponic_farm',
      multiplier: 2
    },
    unlocked: false,
    requires: {
      upgrade: 'hydroponic_farm',
      count: 3
    }
  },
  
  // ============================================
  // CLICK-UPGRADES
  // ============================================
  
  {
    id: 'click_power_1',
    name: 'Energie-Verstärker I',
    icon: '👆',
    description: '+1 Energie pro Klick',
    type: 'click',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 50
    },
    effect: {
      clickBonus: 1
    },
    unlocked: true
  },
  
  {
    id: 'click_power_2',
    name: 'Energie-Verstärker II',
    icon: '👆',
    description: '+2 Energie pro Klick',
    type: 'click',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 200
    },
    effect: {
      clickBonus: 2
    },
    unlocked: false,
    requires: {
      upgrade: 'click_power_1',
      count: 1
    }
  },
  
  {
    id: 'click_power_3',
    name: 'Energie-Verstärker III',
    icon: '👆',
    description: '+5 Energie pro Klick',
    type: 'click',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 1000,
      crystals: 20
    },
    effect: {
      clickBonus: 5
    },
    unlocked: false,
    requires: {
      upgrade: 'click_power_2',
      count: 1
    }
  },
  
  // ============================================
  // PLATZ-ERWEITERUNGEN
  // ============================================
  
  {
    id: 'expand_colony_1',
    name: 'Kolonien-Erweiterung I',
    icon: '🏗️',
    description: '+5 Bauplätze',
    type: 'space',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 100  // Günstiger: war 200
    },
    effect: {
      spaceIncrease: 5
    },
    unlocked: true  // SOFORT verfügbar! War: false mit Metal-Requirement
  },
  
  {
    id: 'expand_colony_2',
    name: 'Kolonien-Erweiterung II',
    icon: '🏗️',
    description: '+10 Bauplätze',
    type: 'space',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 500,  // Günstiger: war 1000
      water: 100    // Wasser statt Metal + Population
    },
    effect: {
      spaceIncrease: 10
    },
    unlocked: false,
    requires: {
      upgrade: 'expand_colony_1',
      count: 1
    }
  },
  
  {
    id: 'expand_colony_3',
    name: 'Kolonien-Erweiterung III',
    icon: '🏗️',
    description: '+15 Bauplätze',
    type: 'space',
    size: 0,
    maxCount: 1,
    baseCost: {
      energy: 2000,  // Günstiger: war 5000
      metal: 200,    // Günstiger: war 500
      water: 200     // Wasser statt Crystals
    },
    effect: {
      spaceIncrease: 15
    },
    unlocked: false,
    requires: {
      upgrade: 'expand_colony_2',
      count: 1
    }
  }
];

// ============================================
// HILFSFUNKTIONEN
// ============================================

/**
 * Berechnet die aktuellen Kosten für ein Upgrade basierend auf der Anzahl
 */
export function calculateUpgradeCost(upgrade, currentCount = 0) {
  const costs = {};
  const scaling = upgrade.costScaling || 1.15;
  
  for (const [resource, baseAmount] of Object.entries(upgrade.baseCost)) {
    costs[resource] = Math.floor(baseAmount * Math.pow(scaling, currentCount));
  }
  
  return costs;
}

/**
 * Prüft ob ein Upgrade freigeschaltet werden kann
 * WICHTIG: gameState.resources ist jetzt ein Objekt mit {id: {amount, unlocked, ...}}
 */
export function checkUpgradeUnlock(upgradeId, gameState, upgradeCounts) {
  const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
  if (!upgrade || upgrade.unlocked) return false;
  
  if (!upgrade.requires) return false;
  
  const req = upgrade.requires;
  
  // Ressourcen-Bedingung
  if (req.resource) {
    const resourceData = gameState.resources?.[req.resource];
    if (!resourceData) return false;
    
    const currentAmount = resourceData.amount || 0;
    return currentAmount >= req.amount;
  }
  
  // Upgrade-Bedingung
  if (req.upgrade) {
    const currentCount = upgradeCounts[req.upgrade] || 0;
    return currentCount >= req.count;
  }
  
  return false;
}

/**
 * Gibt alle Upgrades einer bestimmten Kategorie zurück
 */
export function getUpgradesByType(type) {
  return upgradeDefinitions.filter(u => u.type === type);
}

/**
 * Gibt ein Upgrade anhand der ID zurück
 */
export function getUpgradeById(id) {
  return upgradeDefinitions.find(u => u.id === id);
}

/**
 * Schaltet ein Upgrade frei
 */
export function unlockUpgrade(upgradeId) {
  const upgrade = upgradeDefinitions.find(u => u.id === upgradeId);
  if (upgrade && !upgrade.unlocked) {
    upgrade.unlocked = true;
    console.log(`🔓 Upgrade freigeschaltet: ${upgrade.icon} ${upgrade.name}`);
    return true;
  }
  return false;
}

// ============================================
// EXPORT
// ============================================

export default upgradeDefinitions;
