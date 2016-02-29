import Signal from "min-signal";
import Stats from "Makio64/stats-js";

import SoundManager from "./utils/SoundManager.js";

import DATA from "./data.js";

let KEY_MAP = new Map();

let sceneNames = Object.keys(DATA.scenes);
sceneNames.splice(sceneNames.indexOf("default"), 1);

let QWERTY_KEYCODES = [81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 65, 83, 68, 70, 71, 72, 74, 75, 76, 90, 88, 67, 86, 66, 78, 77];

for (let [i, keyCode] of QWERTY_KEYCODES.entries()) {
  KEY_MAP.set(keyCode, sceneNames[i % sceneNames.length]);
}

let isSupported = (function() {
  let isSupported = false
  try {
    var canvas = document.createElement('canvas');
    isSupported = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
  return isSupported && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')).getExtension('OES_texture_float') !== null
})();


class App {
  constructor() {
    this.data = DATA;
    this._timeoutID = -1;
    this._currentSceneName = "";
    this._preventSceneChange = false;

    this.isSupported = isSupported;

    if(/\bstats\b/.test(window.location.search)) {
      this.stats = new Stats();
      this.stats.domElement.style.position = "absolute";
      this.stats.domElement.style.top = 0;
      document.body.appendChild(this.stats.domElement);
    }

    this.onStart = new Signal();
    this.onStop = new Signal();
    this.onRestart = new Signal();
    this.onResize = new Signal();
    this.onSceneChange = new Signal();
  }

  _onKeyDown(e) {
    let sceneName = KEY_MAP.get(e.keyCode);
    if (!sceneName || this._preventSceneChange) {
      return;
    }
    this._preventSceneChange = true;
    this.changeSceneByName(sceneName);
  }

  _onKeyUp() {
    this._preventSceneChange = false;
  }

  start() {
    SoundManager.muted = false;
    this.onStart.dispatch();
  }

  stop() {
    SoundManager.muted = true;
    this.onStop.dispatch();
  }

  restart() {
    this.changeSceneByName("default");
    this.onRestart.dispatch();
  }

  resize(width, height, lowQuality = false) {
    this.onResize.dispatch(width, height, lowQuality);
  }

  changeSceneByName(name, data = {}) {
    clearTimeout(this._timeoutID);

    if(name !== "default") {
      this._timeoutID = setTimeout(() => {
        this.changeSceneByName("default", {
          transitionDuration: 10
        });
      }, 5000);
    }

    this._currentSceneName = name;

    this.onSceneChange.dispatch(name, Object.assign(DATA.scenes[name], data));
  }

  set interactive(value) {
    this._interactive = value;
    if (value) {
      window.addEventListener("keydown", this._onKeyDownBinded = this._onKeyDown.bind(this));
      window.addEventListener("keyup", this._onKeyUpBinded = this._onKeyUp.bind(this));
    } else {
      window.removeEventListener("keydown", this._onKeyDownBinded);
      window.removeEventListener("keyup", this._onKeyUpBinded);
    }
  }

  get interactive() {
    return this._interactive;
  }
}

export default new App();
