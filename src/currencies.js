export class CurrencyManager {
  constructor() {
    this.value = 0;
    this.generators = 0;
    this.baseProduction = 1;
    this.clickPower = 1;
    this.generatorMultiplier = 1;
    this.prestigePoints = 0;  // ← NEU
    this.prestigeMultiplier = 1; // ← NEU
  }

  update(deltaTime) {
    this.value += this.generators * this.baseProduction * this.generatorMultiplier * deltaTime;
  }

  click() {
    this.value += this.clickPower;
  }

  buyGenerator() {
    const cost = this.generatorCost;
    if (this.value >= cost) {
      this.value -= cost;
      this.generators += 1;
    }
  }

  buyClickUpgrade() {
    const cost = this.clickUpgradeCost;
    if (this.value >= cost) {
      this.value -= cost;
      this.clickPower *= 2;
    }
  }

  buyGeneratorUpgrade() {
    const cost = this.generatorUpgradeCost;
    if (this.value >= cost) {
      this.value -= cost;
      this.generatorMultiplier *= 2;
    }
  }

  prestigeReset() {
    const prestigeGain = Math.floor(Math.sqrt(this.value / 1000));
    if (prestigeGain > 0) {
      this.prestigePoints += prestigeGain;
      this.prestigeMultiplier = 1 + (this.prestigePoints * 0.1);
      // Layer 1 reset
      this.value = 0;
      this.generators = 0;
      this.clickPower = 1;
      this.generatorMultiplier = 1;
    }
  }

  update(deltaTime) {
    // ALLE Produktionen * Prestige-Multi
    this.value += this.generators * this.baseProduction * this.generatorMultiplier * this.prestigeMultiplier * deltaTime;
  }

  click() {
    this.value += this.clickPower * this.prestigeMultiplier;
  }

  get prestigeGain() {
    return Math.floor(Math.sqrt(this.value / 1000));
  }

  get generatorCost() { 
    return Math.ceil(10 * Math.pow(1.15, this.generators)); 
  }
  
  get clickUpgradeCost() { 
    return Math.ceil(250 * Math.pow(1.8, this.clickPower / 2 - 1)); 
  }
  
  get generatorUpgradeCost() { 
    return Math.ceil(500 * Math.pow(2, this.generatorMultiplier / 2 - 1)); 
  }

  get points() { return Math.floor(this.value); }
  get productionPerSecond() { 
    return this.generators * this.baseProduction * this.generatorMultiplier; 
  }
}
