import THREE from "THREE";

import App from "./App.js";

export default class View {
  constructor(canvas, opts ) {
    this.renderer = opts.renderer || new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha:true
    });
    this.renderer.setClearColor(0x000000);
    this.renderer.autoClear = false;

    App.onResize.add(this.resize, this);
    App.onSceneChange.add(this.onSceneChange, this);
  }

  onSceneChange(name, { background , duration }) {

    let color = new THREE.Color( background.main )
    let transitionDuration = duration || 0.4
    TweenMax.to( this.renderer.getClearColor(), transitionDuration * 0.5 , {
        r: color.r,
        g: color.g,
        b: color.b,
        ease: Power2.easeInOut,
        onUpdate: c =>  this.renderer.setClearColor( c )
      })

  }

  resize(width, height) {
    width *= window.devicePixelRatio;
    height *= window.devicePixelRatio;

    this.renderer.setSize(width, height, false);
  }

  render(mainScene, uiScene) {
    this.renderer.clear();
    this.renderer.render(mainScene, mainScene.camera);
    this.renderer.render(uiScene, uiScene.camera);
  }
}
