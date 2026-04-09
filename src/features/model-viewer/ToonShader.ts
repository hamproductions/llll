import * as THREE from 'three';

export const EdgeDetectionShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'tDepth': { value: null },
    'tNormal': { value: null },
    'resolution': { value: new THREE.Vector2() },
    'cameraNear': { value: 0.1 },
    'cameraFar': { value: 1000.0 },
    'outlineThickness': { value: 1.0 },
    'outlineColor': { value: new THREE.Color(0x000000) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform sampler2D tNormal;
    uniform vec2 resolution;
    uniform float cameraNear;
    uniform float cameraFar;
    uniform float outlineThickness;
    uniform vec3 outlineColor;
    varying vec2 vUv;

    float getLinearDepth(vec2 uv) {
      float z_b = texture2D(tDepth, uv).r;
      float z_n = 2.0 * z_b - 1.0;
      return (2.0 * cameraNear * cameraFar) / (cameraFar + cameraNear - z_n * (cameraFar - cameraNear));
    }

    void main() {
      vec4 originalColor = texture2D(tDiffuse, vUv);
      float rawDepth = texture2D(tDepth, vUv).r;

      if (rawDepth >= 0.9999) {
        gl_FragColor = originalColor;
        return;
      }

      vec2 texel = vec2(1.0 / resolution.x, 1.0 / resolution.y) * outlineThickness;
      float centerDepth = getLinearDepth(vUv);

      float d_t = getLinearDepth(vUv + vec2(0.0, texel.y));
      float d_b = getLinearDepth(vUv + vec2(0.0, -texel.y));
      float d_l = getLinearDepth(vUv + vec2(-texel.x, 0.0));
      float d_r = getLinearDepth(vUv + vec2(texel.x, 0.0));
      float depthEdge = sqrt(pow(d_r - d_l, 2.0) + pow(d_t - d_b, 2.0));
      float depthIndicator = smoothstep(0.5, 0.6, depthEdge);

      vec3 n_t = texture2D(tNormal, vUv + vec2(0.0, texel.y)).rgb;
      vec3 n_b = texture2D(tNormal, vUv + vec2(0.0, -texel.y)).rgb;
      vec3 n_l = texture2D(tNormal, vUv + vec2(-texel.x, 0.0)).rgb;
      vec3 n_r = texture2D(tNormal, vUv + vec2(texel.x, 0.0)).rgb;
      float normalEdgeSq = dot(n_r - n_l, n_r - n_l) + dot(n_t - n_b, n_t - n_b);
      float normalIndicator = smoothstep(0.08, 0.13, normalEdgeSq);

      float edge = max(depthIndicator, normalIndicator);

      if (edge > 0.1) {
        float lineAlpha = clamp(12.0 / (2.0 + centerDepth), 0.0, 1.0);
        gl_FragColor = mix(originalColor, vec4(outlineColor, 1.0), lineAlpha * edge);
      } else {
        gl_FragColor = originalColor;
      }
    }
  `
};
