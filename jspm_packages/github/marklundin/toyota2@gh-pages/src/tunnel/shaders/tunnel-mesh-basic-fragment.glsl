uniform vec3 diffuse;
uniform float opacity;
uniform float progresses[5];
uniform float opacities[5];
uniform float ringLength;

varying float vLengthPosition;

// THREE.ShaderChunk[ "common" ],
// THREE.ShaderChunk[ "color_pars_fragment" ],
// THREE.ShaderChunk[ "uv_pars_fragment" ],
// THREE.ShaderChunk[ "uv2_pars_fragment" ],
// THREE.ShaderChunk[ "map_pars_fragment" ],
// THREE.ShaderChunk[ "alphamap_pars_fragment" ],
// THREE.ShaderChunk[ "aomap_pars_fragment" ],
// THREE.ShaderChunk[ "envmap_pars_fragment" ],
// THREE.ShaderChunk[ "fog_pars_fragment" ],
// THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
// THREE.ShaderChunk[ "specularmap_pars_fragment" ],
// THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

void main() {

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( diffuse, opacity );
	vec3 totalAmbientLight = vec3( 1.0 ); // hardwired
	vec3 shadowMask = vec3( 1.0 );

  // THREE.ShaderChunk[ "logdepthbuf_fragment" ],
  // THREE.ShaderChunk[ "map_fragment" ],
  // THREE.ShaderChunk[ "color_fragment" ],
  // THREE.ShaderChunk[ "alphamap_fragment" ],
  // THREE.ShaderChunk[ "alphatest_fragment" ],
  // THREE.ShaderChunk[ "specularmap_fragment" ],
  // THREE.ShaderChunk[ "aomap_fragment" ],
  // THREE.ShaderChunk[ "shadowmap_fragment" ],

	outgoingLight = diffuseColor.rgb * totalAmbientLight * shadowMask;

  // THREE.ShaderChunk[ "envmap_fragment" ],

  // THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

  // THREE.ShaderChunk[ "fog_fragment" ],

	float alpha = 0.;

	for(int i = 0; i < 5; i++) {
		alpha += (1. - smoothstep(abs(progresses[i] - (1. - vLengthPosition)), 0., ringLength)) * opacities[i];
	}

	alpha = min(alpha, 1.);


	float depth = gl_FragCoord.z / gl_FragCoord.w;
	float fade = smoothstep(0.1, 100.0, depth);

	gl_FragColor = vec4( outgoingLight, diffuseColor.a * alpha * fade );

}
