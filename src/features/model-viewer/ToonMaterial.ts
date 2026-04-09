import * as THREE from 'three';

export interface ToonMaterialParams {
  mainTex?: THREE.Texture | null;
  shadowTex?: THREE.Texture | null;
}

const toonVertexShader = `
#include <common>
#include <uv_pars_vertex>
#include <skinning_pars_vertex>
#include <morphtarget_pars_vertex>
#include <lights_pars_begin>

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  vUv = uv;

  #include <skinbase_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>

  vNormal = normalize(transformedNormal);

  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>

  vViewPosition = -mvPosition.xyz;
}
`;

const toonFragmentShader = `
#include <common>
#include <lights_pars_begin>

uniform sampler2D uMainTex;
uniform sampler2D uShadowTex;
uniform float uThreshold;
uniform float uSmoothness;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec2 vUv;

void main() {
  vec3 normal = normalize(vNormal);

  vec4 col0 = texture2D(uMainTex, vUv);
  vec4 col1 = texture2D(uShadowTex, vUv);

  // Use first directional light
  vec3 lightDir = normalize(directionalLights[0].direction);
  float NdotL = dot(normal, lightDir);

  float diff = smoothstep(uThreshold - uSmoothness, uThreshold + uSmoothness, NdotL);
  vec3 finalColor = mix(col1.rgb, col0.rgb, diff);

  gl_FragColor = vec4(finalColor, col0.a);
}
`;

export function createToonMaterial(params: ToonMaterialParams = {}): THREE.ShaderMaterial {
  const mainTex = params.mainTex;
  const shadowTex = params.shadowTex || params.mainTex;

  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.lights,
    {
      uMainTex: { value: mainTex },
      uShadowTex: { value: shadowTex },
      uThreshold: { value: 0.5 },
      uSmoothness: { value: 0.01 },
    }
  ]);

  return new THREE.ShaderMaterial({
    vertexShader: toonVertexShader,
    fragmentShader: toonFragmentShader,
    uniforms,
    lights: true,
    side: THREE.FrontSide,
    transparent: true,
  });
}

export function createOutlineMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.15, 0.1, 0.1),
    side: THREE.BackSide,
  });
}
