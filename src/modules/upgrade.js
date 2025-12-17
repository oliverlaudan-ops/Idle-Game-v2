// upgrade.js

export class Upgrade {
  constructor(opts) {
    this.id = opts.id;
    this.name = opts.name;
    this.desc = opts.desc;
    this.costRes = opts.costRes;
    this.costBase = opts.costBase;
    this.costMult = opts.costMult ?? 1.15;
    this.applyFn = opts.apply;
    this.single = !!opts.single;
    this.unlocksResourceId = opts.unlocksResourceId ?? null;
    this.research = !!opts.research; // NEU
    this.level = 0;
  }

  getCurrentCost(){
    return Math.floor(this.costBase * Math.pow(this.costMult, this.level || 0));
  }

  canBuy(game){
    const res = game.getResource(this.costRes);
    if (!res || !res.unlocked) return false;
    if (this.single && this.level > 0) return false;
    return res.amount >= this.getCurrentCost();
  }

  buy(game){
    if (!this.canBuy(game)) return false;
    const res   = game.getResource(this.costRes);
    const cost  = this.getCurrentCost();
    if (!res.spend(cost)) return false;

    this.level++;

    // Effekt anwenden
    if (typeof this.applyFn === 'function'){
      this.applyFn(game);
    }

    // Ressource freischalten?
    if (this.unlocksResourceId){
      const r2 = game.getResource(this.unlocksResourceId);
      if (r2){
        r2.unlocked = true;
        if (r2.rpc === 0) r2.rpc = 1;
      }
    }
    return true;
  }
}
