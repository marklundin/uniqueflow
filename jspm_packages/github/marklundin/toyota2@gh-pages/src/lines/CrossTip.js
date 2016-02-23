import THREE from "THREE";

export default class CrossTip extends THREE.Object3D {
  constructor() {
    super();

    let geometry = new THREE.BoxGeometry(0.1, 4, 0.1);
    geometry.translate(0, 4, 0);

    this.material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true
    });

    this.parts = [];

    for (let i = 0; i < 4; i++) {
      let partContainer = new THREE.Object3D();
      let part = new THREE.Mesh(geometry, this.material);
      this.parts.push(part);
      partContainer.rotation.z = Math.PI * i * .5;
      partContainer.add(part);
      this.add(partContainer);
    }
  }

  show(duration = 0, easing) {
    TweenMax.to(this.material, duration, {
      opacity: 1,
      ease: easing
    });
    for (let part of this.parts) {
      TweenMax.to(part.rotation, duration, {
        x: 0,
        ease: easing
      });
    }
  }

  hide(duration = 0, easing) {
    TweenMax.to(this.material, duration, {
      opacity: 0,
      ease: easing
    });
    for (let part of this.parts) {
      TweenMax.to(part.rotation, duration, {
        x: -Math.PI * .5,
        ease: easing
      });
    }
  }
}
