System.config({
  defaultJSExtensions: true,
  transpiler: "babel",
  babelOptions: {
    "optional": [
      "runtime",
      "optimisation.modules.system"
    ],
    "loose": [
      "es6.forOf"
    ]
  },
  paths: {
    "github:*": "jspm_packages/github/*",
    "npm:*": "jspm_packages/npm/*"
  },

  packages: {
    "THREE": {
      "format": "global"
    }
  },

  meta: {
    "THREE/examples/js/*": {
      "globals": {
        "THREE": "THREE"
      }
    }
  },

  map: {
    "THREE": "github:mrdoob/three.js@r73",
    "THREE.CopyShader": "github:mrdoob/three.js@r73/examples/js/shaders/CopyShader.js",
    "THREE.EffectComposer": "github:mrdoob/three.js@r73/examples/js/postprocessing/EffectComposer.js",
    "THREE.FXAAShader": "github:mrdoob/three.js@r73/examples/js/shaders/FXAAShader.js",
    "THREE.MaskPass": "github:mrdoob/three.js@r73/examples/js/postprocessing/MaskPass.js",
    "THREE.RenderPass": "github:mrdoob/three.js@r73/examples/js/postprocessing/RenderPass.js",
    "THREE.ShaderPass": "github:mrdoob/three.js@r73/examples/js/postprocessing/ShaderPass.js",
    "THREE.TrackballControls": "github:mrdoob/three.js@r73/examples/js/controls/TrackballControls.js",
    "babel": "npm:babel-core@5.8.35",
    "babel-runtime": "npm:babel-runtime@5.8.35",
    "core-js": "npm:core-js@1.2.6",
    "gsap": "npm:gsap@1.18.2",
    "howler": "npm:howler@1.1.29",
    "min-signal": "npm:min-signal@0.0.5",
    "mobile-detect": "npm:mobile-detect@1.3.1",
    "screenfull": "npm:screenfull@3.0.0",
    "text": "github:systemjs/plugin-text@0.0.4",
    "github:jspm/nodelibs-assert@0.1.0": {
      "assert": "npm:assert@1.3.0"
    },
    "github:jspm/nodelibs-buffer@0.1.0": {
      "buffer": "npm:buffer@3.6.0"
    },
    "github:jspm/nodelibs-path@0.1.0": {
      "path-browserify": "npm:path-browserify@0.0.0"
    },
    "github:jspm/nodelibs-process@0.1.2": {
      "process": "npm:process@0.11.2"
    },
    "github:jspm/nodelibs-util@0.1.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:assert@1.3.0": {
      "util": "npm:util@0.10.3"
    },
    "npm:babel-runtime@5.8.35": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:buffer@3.6.0": {
      "base64-js": "npm:base64-js@0.0.8",
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "ieee754": "npm:ieee754@1.1.6",
      "isarray": "npm:isarray@1.0.0",
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:core-js@1.2.6": {
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0",
      "process": "github:jspm/nodelibs-process@0.1.2",
      "systemjs-json": "github:systemjs/plugin-json@0.1.0"
    },
    "npm:gsap@1.18.2": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:howler@1.1.29": {
      "buffer": "github:jspm/nodelibs-buffer@0.1.0"
    },
    "npm:inherits@2.0.1": {
      "util": "github:jspm/nodelibs-util@0.1.0"
    },
    "npm:mobile-detect@1.3.1": {
      "child_process": "github:jspm/nodelibs-child_process@0.1.0",
      "fs": "github:jspm/nodelibs-fs@0.1.2",
      "path": "github:jspm/nodelibs-path@0.1.0"
    },
    "npm:path-browserify@0.0.0": {
      "process": "github:jspm/nodelibs-process@0.1.2"
    },
    "npm:process@0.11.2": {
      "assert": "github:jspm/nodelibs-assert@0.1.0"
    },
    "npm:util@0.10.3": {
      "inherits": "npm:inherits@2.0.1",
      "process": "github:jspm/nodelibs-process@0.1.2"
    }
  }
});
