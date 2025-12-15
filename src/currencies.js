export class CurrencyManager {
  constructor() {
    this.currencies = {
      points: { value: 0, generators: 0, baseProduction: 1 }
    };
  }

  update(deltaTime) {
    const points = this.currencies.points;
    points.value += points.generators * points.baseProduction * deltaTime;
  }

  addGenerator(amount = 1) {
    this.currencies.points.generators += amount;
  }

  get points() {
    return this.currencies.points.value.toFixed(0);
  }
}

