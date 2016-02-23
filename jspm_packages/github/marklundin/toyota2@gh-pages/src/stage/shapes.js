import THREE from "THREE";
import { random } from "../utils/math"



let gradientFragmentShader = `

	uniform vec2 direction;
	uniform vec3 color;
	uniform float mNear;
	uniform float mFar;

	varying vec2 vUv;

	void main() {

		float strength = 9.0;
    	float x = (vUv.x + 4.0 ) * (vUv.y + 4.0 ) * (1.0 * 10.0);
		vec4 grain = vec4( mod((mod( x, 13.0 ) + 1.0) * ( mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;


		float depth = gl_FragCoord.z / gl_FragCoord.w;
		float v = smoothstep( 0.1, 100.0, depth );


		gl_FragColor = vec4( color + grain.xyz, mix( 0.0, 1.0, sin( vUv.y * 3.14 ) * v * 0.9 ));

		// gl_FragColor = vec4( vec3( v ), 1.0 );
	}`


let vertexShader = `

	precision mediump float;
	precision mediump int;

	varying vec2 vUv;
	//varying vec4 vPosition;

	void main()	{

		vUv = uv;
		//vPosition = modelViewMatrix * vec4( position, 1.0 );
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}`


let material = new THREE.ShaderMaterial({
  uniforms: {
    color: {
      type: "c",
      value: new THREE.Color(0x000000)
    },
  },
  depthWrite: false,
  // depthTest: false,
  fragmentShader: gradientFragmentShader,
  vertexShader: vertexShader,
  side: THREE.DoubleSide,
  transparent: true
})





export default (N, Geometry, positionRange, sizeRange, palette) => {


  let positions = Array.from(new Array(N), v => new THREE.Vector3(random(...positionRange), random(...positionRange), random(...positionRange))),
    plane, dimension, scale

  return positions.map((p, i) => {
    dimension = random(...sizeRange)
    scale = random(1, 7)
    // plane = new THREE.Mesh( new Geometry( dimension, dimension* scale, dimension ), new THREE.MeshNormalMaterial({
    // 	side:THREE.DoubleSide,
    // 	// depthWrite: false,
    // 	// depthTest: false,
    // 	transparent:true
    // }) )
    plane = new THREE.Mesh(new Geometry(dimension, dimension * scale, dimension), material.clone())
    plane.material.uniforms.color.value.set(palette[i % 2])
    plane.receiveShadow = true
    plane.renderOrder = i
    plane.frustumCulled = false
    plane.position.copy(p)
    plane.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )
    return plane
  })

}
