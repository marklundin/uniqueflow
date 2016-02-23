import THREE from "THREE";
import App from "./App.js";
import { spring3, spring } from "./utils/spring";

/*
	This utility moves a THREE.Object3D towards a 3D position in space whilst optionally maintaining
	a minimum distance from it. The easing is a damped spring equation which can be continually
	updated with a new position.

	It also aims the camera towards the object too.
*/

export default class CameraControls {
  constructor(camera, character) {
    this.camera = camera;
    this.character = character;

    this.targetPositionDistance = 0.1;

    this.eye = new THREE.Vector3().copy(this.character);
    this.eyeTarget = new THREE.Vector3().copy(this.character);
    this._vector3Cached = new THREE.Vector3();
    this.focalDistance = 0.2;
    this.positionDistance = 0.2;

    this.wagon = new THREE.Vector3();

    // Define some transitions to position and orientate the camera
    this.positionlDistanceTransition = spring(10.5);
    this.positionTransition = spring3(10.5);
    this.eyeTargetTransition = spring3(5);
    this.focalDistanceTransition = spring(0.9);

    App.onSceneChange.add(this.onSceneChange, this);
  }

  onSceneChange() {
    this.targetPositionDistance = Math.max(this.targetPositionDistance - 0.08, 0.08);
  }

  update(timeScale) {
    // Update camera distance
    this.targetPositionDistance = Math.min(this.targetPositionDistance + 0.005, 0.5);

    this.wagon.lerp(this.character, .015 * timeScale);

    let delta = .016 * timeScale;

    let targetFocalDistance = this.targetPositionDistance * 0.5;

    // CAMERA DIRECTION

    // Animate the value (0-1) along the path at which the camera should point
    this.focalDistance += this.focalDistanceTransition(this.focalDistance, targetFocalDistance, delta);

    // the get 3d point
    this.eyeTarget.copy(this.character).sub(this.wagon).normalize().multiplyScalar(this.focalDistance * -10).add(this.character);

    //
    this.eye.add(this.eyeTargetTransition(this.eye, this.eyeTarget, delta));

    // CAMERA POSITION

    // Animate the value (0-1) along the path at which the camera should point
    this.positionDistance += this.positionlDistanceTransition(this.positionDistance, this.targetPositionDistance, delta);

    let distanceFromLine = 50 * this.targetPositionDistance;
    let normal = new THREE.Vector3(0, distanceFromLine, 0);
    this._vector3Cached.copy(this.character).sub(this.wagon).normalize().multiplyScalar(this.positionDistance * -200).add(this.character);
    this._vector3Cached.add(normal);

    // UPDATE CAMERA
    this.camera.position.add(this.positionTransition(this.camera.position, this._vector3Cached, delta));
    this.camera.lookAt(this.eye);
  }
}
