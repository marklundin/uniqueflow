import "core-js";

import THREE from "THREE";
import Signal from "min-signal";

import MainScene from "./scenes/MainScene.js";
import UIScene from "./scenes/UIScene.js";
import View from "./View.js";
import Ticker from "./utils/Ticker.js";
import Pointer from "./utils/Pointer.js";
import App from "./App.js";
import DATA from "./data.js";
import SoundManager from "./utils/SoundManager.js";
import MobileDetect from "mobile-detect";


let isMobile = false

export default class ToyotaCHRExperience {

  static get isSupported() {
    return App.isSupported;
  }

  static get assets() {
    return DATA.assets;
  }


  constructor( canvas, baseURL = './', opts = {} ) {

    isMobile = !!new MobileDetect(window.navigator.userAgent).mobile();

    this.opts = opts
    this.app = App
    this.canvas = canvas;

    // Add sounds
    for (let soundUrl of DATA.assets.sounds) {
      SoundManager.add(baseURL + soundUrl);
    }

    this.view = new View(this.canvas, opts );
    this.mainScene = new MainScene(this.canvas);

    this.pointer = Pointer.get(this.canvas);
    this.pointer.disable();

    this.uiScene = new UIScene(this.canvas);

    var width = this.canvas.offsetWidth;
    var height = this.canvas.offsetHeight;
    this.resize(width, height);

    this.render = new Signal();

    App.onStart.add(this._onStart, this);
    App.onStop.add(this._onStop, this);
    App.onResize.add(this._onResize, this);

    App.changeSceneByName("default", {
      transitionDuration: 10
    });

    this.interactive = true;
  }

  // Private

  _onStart() {
    Ticker.add(this._update, this);
  }

  _onStop() {
    Ticker.remove(this._update);
  }

  _onResize() {
    this.view.render(this.mainScene, this.uiScene);
  }

  _update() {
    this.mainScene.update();
    this.view.render(this.mainScene, this.uiScene);
    this.render.dispatch(this.canvas);
  }

  // Public

  start() {
    App.start();
  }

  stop() {
    App.stop();
  }

  restart() {
    App.restart();
  }

  resize(width, height) {
    App.resize(width, height);
  }

  clear() {
    this.view.renderer.clear();
  }

  set interactive(value) {
    App.interactive = value;
    if (value && this.opts.forceMobile || isMobile) {
      this.pointer.enable();
    } else {
      this.pointer.disable();
    }
  }

  get interactive() {
    return App.interactive;
  }

  dispose() {
    console.warn("dispose has been deprecated")
  }
}

window.ToyotaCHRExperience = ToyotaCHRExperience;
