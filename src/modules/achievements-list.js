// ============================================
// Achievement-Definitionen für Space Colonies
// ============================================

/**
 * Achievement-Struktur:
 * - id: Eindeutige ID
 * - name: Anzeigename
 * - description: Beschreibung
 * - icon: Emoji
 * - category: 'milestone' | 'building' | 'research' | 'special' | 'hidden' | 'prestige'
 * - hidden: Verstecktes Achievement? (Standard: false)
 * - condition: Bedingung zum Freischalten
 * - reward: Belohnung (optional)
 */

const achievementDefinitions = [
  
  // ============================================
  // RESSOURCEN-MEILENSTEINE
  // ============================================
  
  {
    id: 'first_energy',
    name: 'Erste Energie',
    icon: '⚡',
    description: 'Sammle deine erste Energie',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'energy',
      amount: 1
    },
    reward: {
      type: 'production_bonus',
      resource: 'energy',
      bonus: 0.05 // +5% Energie
    }
  },
  
  {
    id: 'energy_100',
    name: 'Energie-Sammler',
    icon: '⚡',
    description: 'Sammle 100 Energie',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'energy',
      amount: 100
    },
    reward: {
      type: 'production_bonus',
      resource: 'energy',
      bonus: 0.1 // +10% Energie
    }
  },
  
  {
    id: 'energy_1k',
    name: 'Energie-Meister',
    icon: '⚡',
    description: 'Sammle 1.000 Energie',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'energy',
      amount: 1000
    },
    reward: {
      type: 'production_bonus',
      resource: 'energy',
      bonus: 0.15
    }
  },
  
  {
    id: 'energy_1m',
    name: 'Energie-Titan',
    icon: '⚡',
    description: 'Sammle 1.000.000 Energie',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'energy',
      amount: 1000000
    },
    reward: {
      type: 'prestige_multiplier',
      bonus: 0.1 // +10% Prestige-Punkte
    }
  },
  
  {
    id: 'water_100',
    name: 'Wasser-Sammler',
    icon: '💧',
    description: 'Sammle 100 Wasser',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'water',
      amount: 100
    },
    reward: {
      type: 'production_bonus',
      resource: 'water',
      bonus: 0.1
    }
  },
  
  {
    id: 'food_100',
    name: 'Erster Landwirt',
    icon: '🌾',
    description: 'Produziere 100 Nahrung',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'food',
      amount: 100
    },
    reward: {
      type: 'production_bonus',
      resource: 'food',
      bonus: 0.1
    }
  },
  
  {
    id: 'population_10',
    name: 'Kleine Gemeinschaft',
    icon: '👥',
    description: 'Erreiche 10 Kolonisten',
    category: 'milestone',
    condition: {
      type: 'resource_current',
      resource: 'population',
      amount: 10
    },
    reward: {
      type: 'production_bonus',
      resource: 'population',
      bonus: 0.1
    }
  },
  
  {
    id: 'population_50',
    name: 'Blühende Kolonie',
    icon: '👥',
    description: 'Erreiche 50 Kolonisten',
    category: 'milestone',
    condition: {
      type: 'resource_current',
      resource: 'population',
      amount: 50
    },
    reward: {
      type: 'production_bonus',
      resource: 'population',
      bonus: 0.15
    }
  },
  
  {
    id: 'population_100',
    name: 'Metropole',
    icon: '🌇',
    description: 'Erreiche 100 Kolonisten',
    category: 'milestone',
    condition: {
      type: 'resource_current',
      resource: 'population',
      amount: 100
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.05 // +5% auf alles
    }
  },
  
  {
    id: 'metal_500',
    name: 'Industrieller',
    icon: '🔩',
    description: 'Sammle 500 Metall',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'metal',
      amount: 500
    },
    reward: {
      type: 'production_bonus',
      resource: 'metal',
      bonus: 0.15
    }
  },
  
  {
    id: 'crystals_100',
    name: 'Kristall-Jäger',
    icon: '💎',
    description: 'Sammle 100 Kristalle',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'crystals',
      amount: 100
    },
    reward: {
      type: 'production_bonus',
      resource: 'crystals',
      bonus: 0.2
    }
  },
  
  {
    id: 'fuel_50',
    name: 'Raketentreibstoff',
    icon: '⛽',
    description: 'Produziere 50 Treibstoff',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'fuel',
      amount: 50
    },
    reward: {
      type: 'production_bonus',
      resource: 'fuel',
      bonus: 0.25
    }
  },
  
  {
    id: 'research_100',
    name: 'Wissenschaftler',
    icon: '🔬',
    description: 'Sammle 100 Forschungspunkte',
    category: 'milestone',
    condition: {
      type: 'resource_total',
      resource: 'research',
      amount: 100
    },
    reward: {
      type: 'production_bonus',
      resource: 'research',
      bonus: 0.15
    }
  },
  
  // ============================================
  // GEBÄUDE-ACHIEVEMENTS
  // ============================================
  
  {
    id: 'first_building',
    name: 'Erster Baumeister',
    icon: '🏗️',
    description: 'Kaufe dein erstes Gebäude',
    category: 'building',
    condition: {
      type: 'total_buildings',
      amount: 1
    },
    reward: {
      type: 'click_bonus',
      bonus: 1 // +1 Energie pro Click
    }
  },
  
  {
    id: 'buildings_10',
    name: 'Architekt',
    icon: '🏛️',
    description: 'Baue 10 Gebäude',
    category: 'building',
    condition: {
      type: 'total_buildings',
      amount: 10
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.05
    }
  },
  
  {
    id: 'buildings_50',
    name: 'Stadt-Planer',
    icon: '🏙️',
    description: 'Baue 50 Gebäude',
    category: 'building',
    condition: {
      type: 'total_buildings',
      amount: 50
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.1
    }
  },
  
  {
    id: 'solar_power',
    name: 'Solarkraft',
    icon: '☀️',
    description: 'Baue 10 Solarpanels',
    category: 'building',
    condition: {
      type: 'building_count',
      building: 'solar_panel',
      amount: 10
    },
    reward: {
      type: 'building_bonus',
      building: 'solar_panel',
      bonus: 0.1
    }
  },
  
  {
    id: 'fusion_pioneer',
    name: 'Fusions-Pionier',
    icon: '⚛️',
    description: 'Baue deinen ersten Fusionsreaktor',
    category: 'building',
    condition: {
      type: 'building_count',
      building: 'fusion_reactor',
      amount: 1
    },
    reward: {
      type: 'building_bonus',
      building: 'fusion_reactor',
      bonus: 0.15
    }
  },
  
  {
    id: 'farming_empire',
    name: 'Landwirtschafts-Imperium',
    icon: '🌾',
    description: 'Baue 5 Hydroponik-Farmen',
    category: 'building',
    condition: {
      type: 'building_count',
      building: 'hydroponic_farm',
      amount: 5
    },
    reward: {
      type: 'building_bonus',
      building: 'hydroponic_farm',
      bonus: 0.2
    }
  },
  
  {
    id: 'research_complex',
    name: 'Forschungskomplex',
    icon: '🔬',
    description: 'Baue 3 Forschungslabore',
    category: 'building',
    condition: {
      type: 'building_count',
      building: 'research_lab',
      amount: 3
    },
    reward: {
      type: 'building_bonus',
      building: 'research_lab',
      bonus: 0.25
    }
  },
  
  // ============================================
  // FORSCHUNGS-ACHIEVEMENTS
  // ============================================
  
  {
    id: 'first_research',
    name: 'Erste Entdeckung',
    icon: '💡',
    description: 'Schließe deine erste Forschung ab',
    category: 'research',
    condition: {
      type: 'research_count',
      amount: 1
    },
    reward: {
      type: 'production_bonus',
      resource: 'research',
      bonus: 0.1
    }
  },
  
  {
    id: 'researcher',
    name: 'Forscher',
    icon: '🔬',
    description: 'Schließe 5 Forschungen ab',
    category: 'research',
    condition: {
      type: 'research_count',
      amount: 5
    },
    reward: {
      type: 'production_bonus',
      resource: 'research',
      bonus: 0.15
    }
  },
  
  {
    id: 'scientist',
    name: 'Wissenschaftler',
    icon: '🧑‍🔬',
    description: 'Schließe 10 Forschungen ab',
    category: 'research',
    condition: {
      type: 'research_count',
      amount: 10
    },
    reward: {
      type: 'production_bonus',
      resource: 'research',
      bonus: 0.25
    }
  },
  
  {
    id: 'tier1_complete',
    name: 'Grundlagen-Technologien',
    icon: '✅',
    description: 'Schließe alle Tier 1 Forschungen ab',
    category: 'research',
    condition: {
      type: 'research_tier_complete',
      tier: 1
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.1
    }
  },
  
  {
    id: 'tier2_complete',
    name: 'Fortgeschrittene Technologien',
    icon: '✅',
    description: 'Schließe alle Tier 2 Forschungen ab',
    category: 'research',
    condition: {
      type: 'research_tier_complete',
      tier: 2
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.15
    }
  },
  
  {
    id: 'tier3_complete',
    name: 'Hochentwickelte Zivilisation',
    icon: '🌠',
    description: 'Schließe alle Tier 3 Forschungen ab',
    category: 'research',
    condition: {
      type: 'research_tier_complete',
      tier: 3
    },
    reward: {
      type: 'prestige_multiplier',
      bonus: 0.25 // +25% Prestige-Punkte
    }
  },
  
  // ============================================
  // SPEZIELLE HERAUSFORDERUNGEN
  // ============================================
  
  {
    id: 'speed_clicker',
    name: 'Schnellklicker',
    icon: '⏱️',
    description: 'Klicke 100 Mal in 10 Sekunden',
    category: 'special',
    condition: {
      type: 'clicks_in_time',
      clicks: 100,
      seconds: 10
    },
    reward: {
      type: 'click_bonus',
      bonus: 5
    }
  },
  
  {
    id: 'click_master',
    name: 'Klick-Meister',
    icon: '👆',
    description: 'Klicke insgesamt 1000 Mal',
    category: 'special',
    condition: {
      type: 'total_clicks',
      amount: 1000
    },
    reward: {
      type: 'click_bonus',
      bonus: 3
    }
  },
  
  {
    id: 'no_click_master',
    name: 'Automatisierungs-Experte',
    icon: '🤖',
    description: 'Erreiche 1000 Energie ohne zu klicken (nach dem ersten Spiel)',
    category: 'special',
    hidden: true,
    condition: {
      type: 'resource_without_clicks',
      resource: 'energy',
      amount: 1000
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.1
    }
  },
  
  {
    id: 'speed_run',
    name: 'Geschwindigkeits-Läufer',
    icon: '⚡',
    description: 'Erreiche 10.000 Energie in unter 30 Minuten',
    category: 'special',
    condition: {
      type: 'resource_in_time',
      resource: 'energy',
      amount: 10000,
      minutes: 30
    },
    reward: {
      type: 'prestige_multiplier',
      bonus: 0.1
    }
  },
  
  {
    id: 'full_space',
    name: 'Volle Auslastung',
    icon: '🏭',
    description: 'Fülle alle verfügbaren Bauplätze',
    category: 'special',
    condition: {
      type: 'space_full'
    },
    reward: {
      type: 'space_bonus',
      bonus: 5 // +5 permanente Plätze
    }
  },
  
  {
    id: 'efficiency_master',
    name: 'Effizienz-Meister',
    icon: '♻️',
    description: 'Kaufe alle Effizienz-Upgrades',
    category: 'special',
    condition: {
      type: 'all_efficiency_upgrades'
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.15
    }
  },
  
  // ============================================
  // VERSTECKTE/EASTER EGG ACHIEVEMENTS
  // ============================================
  
  {
    id: 'night_owl',
    name: 'Nachteule',
    icon: '🦉',
    description: 'Spiele zwischen 2 und 4 Uhr nachts',
    category: 'hidden',
    hidden: true,
    condition: {
      type: 'time_of_day',
      hourStart: 2,
      hourEnd: 4
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.05
    }
  },
  
  {
    id: 'long_idle',
    name: 'Geduldiger Kolonist',
    icon: '⏳',
    description: 'Komme nach 24 Stunden Offline zurück',
    category: 'hidden',
    hidden: true,
    condition: {
      type: 'offline_time',
      hours: 24
    },
    reward: {
      type: 'offline_bonus',
      bonus: 0.2 // +20% Offline-Produktion
    }
  },
  
  {
    id: 'lucky_number',
    name: 'Glückszahl',
    icon: '🍀',
    description: 'Erreiche exakt 777 Energie',
    category: 'hidden',
    hidden: true,
    condition: {
      type: 'exact_resource',
      resource: 'energy',
      amount: 777
    },
    reward: {
      type: 'luck_bonus',
      bonus: 0.07 // +7% auf alles (Glück!)
    }
  },
  
  {
    id: 'minimalist',
    name: 'Minimalist',
    icon: '🧘',
    description: 'Erreiche 1000 Energie mit nur 5 Gebäuden',
    category: 'hidden',
    hidden: true,
    condition: {
      type: 'resource_with_building_limit',
      resource: 'energy',
      amount: 1000,
      maxBuildings: 5
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.1
    }
  },
  
  // ============================================
  // PRESTIGE-ACHIEVEMENTS
  // ============================================
  
  {
    id: 'first_prestige',
    name: 'Neue Horizonte',
    icon: '🌟',
    description: 'Führe deinen ersten Prestige durch',
    category: 'prestige',
    condition: {
      type: 'prestige_count',
      amount: 1
    },
    reward: {
      type: 'prestige_multiplier',
      bonus: 0.1
    }
  },
  
  {
    id: 'prestige_5',
    name: 'Multiversum-Entdecker',
    icon: '🌌',
    description: 'Führe 5 Prestiges durch',
    category: 'prestige',
    condition: {
      type: 'prestige_count',
      amount: 5
    },
    reward: {
      type: 'prestige_multiplier',
      bonus: 0.2
    }
  },
  
  {
    id: 'prestige_10',
    name: 'Zeit-Reisender',
    icon: '⏰',
    description: 'Führe 10 Prestiges durch',
    category: 'prestige',
    condition: {
      type: 'prestige_count',
      amount: 10
    },
    reward: {
      type: 'prestige_multiplier',
      bonus: 0.5 // +50% Prestige-Punkte!
    }
  },
  
  {
    id: 'prestige_points_100',
    name: 'Prestige-Sammler',
    icon: '🌟',
    description: 'Sammle insgesamt 100 Prestige-Punkte',
    category: 'prestige',
    condition: {
      type: 'total_prestige_points',
      amount: 100
    },
    reward: {
      type: 'global_bonus',
      bonus: 0.25
    }
  }
];

