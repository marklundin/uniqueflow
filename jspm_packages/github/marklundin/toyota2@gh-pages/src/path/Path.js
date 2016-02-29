import THREE from "THREE";
import Signal from "min-signal";

import App from "../App.js";

import PATHS_COLLADA from "./models/Toyota_C-HR_2016_Splines_9.dae!text";

const SPEED = 1.8;

export default class Path {
  constructor() {
    let collada = new THREE.ColladaLoader().parse(PATHS_COLLADA);


    let rawPaths = [];
    this.paths = [];
    this.curves = [];

    this.distance = 0;

    this.direction = new THREE.Vector3();
    this.position = new THREE.Vector3();
    this.previousVertex = new THREE.Vector3();
    this.nextVertex = new THREE.Vector3();
    this.currentOffsetMatrix = new THREE.Matrix4();

    this._origin = new THREE.Vector3(0, 0, 0);
    this._up = new THREE.Vector3(0, 1, 0);

    collada.scene.traverse((obj) => {
      if(obj instanceof THREE.Line || obj instanceof THREE.Mesh) {
        obj.name = obj.parent.name;
        rawPaths.push(obj);
      }
    }, true);

    let material = new THREE.LineBasicMaterial({
      color: 0xff0000
    });

    let i = 0;
    for (let rawPath of rawPaths) {
      let firstVertex = rawPath.geometry.vertices[0];
      let secondVertex = rawPath.geometry.vertices[1];
      let matrix = new THREE.Matrix4();
      rawPath.geometry.translate(
        -firstVertex.x,
        -firstVertex.y,
        -firstVertex.z
      );
      matrix.lookAt(this._origin, secondVertex, this._up);
      matrix.getInverse(matrix);
      rawPath.geometry.applyMatrix(matrix);
      let curve = new THREE.CatmullRomCurve3(rawPath.geometry.vertices);
      curve.name = rawPath.name;
      this.curves.push(curve);
      let geometry = new THREE.Geometry();
      geometry.vertices = curve.getPoints(200);
      let path = new THREE.Line(geometry, material);
      path.name = rawPath.name;
      this.paths.push(path);
      path.position.x = i;
    }

    this.currentPath = this.paths[0];

    this.previousDistance = this.nextDistance = 0;
    this.currentEdgeID = -1;

    App.onSceneChange.add(this.onSceneChange, this);
  }
  onSceneChange(name, data) {
    for (let path of this.paths) {
      if(path.name === name) {
        this.currentPath = path;
        this._sceneChanged = true;
        this.update(0);
        break;
      }
    }
  }
  update(timeScale = 1) {
    this.distance += SPEED * timeScale;

    if(this.distance >= this.nextDistance) {
      this.currentEdgeID++;
      if(this._sceneChanged || this.currentEdgeID >= this.currentPath.geometry.vertices.length - 1) {
        this._sceneChanged = false;
        this.currentEdgeID = 0;
        this.currentOffsetMatrix.makeRotationFromEuler(new THREE.Euler(
          Math.random() * Math.PI * 4 - Math.PI * 2,
          Math.random() * Math.PI * 4 - Math.PI * 2,
          Math.random() * Math.PI * 4 - Math.PI * 2
        ));
        this.currentOffsetMatrix.setPosition(this.nextVertex);
      }
      this.previousVertex.copy(this.currentPath.geometry.vertices[this.currentEdgeID]);
      this.previousVertex.applyMatrix4(this.currentOffsetMatrix);
      this.nextVertex.copy(this.currentPath.geometry.vertices[this.currentEdgeID + 1]);
      this.nextVertex.applyMatrix4(this.currentOffsetMatrix);
      this.previousDistance = this.nextDistance;
      this.nextDistance += this.previousVertex.distanceTo(this.nextVertex);
      this.direction.copy(this.nextVertex).sub(this.previousVertex).normalize();
    }
    this.position.copy(this.previousVertex).lerp(this.nextVertex, (this.distance - this.previousDistance) / (this.nextDistance - this.previousDistance));
  }
}
