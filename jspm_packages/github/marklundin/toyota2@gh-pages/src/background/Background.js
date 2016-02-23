import THREE from "THREE";
import planes from "./shapes.js";
import Geometry from "./OpenBoxGeometry.js";
import DATA from "../data.js";
import App from "../App.js";
import { spring3 } from "../utils/spring";
import { random } from "../utils/math";

let vertexShader = `
precision mediump float;
precision mediump int;

varying vec2 vUv;

void main()	{
	vUv = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

let gradientFragmentShader = `
	uniform vec3 color;

	varying vec2 vUv;

	void main() {
		float strength = 9.0;

    float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;

		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		float depth = gl_FragCoord.z / gl_FragCoord.w;
		float fade = smoothstep(0.1, 50.0, depth);

		gl_FragColor = vec4(color + grain.xyz, vUv.x * fade);
	}`;

let detailMaterial1 = new THREE.ShaderMaterial({
  uniforms: {
    color: {
      type: "c",
      value: new THREE.Color(0)
    },
		opacity: {
      type: "f",
      value: 1
		}
  },
  depthWrite: false,
  // depthTest: false,
  fragmentShader: gradientFragmentShader,
  vertexShader: vertexShader,
  side: THREE.DoubleSide,
  transparent: true
});

let detailMaterial2 = detailMaterial1.clone();

export default class Background extends THREE.Object3D {
  constructor(character) {
    super();

    let boundingArea = [0, 0],
      planeSizeRange = [1050, 1350],
      N = 3

    this.shapes = planes(N, Geometry, boundingArea, planeSizeRange, DATA.scenes["default"].background.assets);

    this.shapes[N - 1].scale.set(0.2, 0.2, 0.2)
    // this.shapes[N-1].material.depthTest = false
    // this.shapes[N-1].material.depthWrite = false

    this.add(...this.shapes)

    // DETAIL PLANES TYPE 1 - AXIS ALIGNED ROTATION, UNIFORMLY DISTRIBUTED

    let detail,
      size = [10, 10],
      detailPlanes1 = Array.from(Array(10), v => {


        detail = new THREE.Mesh(new THREE.PlaneGeometry(...size), detailMaterial1)
        let hPI = Math.PI * 0.5

        detail.rotation.set(
          Math.round(random(1)) * hPI,
          Math.round(random(1)) * hPI,
          Math.round(random(1)) * hPI
        )


        detail.position.set(
          random(-400, 400),
          random(-400, 400),
          random(-400, 400)
        ) //.normalize4).setLength(4700 )
        return detail

      })

    let detailType1 = new THREE.Object3D()
    detailType1.add(...detailPlanes1)
    this.add(detailType1)


    // DETAIL PLANES TYPE 2 - LARGER ABSTRACT, RANDOM ROTATION, EDGE DISTRIBUTED
    size = [80, 80]
    let detailPlanes2 = Array.from(Array(20), v => {

      detail = new THREE.Mesh(new THREE.PlaneGeometry(...size), detailMaterial2)
      let PI2 = Math.PI * 2.0

      detail.rotation.set(
        random(1) * PI2,
        random(1) * PI2,
        random(1) * PI2
      )

      detail.position.set(
        random(-1, 1),
        random(-1, 1),
        random(-1, 1)
      ).normalize().setLength(700)
      return detail

    })


    let detailType2 = new THREE.Object3D()
    detailType2.add(...detailPlanes2)
    this.add(detailType2)

    this.detailsTypes = [detailType2, detailType1]

    this.animationMap = this.shapes.map(s => spring3(20));
    this.rotationMap = this.shapes.map(s => new THREE.Euler().copy(s.rotation))

		for (let child of this.children) {
			child.frustumCulled = false;
		}

    App.onSceneChange.add((name, {background, transitionDuration = .4}) => {

      TweenMax.to(this.position, transitionDuration * 3, {
        x: character.x,
        y: character.y,
        z: character.z,
        ease: Power0.easeInOut
      })

      let range = 0.6
      this.shapes.forEach((plane, i) => {
        let color = new THREE.Color(background.assets[i % background.assets.length])

        TweenMax.to(plane.material.uniforms.color.value, transitionDuration * .5, {
          r: color.r,
          g: color.g,
          b: color.b,
          ease: Power2.easeInOut
        });
      })

      let colorDetail = new THREE.Color(background.detail.color);

      TweenMax.to(detailMaterial1.uniforms.color.value, transitionDuration * .5, {
        r: colorDetail.r,
        g: colorDetail.g,
        b: colorDetail.b,
        ease: Power2.easeInOut
      });

			TweenMax.to(detailMaterial2.uniforms.color.value, transitionDuration * .5, {
        r: colorDetail.r,
        g: colorDetail.g,
        b: colorDetail.b,
        ease: Power2.easeInOut
      });

			TweenMax.to(detailMaterial1.uniforms.opacity, transitionDuration * .5, {
				value: background.detail.type === 1 ? 1 : 0,
				ease: Power2.easeInOut
			});

			TweenMax.to(detailMaterial2.uniforms.opacity, transitionDuration * .5, {
				value: background.detail.type === 0 ? 1 : 0,
				ease: Power2.easeInOut
			});

      let obj3d = this.detailsTypes[background.detail.type];
      // if (obj3d) {
			for (let detailType of this.detailsTypes) {
				for (let child of detailType.children) {
					TweenMax.to(child.scale, transitionDuration, {
						x: background.detail.scale[0],
						y: background.detail.scale[1],
						ease: Power2.easeInOut
					});
				}
			}
			// }

      this.rotationMap.forEach(rotation => rotation.set(
        random(rotation.x - range, rotation.x + range),
        random(rotation.y - range, rotation.y + range),
        random(rotation.z - range, rotation.z + range)
      ))

    })

  }

  update(timeScale) {
		for (let [i, animation] of this.animationMap.entries()) {
			let v = animation(this.shapes[i].rotation, this.rotationMap[i], 1 / 60 * timeScale)
			this.shapes[i].rotation.x += v.x
			this.shapes[i].rotation.y += v.y
			this.shapes[i].rotation.z += v.z
		}
  }
}
