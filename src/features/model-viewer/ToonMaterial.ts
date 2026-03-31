import * as THREE from 'three';

export interface ToonMaterialParams {
  mainTex?: THREE.Texture | null;
  shadowTex?: THREE.Texture | null;
}

const gradientData = new Uint8Array([0, 255]);
const defaultGradient = new THREE.DataTexture(gradientData, 2, 1, THREE.RedFormat);
defaultGradient.needsUpdate = true;
defaultGradient.minFilter = THREE.NearestFilter;
defaultGradient.magFilter = THREE.NearestFilter;

export function createToonMaterial(params: ToonMaterialParams = {}): THREE.MeshToonMaterial {
  const mat = new THREE.MeshToonMaterial({
    map: params.mainTex,
    gradientMap: defaultGradient,
    side: THREE.FrontSide,
    transparent: true,
  });

  const shadowTex = params.shadowTex;
  if (shadowTex && shadowTex !== params.mainTex) {
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.u_shadowTex = { value: shadowTex };

      shader.fragmentShader = shader.fragmentShader.replace(
        'uniform vec3 diffuse;',
        `uniform vec3 diffuse;
uniform sampler2D u_shadowTex;`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `vec4 diffuseColor = vec4( diffuse, opacity );
vec4 _col0 = texture2D( map, vMapUv );
vec4 _col1 = texture2D( u_shadowTex, vMapUv );`
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <lights_toon_fragment>',
        `#include <lights_toon_fragment>

{
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  float NdotL = dot(nonPerturbedNormal, lightDir) * 0.5 + 0.5;
  float toonStep = smoothstep(0.38, 0.42, NdotL);
  vec3 litColor = _col0.rgb;
  vec3 shadColor = _col1.rgb;
  reflectedLight.directDiffuse = mix(shadColor, litColor, toonStep);
}
`
      );
    };
  }

  return mat;
}

export function createOutlineMaterial(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(0.15, 0.1, 0.1),
    side: THREE.BackSide,
  });
}
