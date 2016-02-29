import THREE from "THREE";

import App from "../App.js";

import ShaderUtils from "../utils/ShaderUtils.js";

import VERTEX_SHADER from "./shaders/tunnel-mesh-basic-vertex.glsl!text";
import FRAGMENT_SHADER from "./shaders/tunnel-mesh-basic-fragment.glsl!text";

export default class Tunnel extends THREE.Object3D {
  constructor(path) {
    super();

    this.path = path;

    this.tunnels = new Map();
    this.currentTunnel = null

    this._tweenProgresses = [
      {value: 0},
      {value: 0},
      {value: 0},
      {value: 0},
      {value: 0}
    ];

    let straightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1000)
    ]);
    let straightGeometry = new THREE.TubeGeometry(straightCurve, 128, 100, 4);
    let straightBufferGeometry = new THREE.BufferGeometry();
    straightBufferGeometry.fromGeometry(straightGeometry);
    let lengthPositionArray = new Float32Array(straightBufferGeometry.attributes.position.array.length / 3);
    for (var i = 0; i < lengthPositionArray.length; i++) {
      lengthPositionArray[i] = straightBufferGeometry.attributes.position.array[i * 3 + 2] / 1000;
    }
    straightBufferGeometry.addAttribute("lengthPosition", new THREE.BufferAttribute(lengthPositionArray, 1));

    // let straightMesh = new THREE.Mesh(straightBufferGeometry, this.material);
    // this.add(straightMesh);

    let vertexShader = ShaderUtils.replaceThreeChunks(VERTEX_SHADER);
    let fragmentShader = ShaderUtils.replaceThreeChunks(FRAGMENT_SHADER);

    for (let curve of this.path.curves) {
      let bufferGeometry = new THREE.BufferGeometry();
      let geometry = new THREE.TubeGeometry(curve, 128, 70, 4);
      bufferGeometry.fromGeometry(geometry);
      bufferGeometry.addAttribute("lengthPosition", new THREE.BufferAttribute(lengthPositionArray, 1));

      let uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib.basic.uniforms);
      Object.assign(uniforms, {
        progresses: {
          type: "fv1",
          value: [0, 0, 0 ,0, 0]
        },
        opacities: {
          type: "fv1",
          value: [0, 0, 0 ,0, 0]
        },
        ringLength: {
          type: "f",
          value: .01
        }
      });

      let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.DoubleSide,
        depthWrite: false,
        // depthTest: false,
        vertexColors: THREE.VertexColors,
        transparent: true
      });

      let mesh = new THREE.Mesh(bufferGeometry, material);
      mesh._length = curve.getLength();
      mesh.visible = false;
      mesh.matrixAutoUpdate = false;
      this.tunnels.set(curve.name, mesh);
      this.add(mesh);
    }

    this.currentTunnel = this.tunnels.get("default");

    App.onSceneChange.add(this.onSceneChange, this);
  }

  onSceneChange(name, data) {
    if(!data.tunnel || Math.random() > .3) {
      return;
    }

    TweenMax.to(this.currentTunnel.material.uniforms.opacity, 1, {
      value: 0,
      onComplete: (tunnel) => {
        tunnel.visible = false;
        this.changeTunnel(name, data.tunnel.color);
      },
      onCompleteParams: [this.currentTunnel]
    });
  }

  changeTunnel(name, colorHex) {
    this.currentTunnel = this.tunnels.get(name);
    this.currentTunnel.matrix.copy(this.path.currentOffsetMatrix);

    this.currentTunnel.visible = true;
    this.currentTunnel.material.uniforms.opacity.value = 1;

    let color = new THREE.Color(colorHex);

    TweenMax.to(this.currentTunnel.material.uniforms.diffuse.value, .4, {
      r: color.r,
      g: color.g,
      b: color.b
    });

    let scale = this.currentTunnel._length / 1000;
    let duration = .5 + Math.random();
    let delay = .2 + Math.random() * .2;

    for (let i = 0; i < this.currentTunnel.material.uniforms.progresses.value.length; i++) {
      TweenMax.killTweensOf(this._tweenProgresses[i]);
      this.currentTunnel.material.uniforms.progresses.value[i] = 0;
      this.currentTunnel.material.uniforms.ringLength.value = .005 / scale;
      this.currentTunnel.material.uniforms.opacities.value[i] = 0;

      delay += Math.random() < .5 ? .2 : .4;

      TweenMax.fromTo(this._tweenProgresses[i], duration, {
        value: 0
      }, {
        value: 1,
        delay: delay,
        onUpdate: (id) => {
          let progress = this._tweenProgresses[id];
          this.currentTunnel.material.uniforms.progresses.value[id] = 1 - (.3 / scale) + progress.value * (.3 / scale);
          this.currentTunnel.material.uniforms.opacities.value[id] = Math.sin(progress.value * Math.PI);
        },
        onUpdateParams: [i],
        ease: Linear.easeInOut
      });
    }
  }
}
