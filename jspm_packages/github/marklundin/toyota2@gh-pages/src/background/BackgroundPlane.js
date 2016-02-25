import THREE from "THREE";

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
	uniform vec3 color;
	uniform float opacity;

	varying vec2 vUv;

	void main() {
		float strength = 9.0;

    float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;

		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		float depth = gl_FragCoord.z / gl_FragCoord.w;
		float fade = smoothstep(0.1, 50.0, depth);

		gl_FragColor = vec4(color + grain.xyz, vUv.x * fade * opacity);
	}`;


export default class BackgroundPlane extends THREE.Object3D {
  constructor() {
    super();

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
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
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      depthTest: false,
      depthWrite: false,
      side: THREE.DoubleSide,
      transparent: true
    }));

    this.mesh.frustumCulled = false;

    this.add(this.mesh);
  }
}
