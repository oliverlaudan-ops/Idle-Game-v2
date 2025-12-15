export class CurrencyManager {
  constructor() {
    this.currencies = { points: { value: 0, generators: 0, baseProduction: 1 } };
  }

  update(deltaTime) {
    const points = this.currencies.points;
    points.value += points.generators * points.baseProduction * deltaTime;
  }

  click() { this.currencies.points.value += 1; }

  buyGenerator() {
    const cost = this.generatorCost();
    if (this.currencies.points.value >= cost) {
      this.currencies.points.value -= cost;
      this.currencies.points.generators += 1;
    }
  }

  generatorCost() {
    return Math.floor((this.currencies.points.generators + 1) * 10);
  }

  get points() { return Math.floor(this.currencies.points.value); }
  get generators() { return this.currencies.points.generators.toFixed(1); }
  get productionPerSecond() { 
    return (this.currencies.points.generators * this.currencies.points.baseProduction).toFixed(1); 
  }
}
