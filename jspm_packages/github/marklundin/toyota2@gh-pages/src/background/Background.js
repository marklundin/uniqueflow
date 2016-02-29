import THREE from "THREE";
import BackgroundPlane from "./BackgroundPlane.js";
import DATA from "../data.js";
import App from "../App.js";
import { spring3 } from "../utils/spring";
import { random } from "../utils/math";

const BIG_PLANES_NUMBER = 5;
const NORMAL_PLANES_NUMBER = 20;
const SMALL_PLANES_NUMBER = 100;

export default class Background extends THREE.Object3D {
  constructor(character, useNoise = true ) {
    super();

    this.character = character;

    this.backgroundPlanes = [];

    this._lastSceneChangeTimeStamp = Date.now();

    for (let i = 0; i < BIG_PLANES_NUMBER + NORMAL_PLANES_NUMBER + SMALL_PLANES_NUMBER; i++) {
      let backgroundPlane = new BackgroundPlane( useNoise );
      backgroundPlane._animationQuaternionStart = new THREE.Quaternion();
      backgroundPlane._animationQuaternionEnd = new THREE.Quaternion();
      backgroundPlane._animationProgress = 0;
      backgroundPlane._type = i < BIG_PLANES_NUMBER ? "big" : (i < BIG_PLANES_NUMBER + NORMAL_PLANES_NUMBER ? "normal" : "small");
      let distance;
      let scale;
      switch (backgroundPlane._type) {
        case "big":
          scale = 10000;
          break;
        case "normal":
          scale = 1000;
          break;
        case "small":
          scale = 10;
          break;
      }
      backgroundPlane._scale = scale;
      backgroundPlane.mesh.scale.set(scale, scale, 1);
      if (backgroundPlane._type === "normal") {
        backgroundPlane.rotation.set(
          Math.PI * .5 * Math.floor(Math.random() * 2),
          Math.PI * .5 * Math.floor(Math.random() * 2),
          Math.PI * .5 * Math.floor(Math.random() * 2)
        );
      } else {
        backgroundPlane.rotation.set(
          Math.PI * 2 * Math.random(),
          Math.PI * 2 * Math.random(),
          Math.PI * 2 * Math.random()
        );
      }
      backgroundPlane.position.set(
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000,
        Math.random() * 2000 - 1000
      );
      this.add(backgroundPlane);
      this.backgroundPlanes.push(backgroundPlane);
    }

    App.onSceneChange.add(this.onSceneChange, this);
  }

  onSceneChange(name, {background, transitionDuration}) {
    let euler = new THREE.Euler();
    let color = new THREE.Color();
    let vector3 = new THREE.Vector3();
    let position = new THREE.Vector3();
    let scale = new THREE.Vector3();

    let easing = Power3.easeInOut;

    let smallPlanesCounter = 0;

    if(!transitionDuration) {
      transitionDuration = (Date.now() - this._lastSceneChangeTimeStamp) / 1000;
      transitionDuration = Math.max(Math.min(transitionDuration, 1.3), .2);
    }

    this._lastSceneChangeTimeStamp = Date.now();

    for (let [i, backgroundPlane] of this.backgroundPlanes.entries()) {

      scale.set(backgroundPlane._scale, backgroundPlane._scale, 1);

      let distance;
      let opacity = 1;
      let delay = Math.random() * transitionDuration;
      let duration = transitionDuration * (1 + (Math.random() * 2 - 1) * .2);

      switch (backgroundPlane._type) {
        case "big":
          distance = 5000;
          color.set(background.assets[i % background.assets.length]);
          break;
        case "normal":
          if (background.detail.numberRatio === 0) {
            color.set(background.detail.colors[i % background.detail.colors.length]);
          } else {
            color.set(background.assets[i % background.assets.length]);
          }
          distance = 1000;
          scale.x *= .2 + Math.random() * .8;
          scale.y *= Math.random();
          break;
        case "small":
          opacity = (smallPlanesCounter / (SMALL_PLANES_NUMBER - 1)) < background.detail.numberRatio ? 1 : 0;
          opacity *= background.detail.opacities[i % background.detail.opacities.length];
          color.set(background.detail.colors[i % background.detail.colors.length]);
          distance = Math.random() * 2000;
          scale.x *= background.detail.scale[0];
          scale.y *= background.detail.scale[1];
          smallPlanesCounter++;
          break;
      }

      euler.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      position.set(0, 0, 1);
      position.applyEuler(euler);
      position.multiplyScalar(distance);
      position.add(this.character);

      TweenMax.killTweensOf(backgroundPlane.position);
      TweenMax.to(backgroundPlane.position, duration, {
        x: position.x,
        y: position.y,
        z: position.z,
        delay: delay,
        ease: easing
      });

      TweenMax.killTweensOf(backgroundPlane.mesh.scale);
      TweenMax.to(backgroundPlane.mesh.scale, duration, {
        x: scale.x,
        y: scale.y,
        delay: delay,
        ease: easing
      });

      TweenMax.killTweensOf(backgroundPlane.mesh.material.uniforms.color.value);
      TweenMax.to(backgroundPlane.mesh.material.uniforms.color.value, duration, {
        r: color.r,
        g: color.g,
        b: color.b,
        delay: delay,
        ease: easing
      });

      TweenMax.killTweensOf(backgroundPlane.mesh.material.uniforms.opacity);
      TweenMax.to(backgroundPlane.mesh.material.uniforms.opacity, duration * .5, {
        value: 0,
        delay: delay,
        ease: easing
      });
      TweenMax.to(backgroundPlane.mesh.material.uniforms.opacity, duration * .5, {
        delay: delay + duration * .5,
        value: opacity,
        ease: easing
      });
    }
  }
}
