// ============================================
// Achievement-Definitionen für Space Colonies
// ============================================

/**
 * Achievement-Struktur:
 * - id: Eindeutige ID
 * - name: Anzeigename
 * - desc: Beschreibung
 * - icon: Emoji
 * - category: 'sammler' | 'klicker' | 'upgrade' | 'prestige' | 'forschung' | 'spezial'
 * - hidden: Verstecktes Achievement? (Standard: false)
 * - checkFn: Funktion die prüft ob Achievement erfüllt ist
 * - rewardFn: Belohnung (optional)
 */

const achievementsList = [
  
  // ============================================
  // RESSOURCEN-MEILENSTEINE
  // ============================================
  
  {
    id: 'first_energy',
    name: 'Erste Energie',
    icon: '⚡',
    desc: 'Sammle deine erste Energie',
    category: 'sammler',
    checkFn: (game) => (game.resources.energy?.totalEarned || 0) >= 1
  },
  
  {
    id: 'energy_100',
    name: 'Energie-Sammler',
    icon: '⚡',
    desc: 'Sammle 100 Energie',
    category: 'sammler',
    checkFn: (game) => (game.resources.energy?.totalEarned || 0) >= 100
  },
  
  {
    id: 'energy_1k',
    name: 'Energie-Meister',
    icon: '⚡',
    desc: 'Sammle 1.000 Energie',
    category: 'sammler',
    checkFn: (game) => (game.resources.energy?.totalEarned || 0) >= 1000
  },
  
  {
    id: 'energy_1m',
    name: 'Energie-Titan',
    icon: '⚡',
    desc: 'Sammle 1.000.000 Energie',
    category: 'sammler',
    checkFn: (game) => (game.resources.energy?.totalEarned || 0) >= 1000000
  },
  
  {
    id: 'water_100',
    name: 'Wasser-Sammler',
    icon: '💧',
    desc: 'Sammle 100 Wasser',
    category: 'sammler',
    checkFn: (game) => (game.resources.water?.totalEarned || 0) >= 100
  },
  
  {
    id: 'food_100',
    name: 'Erster Landwirt',
    icon: '🌾',
    desc: 'Produziere 100 Nahrung',
    category: 'sammler',
    checkFn: (game) => (game.resources.food?.totalEarned || 0) >= 100
  },
  
  {
    id: 'population_10',
    name: 'Kleine Gemeinschaft',
    icon: '👥',
    desc: 'Erreiche 10 Kolonisten',
    category: 'sammler',
    checkFn: (game) => (game.resources.population?.amount || 0) >= 10
  },
  
  {
    id: 'population_50',
    name: 'Blühende Kolonie',
    icon: '👥',
    desc: 'Erreiche 50 Kolonisten',
    category: 'sammler',
    checkFn: (game) => (game.resources.population?.amount || 0) >= 50
  },
  
  {
    id: 'population_100',
    name: 'Metropole',
    icon: '🌇',
    desc: 'Erreiche 100 Kolonisten',
    category: 'sammler',
    checkFn: (game) => (game.resources.population?.amount || 0) >= 100
  },
  
  {
    id: 'metal_500',
    name: 'Industrieller',
    icon: '🔩',
    desc: 'Sammle 500 Metall',
    category: 'sammler',
    checkFn: (game) => (game.resources.metal?.totalEarned || 0) >= 500
  },
  
  {
    id: 'crystals_100',
    name: 'Kristall-Jäger',
    icon: '💎',
    desc: 'Sammle 100 Kristalle',
    category: 'sammler',
    checkFn: (game) => (game.resources.crystals?.totalEarned || 0) >= 100
  },
  
  {
    id: 'fuel_50',
    name: 'Raketentreibstoff',
    icon: '⛽',
    desc: 'Produziere 50 Treibstoff',
    category: 'sammler',
    checkFn: (game) => (game.resources.fuel?.totalEarned || 0) >= 50
  },
  
  {
    id: 'research_100',
    name: 'Wissenschaftler',
    icon: '🔬',
    desc: 'Sammle 100 Forschungspunkte',
    category: 'sammler',
    checkFn: (game) => (game.resources.research?.totalEarned || 0) >= 100
  },
  
  // ============================================
  // GEBÄUDE-ACHIEVEMENTS
  // ============================================
  
  {
    id: 'first_building',
    name: 'Erster Baumeister',
    icon: '🏗️',
    desc: 'Kaufe dein erstes Gebäude',
    category: 'upgrade',
    checkFn: (game) => game.getTotalBuildings() >= 1
  },
  
  {
    id: 'buildings_10',
    name: 'Architekt',
    icon: '🏛️',
    desc: 'Baue 10 Gebäude',
    category: 'upgrade',
    checkFn: (game) => game.getTotalBuildings() >= 10
  },
  
  {
    id: 'buildings_50',
    name: 'Stadt-Planer',
    icon: '🏙️',
    desc: 'Baue 50 Gebäude',
    category: 'upgrade',
    checkFn: (game) => game.getTotalBuildings() >= 50
  },
  
  {
    id: 'solar_power',
    name: 'Solarkraft',
    icon: '☀️',
    desc: 'Baue 10 Solarpanels',
    category: 'upgrade',
    checkFn: (game) => (game.upgrades.solar_panel || 0) >= 10
  },
  
  {
    id: 'fusion_pioneer',
    name: 'Fusions-Pionier',
    icon: '⚛️',
    desc: 'Baue deinen ersten Fusionsreaktor',
    category: 'upgrade',
    checkFn: (game) => (game.upgrades.fusion_reactor || 0) >= 1
  },
  
  {
    id: 'farming_empire',
    name: 'Landwirtschafts-Imperium',
    icon: '🌾',
    desc: 'Baue 5 Hydroponik-Farmen',
    category: 'upgrade',
    checkFn: (game) => (game.upgrades.hydroponic_farm || 0) >= 5
  },
  
  {
    id: 'research_complex',
    name: 'Forschungskomplex',
    icon: '🔬',
    desc: 'Baue 3 Forschungslabore',
    category: 'upgrade',
    checkFn: (game) => (game.upgrades.research_lab || 0) >= 3
  },
  
  // ============================================
  // FORSCHUNGS-ACHIEVEMENTS
  // ============================================
  
  {
    id: 'first_research',
    name: 'Erste Entdeckung',
    icon: '💡',
    desc: 'Schließe deine erste Forschung ab',
    category: 'forschung',
    checkFn: (game) => game.completedResearch.length >= 1
  },
  
  {
    id: 'researcher',
    name: 'Forscher',
    icon: '🔬',
    desc: 'Schließe 5 Forschungen ab',
    category: 'forschung',
    checkFn: (game) => game.completedResearch.length >= 5
  },
  
  {
    id: 'scientist',
    name: 'Wissenschaftler',
    icon: '🧑‍🔬',
    desc: 'Schließe 10 Forschungen ab',
    category: 'forschung',
    checkFn: (game) => game.completedResearch.length >= 10
  },
  
  {
    id: 'tier1_complete',
    name: 'Grundlagen-Technologien',
    icon: '✅',
    desc: 'Schließe alle Tier 1 Forschungen ab',
    category: 'forschung',
    checkFn: (game) => {
      const tier1 = game.researchDefinitions.filter(r => r.tier === 1);
      return tier1.every(r => game.completedResearch.includes(r.id));
    }
  },
  
  {
    id: 'tier2_complete',
    name: 'Fortgeschrittene Technologien',
    icon: '✅',
    desc: 'Schließe alle Tier 2 Forschungen ab',
    category: 'forschung',
    checkFn: (game) => {
      const tier2 = game.researchDefinitions.filter(r => r.tier === 2);
      return tier2.every(r => game.completedResearch.includes(r.id));
    }
  },
  
  {
    id: 'tier3_complete',
    name: 'Hochentwickelte Zivilisation',
    icon: '🌠',
    desc: 'Schließe alle Tier 3 Forschungen ab',
    category: 'forschung',
    checkFn: (game) => {
      const tier3 = game.researchDefinitions.filter(r => r.tier === 3);
      return tier3.every(r => game.completedResearch.includes(r.id));
    }
  },
  
  // ============================================
  // SPEZIELLE HERAUSFORDERUNGEN
  // ============================================
  
  {
    id: 'click_master',
    name: 'Klick-Meister',
    icon: '👆',
    desc: 'Klicke insgesamt 1000 Mal',
    category: 'klicker',
    checkFn: (game) => game.totalClicks >= 1000
  },
  
  {
    id: 'full_space',
    name: 'Volle Auslastung',
    icon: '🏭',
    desc: 'Fülle alle verfügbaren Bauplätze',
    category: 'spezial',
    checkFn: (game) => game.usedSpace >= game.maxSpace && game.maxSpace > 0
  },
  
  {
    id: 'night_owl',
    name: 'Nachteule',
    icon: '🦉',
    desc: 'Spiele zwischen 2 und 4 Uhr nachts',
    category: 'spezial',
    hidden: true,
    checkFn: (game) => {
      const hour = new Date().getHours();
      return hour >= 2 && hour < 4;
    }
  },
  
  {
    id: 'lucky_number',
    name: 'Glückszahl',
    icon: '🍀',
    desc: 'Erreiche exakt 777 Energie',
    category: 'spezial',
    hidden: true,
    checkFn: (game) => {
      const energy = game.resources.energy?.amount || 0;
      return energy >= 777 && energy < 778;
    }
  },
  
  // ============================================
  // PRESTIGE-ACHIEVEMENTS
  // ============================================
  
  {
    id: 'first_prestige',
    name: 'Neue Horizonte',
    icon: '🌟',
    desc: 'Führe deinen ersten Prestige durch',
    category: 'prestige',
    checkFn: (game) => game.prestigeCount >= 1
  },
  
  {
    id: 'prestige_5',
    name: 'Multiversum-Entdecker',
    icon: '🌌',
    desc: 'Führe 5 Prestiges durch',
    category: 'prestige',
    checkFn: (game) => game.prestigeCount >= 5
  },
  
  {
    id: 'prestige_10',
    name: 'Zeit-Reisender',
    icon: '⏰',
    desc: 'Führe 10 Prestiges durch',
    category: 'prestige',
    checkFn: (game) => game.prestigeCount >= 10
  },
  
  {
    id: 'prestige_points_100',
    name: 'Prestige-Sammler',
    icon: '🌟',
    desc: 'Sammle insgesamt 100 Prestige-Punkte',
    category: 'prestige',
    checkFn: (game) => game.totalPrestigePoints >= 100
  }
];

// ============================================
// EXPORT
// ============================================

export default achievementsList;
