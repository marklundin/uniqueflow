import Signal from "min-signal";

class Ticker extends Signal {
  constructor() {
    super();

    this._updateBinded = this.update.bind(this);

    this._previousTimestamp = 0;

    this.deltaTime = 0;

    this.update();
  }

  update(time) {
    requestAnimationFrame(this._updateBinded);

    let timestamp = window.performance.now();

    this.deltaTime = timestamp - this._previousTimestamp;

    this._previousTimestamp = timestamp;

    this.dispatch(time, this.deltaTime );
  }
}

export default new Ticker();
