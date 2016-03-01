import THREE from "THREE";

import App from "./App.js";

export default class View {
  constructor(canvas, opts) {
    this.renderer = opts.renderer || new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true
    });
    this.renderer.setPixelRatio( devicePixelRatio )
    this.renderer.setClearColor(0x000000);
    this.renderer.autoClear = false;
    this.renderer.sortObjects = false;

    if (App.stats) {
      App.stats.addCustom("DrawCall", this.renderer.info.render, "calls");
      App.stats.addCustom("Faces", this.renderer.info.render, "faces");
      App.stats.addCustom("Points", this.renderer.info.render, "points");
      App.stats.addCustom("Vertices", this.renderer.info.render, "vertices");
      App.stats.addCustom("Geometries", this.renderer.info.memory, "geometries");
      App.stats.addCustom("Textures", this.renderer.info.memory, "textures");
    }

    App.onResize.add(this.resize, this);
    App.onSceneChange.add(this.onSceneChange, this);
  }

  onSceneChange(name, {background, transitionDuration = .4}) {
    let clearColor = this.renderer.getClearColor();
    let nextClearColor = new THREE.Color(background.main);
    TweenMax.to(clearColor, transitionDuration * 3, {
      r: nextClearColor.r,
      g: nextClearColor.g,
      b: nextClearColor.b,
      ease: Power3.easeOut,
      onUpdate: () => {
        this.renderer.setClearColor(clearColor);
      }
    });
  }

  resize(width, height, lowQuality = false) {
    // if(!lowQuality) {
    //   width *= window.devicePixelRatio;
    //   height *= window.devicePixelRatio;
    // }

    this.renderer.setSize(width, height, true);
  }

  render(mainScene, uiScene) {
    this.renderer.clear();

    this.renderer.render(mainScene, mainScene.camera);

    // this.renderer.render(uiScene, uiScene.camera);
  }
}
