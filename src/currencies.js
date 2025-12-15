export class CurrencyManager {
  constructor() {
    this.value = 0;
    this.generators = 0;
    this.baseProduction = 1;
  }

  update(deltaTime) {
    this.value += this.generators * this.baseProduction * deltaTime;
  }

  click() {
    this.value += 1;
  }

  buyGenerator() {
    const cost = this.generatorCost;
    if (this.value >= cost) {
      this.value -= cost;
      this.generators += 1;
    }
  }

  get generatorCost() {
    return Math.ceil(10 * Math.pow(1.15, this.generators));
  }

  get points() {
    return Math.floor(this.value);
  }

  get productionPerSecond() {
    return this.generators * this.baseProduction;
  }
}
