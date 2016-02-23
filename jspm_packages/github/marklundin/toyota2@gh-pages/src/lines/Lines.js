import THREE from "THREE";

import Line from "./Line.js";
import CrossTip from "./CrossTip.js";
import App from "../App.js";

export default class Lines extends THREE.Object3D {
  constructor(character) {
    super();

    this.character = character;

    this._previousCharacterPosition = this.character.clone();

    this._vector3Cached1 = new THREE.Vector3();
    this._vector3Cached2 = new THREE.Vector3();
    this._vector3Cached3 = new THREE.Vector3();
    this._cachedQuaternion = new THREE.Quaternion();

    this.lines = [];
    this.particles = [];
    this.offsets = [];

    for (let i = 0; i < 8; i++) {
      let particle = new THREE.Vector3();
      particle.copy(this.character);
      this.particles.push(particle);
      let line = new Line();
      line.radius = 0;
      this.lines.push(line);
      this.add(line);
      this.offsets.push(new THREE.Vector3());
      let crossTip = new CrossTip();
      crossTip.hide();
      line._crossTip = crossTip;
      line.tip.add(crossTip);
    }

    App.onSceneChange.add(this.onSceneChange, this);
  }

  onSceneChange(name, data) {
    let tmpColor = new THREE.Color();
    let tmpTipColor = new THREE.Color();

    let duration = data.transitionDuration || .7;
    let easing = Power2.easeInOut;

    for (let [i, line] of this.lines.entries()) {
      if(i === 0) {
        continue;
      }
      let lineData = data.lines[i - 1] || {};

      tmpColor.set(lineData ? lineData.color : 0x000000);
      tmpTipColor.set(lineData ? lineData.tipColor : 0x000000);

      if(lineData.crossTip) {
        line._crossTip.show(duration, easing);
        TweenMax.to(line._crossTip.material.color, duration, {
          r: tmpTipColor.r,
          g: tmpTipColor.g,
          b: tmpTipColor.b,
          ease: easing
        });
      } else {
        line._crossTip.hide(duration, easing);
      }

      TweenMax.to(line.mesh.material.uniforms.specular.value, duration, {
        r: lineData.shading ? .6 : 0,
        g: lineData.shading ? .6 : 0,
        b: lineData.shading ? .6 : 0,
        ease: easing
      });
      TweenMax.to(line.mesh.material.uniforms.emissiveIntensity, duration, {
        value: lineData.shading ? 0 : 1,
        ease: easing
      });
      TweenMax.to(line.mesh.material.uniforms.color.value, duration, {
        r: tmpColor.r,
        g: tmpColor.g,
        b: tmpColor.b,
        ease: easing
      });
      TweenMax.to(line.mesh.material.uniforms.tipColor.value, duration, {
        r: tmpTipColor.r,
        g: tmpTipColor.g,
        b: tmpTipColor.b,
        ease: easing
      });

      TweenMax.to(this.offsets[i], duration, {
        x: lineData.offset ? lineData.offset[0] : 0,
        y: lineData.offset ? lineData.offset[1] : 0,
        z: lineData.offset ? lineData.offset[2] : 0,
        ease: easing
      });
      TweenMax.to(line, duration, {
        radius: lineData.radius || 0,
        ease: easing
      });
    }
  }

  resize(width, height) {
    for (let line of this.lines) {
      line.resize(width, height);
    }
  }

  update(timeScale) {
    let mainLine = this.lines[0];

    let characterOffset = this._vector3Cached1.subVectors(this.character, this._previousCharacterPosition);

    for (let [i, line] of this.lines.entries()) {
      let particle = this.particles[i];

      this._vector3Cached3.copy(this.character);
      this._vector3Cached2.copy(this.offsets[i]);
      this._cachedQuaternion.slerp(mainLine.tip.quaternion, .1 * timeScale);
      this._vector3Cached2.applyQuaternion(this._cachedQuaternion);
      this._vector3Cached3.add(this._vector3Cached2);

      particle.lerp(this._vector3Cached3, .1 * timeScale);

      line.update(particle);
    }

    this._previousCharacterPosition.copy(this.character);
  }
}
