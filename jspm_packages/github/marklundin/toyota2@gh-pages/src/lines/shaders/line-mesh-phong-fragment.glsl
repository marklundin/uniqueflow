#define PHONG

uniform vec3 color;
uniform vec3 tipColor;

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float emissiveIntensity;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying float vLengthRatio;

// THREE.ShaderChunk[ "common" ],
// THREE.ShaderChunk[ "color_pars_fragment" ],
// THREE.ShaderChunk[ "uv_pars_fragment" ],
// THREE.ShaderChunk[ "uv2_pars_fragment" ],
// THREE.ShaderChunk[ "map_pars_fragment" ],
// THREE.ShaderChunk[ "alphamap_pars_fragment" ],
// THREE.ShaderChunk[ "aomap_pars_fragment" ],
// THREE.ShaderChunk[ "lightmap_pars_fragment" ],
// THREE.ShaderChunk[ "emissivemap_pars_fragment" ],
// THREE.ShaderChunk[ "envmap_pars_fragment" ],
// THREE.ShaderChunk[ "fog_pars_fragment" ],
// THREE.ShaderChunk[ "lights_phong_pars_fragment" ],
// THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
// THREE.ShaderChunk[ "bumpmap_pars_fragment" ],
// THREE.ShaderChunk[ "normalmap_pars_fragment" ],
// THREE.ShaderChunk[ "specularmap_pars_fragment" ],
// THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

void main() {

	vec3 color = mix(color, tipColor, smoothstep(.9, 1., vLengthRatio));

	vec3 outgoingLight = vec3( 0.0 );
	vec4 diffuseColor = vec4( color, opacity );
	vec3 totalAmbientLight = ambientLightColor;
	vec3 totalEmissiveLight = color;
	vec3 shadowMask = vec3( 1.0 );

	totalEmissiveLight *= emissiveIntensity;
	diffuseColor.rgb *= (1. - emissiveIntensity);

	// THREE.ShaderChunk[ "logdepthbuf_fragment" ],
	// THREE.ShaderChunk[ "map_fragment" ],
	// THREE.ShaderChunk[ "color_fragment" ],
	// THREE.ShaderChunk[ "alphamap_fragment" ],
	// THREE.ShaderChunk[ "alphatest_fragment" ],
	// THREE.ShaderChunk[ "specularmap_fragment" ],
	// THREE.ShaderChunk[ "normal_phong_fragment" ],
	// THREE.ShaderChunk[ "lightmap_fragment" ],
	// THREE.ShaderChunk[ "hemilight_fragment" ],
	// THREE.ShaderChunk[ "aomap_fragment" ],
	// THREE.ShaderChunk[ "emissivemap_fragment" ],

	// THREE.ShaderChunk[ "lights_phong_fragment" ],
	// THREE.ShaderChunk[ "shadowmap_fragment" ],

	totalDiffuseLight *= shadowMask;
	totalSpecularLight *= shadowMask;

	#ifdef METAL

		outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) * specular + totalSpecularLight + totalEmissiveLight;

	#else

		outgoingLight += diffuseColor.rgb * ( totalDiffuseLight + totalAmbientLight ) + totalSpecularLight + totalEmissiveLight;

	#endif

	// THREE.ShaderChunk[ "envmap_fragment" ],

	// THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

	// THREE.ShaderChunk[ "fog_fragment" ],

	// outgoingLight = mix(outgoingLight, outgoingLight + (1. - (outgoingLight.r + outgoingLight.g + outgoingLight.b) / 3.), smoothstep(.95, 1., vLengthRatio));

	outgoingLight = mix(outgoingLight, vec3(1.), step(.9985, vLengthRatio));

	gl_FragColor = vec4( outgoingLight, diffuseColor.a * vLengthRatio );

}
