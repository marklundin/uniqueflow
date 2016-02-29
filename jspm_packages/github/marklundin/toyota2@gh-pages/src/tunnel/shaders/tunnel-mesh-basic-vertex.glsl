attribute float lengthPosition;

varying float vLengthPosition;

// THREE.ShaderChunk[ "common" ],
// THREE.ShaderChunk[ "uv_pars_vertex" ],
// THREE.ShaderChunk[ "uv2_pars_vertex" ],
// THREE.ShaderChunk[ "envmap_pars_vertex" ],
// THREE.ShaderChunk[ "color_pars_vertex" ],
// THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
// THREE.ShaderChunk[ "skinning_pars_vertex" ],
// THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
// THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

void main() {

	vLengthPosition = lengthPosition;

  // THREE.ShaderChunk[ "uv_vertex" ],
  // THREE.ShaderChunk[ "uv2_vertex" ],
  // THREE.ShaderChunk[ "color_vertex" ],
  // THREE.ShaderChunk[ "skinbase_vertex" ],

	#ifdef USE_ENVMAP

  // THREE.ShaderChunk[ "beginnormal_vertex" ],
  // THREE.ShaderChunk[ "morphnormal_vertex" ],
  // THREE.ShaderChunk[ "skinnormal_vertex" ],
  // THREE.ShaderChunk[ "defaultnormal_vertex" ],

	#endif

  // THREE.ShaderChunk[ "begin_vertex" ],
  // THREE.ShaderChunk[ "morphtarget_vertex" ],
  // THREE.ShaderChunk[ "skinning_vertex" ],
  // THREE.ShaderChunk[ "project_vertex" ],
  // THREE.ShaderChunk[ "logdepthbuf_vertex" ],

  // THREE.ShaderChunk[ "worldpos_vertex" ],
  // THREE.ShaderChunk[ "envmap_vertex" ],
  // THREE.ShaderChunk[ "shadowmap_vertex" ],

}
