export class LayerManager {
  constructor() {
    this.layers = [
      {
        id: 1,
        name: "Basis Layer",
        unlocked: true,
        unlockRequirement: 0,
        generators: []
      },
      {
        id: 2,
        name: "Prestige Layer", 
        unlocked: false,
        unlockRequirement: 1000,
        generators: []
      }
    ];
    this.currentLayer = 1;
  }

  checkUnlocks() {
    const points = game.currencies.points;
    this.layers.forEach(layer => {
      if (!layer.unlocked && points >= layer.unlockRequirement) {
        layer.unlocked = true;
      }
    });
  }

  get unlockedLayers() {
    return this.layers.filter(layer => layer.unlocked);
  }
}

