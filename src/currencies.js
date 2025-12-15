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

  get points() {
    return Math.floor(this.value);
  }

  get productionPerSecond() {
    return this.generators * this.baseProduction;
  }
}
