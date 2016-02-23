import THREE from "THREE";

export default class ShaderUtils {
  static replaceThreeChunks(glsl) {
    return glsl.replace(/\/\/\s*THREE\.ShaderChunk\[\s*\"\s*(\w+)\"*\s*\]\s*[,|;]*/g, (a, b) => {
      return THREE.ShaderChunk[b] + '\n';
    });
  }
}
