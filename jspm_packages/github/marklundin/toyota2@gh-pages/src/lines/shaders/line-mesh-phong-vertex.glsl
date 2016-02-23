#define PHONG
#define POINTS_NUMBER 1000.
#define WIDTH 128.
#define HEIGHT 128.

varying vec3 vViewPosition;

uniform float offsetID;
uniform float dataOffset;
uniform float scale;

uniform sampler2D data;

attribute float id;

varying float vLengthRatio;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

// THREE.ShaderChunk[ "common" ],
// THREE.ShaderChunk[ "uv_pars_vertex" ],
// THREE.ShaderChunk[ "uv2_pars_vertex" ],
// THREE.ShaderChunk[ "displacementmap_pars_vertex" ],
// THREE.ShaderChunk[ "envmap_pars_vertex" ],
// THREE.ShaderChunk[ "lights_phong_pars_vertex" ],
// THREE.ShaderChunk[ "color_pars_vertex" ],
// THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
// THREE.ShaderChunk[ "skinning_pars_vertex" ],
// THREE.ShaderChunk[ "shadowmap_pars_vertex" ],
// THREE.ShaderChunk[ "logdepthbuf_pars_vertex" ],

mat3 matrixFromEuler(vec3 euler)
{
	mat3 m;

	float a = cos(euler.x);
	float b = sin(euler.x);
	float c = cos(euler.y);
	float d = sin(euler.y);
	float e = cos(euler.z);
	float f = sin(euler.z);

	float ae = a * e;
	float af = a * f;
	float be = b * e;
	float bf = b * f;

	m[0][0] = c * e;
	m[0][1] = - c * f;
	m[0][2] = d;

	m[1][0] = af + be * d;
	m[1][1] = ae - bf * d;
	m[1][2] = - b * c;

	m[2][0] = bf - ae * d;
	m[2][1] = be + af * d;
	m[2][2] = a * c;

  return m;
}

void main() {

  vec3 position = position;

	float pointID = mod(id + offsetID, POINTS_NUMBER) + dataOffset;

	vec4 dataChunk1 = texture2D(data, vec2(mod(pointID, WIDTH * .5) / WIDTH * 2., floor(pointID / WIDTH * 2.) / HEIGHT));
	vec4 dataChunk2 = texture2D(data, vec2(mod(pointID + .5, WIDTH * .5) / WIDTH * 2., floor((pointID + .5) / WIDTH * 2.) / HEIGHT));

	vec3 point = dataChunk1.xyz;
	float radius = dataChunk1.w;
	vec3 rotation = dataChunk2.xyz;
	float type = dataChunk2.w;

	float lengthRatio = id / POINTS_NUMBER;

	vLengthRatio = lengthRatio;

	position *= radius * scale * lengthRatio;

	mat3 rotationMatrix = matrixFromEuler(rotation);
	position *= rotationMatrix;

	position += point;

  // THREE.ShaderChunk[ "uv_vertex" ],
  // THREE.ShaderChunk[ "uv2_vertex" ],
  // THREE.ShaderChunk[ "color_vertex" ],

  // THREE.ShaderChunk[ "beginnormal_vertex" ],
  // THREE.ShaderChunk[ "morphnormal_vertex" ],
  // THREE.ShaderChunk[ "skinbase_vertex" ],
  // THREE.ShaderChunk[ "skinnormal_vertex" ],
  // THREE.ShaderChunk[ "defaultnormal_vertex" ],

#ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

#endif

  // THREE.ShaderChunk[ "begin_vertex" ],
  // THREE.ShaderChunk[ "displacementmap_vertex" ],
  // THREE.ShaderChunk[ "morphtarget_vertex" ],
  // THREE.ShaderChunk[ "skinning_vertex" ],
  // THREE.ShaderChunk[ "project_vertex" ],
  // THREE.ShaderChunk[ "logdepthbuf_vertex" ],

	vViewPosition = - mvPosition.xyz;

  // THREE.ShaderChunk[ "worldpos_vertex" ],
  // THREE.ShaderChunk[ "envmap_vertex" ],
  // THREE.ShaderChunk[ "lights_phong_vertex" ],
  // THREE.ShaderChunk[ "shadowmap_vertex" ],

#ifndef FLAT_SHADED

	vNormal *= rotationMatrix;

#endif

}
