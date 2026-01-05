// ============================================
// Ressourcen-Definitionen für Space Colonies
// ============================================

/**
 * Ressourcen-Struktur:
 * - id: Eindeutige ID
 * - name: Anzeigename
 * - icon: Emoji/Symbol
 * - description: Kurzbeschreibung
 * - startAmount: Startwert
 * - unlocked: Sofort verfügbar?
 * - unlockCondition: Bedingung zum Freischalten (optional)
 * - category: 'basic' | 'advanced' | 'special'
 * - perSecond: Automatische Produktion pro Sekunde (wird von Upgrades modifiziert)
 */

const resourceDefinitions = [
  // ========================================
  // PHASE 1: Frühe Kolonie (Start-Ressourcen)
  // ========================================
  
  {
    id: 'energy',
    name: 'Energie',
    icon: '⚡',
    description: 'Grundlegende Energie für alle Systeme. Klicke um Energie zu sammeln!',
    startAmount: 10,
    unlocked: true,
    category: 'basic',
    perSecond: 0,
    clickValue: 1, // Wie viel pro Click
    color: '#FFD700' // Gold/Gelb
  },
  
  {
    id: 'water',
    name: 'Wasser',
    icon: '💧',
    description: 'Lebensnotwendiges Wasser für die Kolonie. Wird aus Energie gewonnen.',
    startAmount: 0,
    unlocked: true,
    category: 'basic',
    perSecond: 0,
    color: '#4DA6FF' // Blau
  },
  
  {
    id: 'food',
    name: 'Nahrung',
    icon: '🌾',
    description: 'Nahrung für die wachsende Bevölkerung. Benötigt Wasser zur Produktion.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'water', amount: 10 },
    category: 'basic',
    perSecond: 0,
    color: '#90EE90' // Hellgrün
  },
  
  {
    id: 'population',
    name: 'Bevölkerung',
    icon: '👥',
    description: 'Kolonisten die arbeiten und produzieren. Wächst mit ausreichend Nahrung.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'food', amount: 20 },
    category: 'advanced',
    perSecond: 0,
    maxGrowthRate: 0.1, // Max 0.1 Bevölkerung pro Sekunde
    color: '#FF69B4' // Pink
  },
  
  // ========================================
  // PHASE 2: Industrialisierung
  // ========================================
  
  {
    id: 'stone',
    name: 'Gestein',
    icon: '🪨',
    description: 'Rohes Gesteinsmaterial. Kann zu Metall verarbeitet werden.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'population', amount: 5 },
    category: 'basic',
    perSecond: 0,
    color: '#A9A9A9' // Grau
  },
  
  {
    id: 'metal',
    name: 'Metall',
    icon: '🔩',
    description: 'Verarbeitetes Metall für den Bau fortgeschrittener Strukturen.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'stone', amount: 50 },
    category: 'basic',
    perSecond: 0,
    color: '#C0C0C0' // Silber
  },
  
  {
    id: 'crystals',
    name: 'Kristalle',
    icon: '💎',
    description: 'Seltene Kristalle mit besonderen Eigenschaften. Wichtig für Technologie.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'metal', amount: 100 },
    category: 'basic',
    perSecond: 0,
    color: '#DA70D6' // Orchidee/Lila
  },
  
  // ========================================
  // PHASE 3: Expansion & Hochtechnologie
  // ========================================
  
  {
    id: 'fuel',
    name: 'Treibstoff',
    icon: '⛽',
    description: 'Hochenergetischer Treibstoff für Raumschiffe und Expansion.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'crystals', amount: 50 },
    category: 'advanced',
    perSecond: 0,
    color: '#FF4500' // Orange-Rot
  },
  
  {
    id: 'research',
    name: 'Forschung',
    icon: '🔬',
    description: 'Forschungspunkte für technologische Fortschritte.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'population', amount: 5 },  // FRÜHER: war 10, jetzt 5!
    category: 'advanced',
    perSecond: 0,
    color: '#00CED1' // Türkis
  },
  
  // ========================================
  // PRESTIGE
  // ========================================
  
  {
    id: 'prestige',
    name: 'Prestige-Punkte',
    icon: '🌟',
    description: 'Permanente Punkte die nach einem Reset erhalten bleiben.',
    startAmount: 0,
    unlocked: false,
    unlockCondition: { resource: 'energy', amount: 1000000 }, // 1M Energie für ersten Prestige
    category: 'special',
    perSecond: 0,
    persistent: true, // Bleibt nach Reset erhalten
    color: '#FFD700' // Gold
  }
];

// ============================================
// Hilfsfunktionen
// ============================================

/**
 * Prüft ob eine Ressource freigeschaltet werden kann
 */
export function checkResourceUnlock(resourceId, gameState) {
  const resource = resourceDefinitions.find(r => r.id === resourceId);
  if (!resource || resource.unlocked) return false;
  
  if (!resource.unlockCondition) return false;
  
  const condition = resource.unlockCondition;
  const currentAmount = gameState.resources[condition.resource] || 0;
  
  return currentAmount >= condition.amount;
}

/**
 * Gibt alle Ressourcen einer bestimmten Kategorie zurück
 */
export function getResourcesByCategory(category) {
  return resourceDefinitions.filter(r => r.category === category);
}

/**
 * Gibt die Ressourcen-Definition anhand der ID zurück
 */
export function getResourceById(id) {
  return resourceDefinitions.find(r => r.id === id);
}

/**
 * Gibt alle aktuell freigeschalteten Ressourcen zurück
 */
export function getUnlockedResources() {
  return resourceDefinitions.filter(r => r.unlocked);
}

/**
 * Schaltet eine Ressource frei
 */
export function unlockResource(resourceId) {
  const resource = resourceDefinitions.find(r => r.id === resourceId);
  if (resource && !resource.unlocked) {
    resource.unlocked = true;
    console.log(`🔓 Ressource freigeschaltet: ${resource.icon} ${resource.name}`);
    return true;
  }
  return false;
}

// ============================================
// Export
// ============================================

export default resourceDefinitions;
