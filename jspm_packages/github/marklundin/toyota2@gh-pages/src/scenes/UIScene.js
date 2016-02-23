import THREE from "THREE";

import DATA from "../data.js";

import App from "../App.js";
import Pointer from "../utils/Pointer.js";
import Screenfull from "screenfull";

export default class UIScene extends THREE.Scene {
  constructor(canvas) {

    super();

    this.pointer = Pointer.get(canvas);

    this.camera = new THREE.OrthographicCamera(window.innerWidth * -.5, window.innerWidth * .5, window.innerHeight * .5, window.innerHeight * -.5, 1, 1000);
    this.camera.position.z = 10;

    let sceneNames = Object.keys(DATA.scenes);
    sceneNames.splice(sceneNames.indexOf("default"), 1);

    this.grid = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        "resolution": {
          type: "v2",
          value: new THREE.Vector2()
        },
        "color": {
          type: "c",
          value: new THREE.Color()
        }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec2 resolution;
        varying vec2 vUv;
        void main() {
          vec2 coord = vUv * resolution;
          float radius = 3.;
          float opacity = 1. - distance(mod(coord, vec2(200.)), vec2(radius)) / radius;
          opacity = step(.5, opacity);
          gl_FragColor = vec4(color, opacity * .2);
        }`
    }));
    this.grid.material.transparent = true;
    this.add(this.grid);

    this.planes = [];

    for (let sceneName of sceneNames) {
      let plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0
      }));
      plane.name = sceneName;
      this.planes.push(plane);
      this.add(plane);
    }

    this.raycaster = new THREE.Raycaster();

    this.pointer.onDown.add(this.onDown, this);

    App.onResize.add(this.resize, this);
    App.onSceneChange.add(this.onSceneChange, this);
  }

  onSceneChange(sceneName, data) {
    let color = new THREE.Color(data.background.main);
    let light = color.getHSL().l < .5 ? 1 : 0;
    TweenMax.to(this.grid.material.uniforms.color.value, data.transitionDuration || .4, {
      r: light,
      g: light,
      b: light
    });
  }

  onDown() {
    if (Screenfull.enabled) {
      Screenfull.request();
    }
    this.raycaster.setFromCamera(this.pointer.normalizedCenteredFlippedY, this.camera);
    let intersects = this.raycaster.intersectObjects(this.planes);
    if (intersects) {
      let plane = intersects[0].object;
      App.changeSceneByName(plane.name);

      TweenMax.fromTo(plane.material, .2, {
        opacity: .2
      }, {
        opacity: 0
      });
    }
  }

  resize(width, height) {
    this.camera.left = width * -.5;
    this.camera.right = width * .5;
    this.camera.top = height * .5;
    this.camera.bottom = height * -.5;
    this.camera.updateProjectionMatrix();

    let gridWidth = width * .8;
    gridWidth -= gridWidth % 200.;
    gridWidth += 5;
    let gridHeight = height * .8;
    gridHeight -= gridHeight % 200.;
    gridHeight += 5;
    this.grid.scale.set(gridWidth, gridHeight, 1);
    this.grid.material.uniforms.resolution.value.set(gridWidth, gridHeight);

    let ratio = width / height;
    let rows = ratio > 1 ? 2 : 6;
    let columns = ratio > 1 ? 6 : 2;
    let planeWidth = width / columns;
    let planeHeight = height / rows;

    for (let [i, plane] of this.planes.entries()) {
      plane.position.x = (i % columns) * planeWidth - width * .5 + planeWidth * .5;
      plane.position.y = Math.floor(i / columns) * planeHeight - height * .5 + planeHeight * .5;
      plane.scale.set(planeWidth, planeHeight, 1);
    }
  }
}