// ============================================
// HILFSFUNKTIONEN
// ============================================

/**
 * Gibt alle sichtbaren Achievements zurück
 */
export function getVisibleAchievements() {
  return achievementDefinitions.filter(a => !a.hidden);
}

/**
 * Gibt alle Achievements einer Kategorie zurück
 */
export function getAchievementsByCategory(category) {
  return achievementDefinitions.filter(a => a.category === category);
}

/**
 * Gibt ein Achievement anhand der ID zurück
 */
export function getAchievementById(id) {
  return achievementDefinitions.find(a => a.id === id);
}

/**
 * Berechnet den Gesamt-Bonus aller freigeschalteten Achievements
 */
export function calculateAchievementBonuses(unlockedAchievements) {
  const bonuses = {
    global: 0,
    click: 0,
    prestige: 0,
    offline: 0,
    resources: {},
    buildings: {},
    space: 0
  };
  
  for (const achievementId of unlockedAchievements) {
    const achievement = getAchievementById(achievementId);
    if (!achievement || !achievement.reward) continue;
    
    const reward = achievement.reward;
    
    switch (reward.type) {
      case 'global_bonus':
      case 'luck_bonus':
        bonuses.global += reward.bonus;
        break;
      case 'click_bonus':
        bonuses.click += reward.bonus;
        break;
      case 'prestige_multiplier':
        bonuses.prestige += reward.bonus;
        break;
      case 'offline_bonus':
        bonuses.offline += reward.bonus;
        break;
      case 'production_bonus':
        if (!bonuses.resources[reward.resource]) {
          bonuses.resources[reward.resource] = 0;
        }
        bonuses.resources[reward.resource] += reward.bonus;
        break;
      case 'building_bonus':
        if (!bonuses.buildings[reward.building]) {
          bonuses.buildings[reward.building] = 0;
        }
        bonuses.buildings[reward.building] += reward.bonus;
        break;
      case 'space_bonus':
        bonuses.space += reward.bonus;
        break;
    }
  }
  
  return bonuses;
}

// ============================================
// EXPORT
// ============================================

export default achievementDefinitions;
