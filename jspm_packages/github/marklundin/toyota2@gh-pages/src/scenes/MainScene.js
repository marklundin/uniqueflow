import THREE from "THREE";
import "THREE.TrackballControls";

import Lines from "../lines/Lines.js";
import Background from "../background/Background.js";
import Path from "../path/Path.js";
import Tunnel from "../tunnel/Tunnel.js";
import CameraControls from "../CameraControls.js";
import Pointer from "../utils/Pointer.js";
import App from "../App.js";
import SoundManager from "../utils/SoundManager.js";
import { spring } from "../utils/spring.js";

export default class MainScene extends THREE.Scene {
  constructor(canvas, useTextureNoise = true, fov = 65, viewOffset = [ 0, 0 ]) {

    super();

    this.pointer = Pointer.get(canvas);

    this.camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 0.1, 100000);

    this.camera.setViewOffset( 
      window.innerWidth + viewOffset[0], 
      window.innerHeight+ viewOffset[1], 
      ...viewOffset, window.innerWidth , window.innerHeight )

    App.onSceneChange.add(this.onSceneChange, this);

    // Lighting

    let ambientLight = new THREE.AmbientLight(0xeeeeee);
    this.add(ambientLight);

    let directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(1, 1, 1);
    this.add(directionalLight);

    /*
        The character object is the focal point of the interaction.
        This is the point at which the lines geometry is generated
        and the camera follows
    */
    this.character = new THREE.Vector3();

    this.background = new Background(this.character, useTextureNoise );
    if (!/\bnobackground\b/.test(window.location.search)) {
      this.add(this.background);
    }
    
    this.path = new Path();
    this.path.update();

    // this.tunnel = new Tunnel(this.path);
    // this.add(this.tunnel);

    this.lines = new Lines(this.character);
    this.add(this.lines);

    if(/\bdebugcamera\b/.test(window.location.search)) {
      this.camera.position.z = 1;
      this.controls = new THREE.TrackballControls(this.camera);
    }
    else {
      this.controls = new CameraControls(this.camera, this.character );
    }

    SoundManager.play("Drone_02", {
      loop: true
    });

    for (let i = 0; i < 100; i++) {
      this.update();
    }

    App.onResize.add(this.resize, this);
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  onSceneChange(name, data) {
    if (data.sound) {
      SoundManager.play(data.sound);
    }
  }

  update(timeScale = 1) {
    // Move the focus point along the path
    this.path.update(timeScale);
    this.character.lerp(this.path.position, .1 * timeScale);

    // Update camera controls
    this.controls.update(timeScale);

    this.lines.update(timeScale);
  }
}
