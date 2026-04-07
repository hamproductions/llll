import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createToonMaterial, createOutlineMaterial } from './ToonMaterial';
import { ExpressionController, type ExpressionData } from './ExpressionController';

export interface TextureConfig {
  mainTex?: string;
  shadowTex?: string;
}

export interface TextureMap {
  [meshName: string]: TextureConfig;
}

interface CharacterModelProps {
  url: string;
  textures?: TextureMap;
  textureDir?: string;
  textureFiles?: string[];
  textureMap?: Record<string, Record<string, string>>;
  noAutoScale?: boolean;
  expression?: ExpressionData | null;
  expressionFrame?: number;
}

export interface CharacterModelHandle {
  expressionController: ExpressionController | null;
  group: THREE.Group | null;
}

function buildTextureMapFromAssetInfo(
  textureDir: string,
  assetTextureMap: Record<string, Record<string, string>>
): TextureMap {
  const map: TextureMap = {};
  for (const [meshName, props] of Object.entries(assetTextureMap)) {
    const mainTex = props['_MainTex'] || props['_BaseMap'] || props['_Base_color'];
    const shadowTex = props['_1stShadowTex'];
    if (mainTex || shadowTex) {
      map[meshName] = {
        mainTex: mainTex ? `${textureDir}${mainTex}` : undefined,
        shadowTex: shadowTex ? `${textureDir}${shadowTex}` : undefined
      };
    }
  }
  return map;
}

function ModelErrorFallback() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#ff4444" wireframe />
    </mesh>
  );
}

export const CharacterModel = forwardRef<CharacterModelHandle, CharacterModelProps>(
  function CharacterModel({ url, textures: explicitTextures, textureDir, textureFiles, textureMap: assetTextureMap, noAutoScale, expression, expressionFrame = 0 }, ref) {
    const gltf = useLoader(GLTFLoader, url, undefined, (error) => {
      console.warn(`Failed to load model: ${url}`, error);
    });
    const groupRef = useRef<THREE.Group>(null);
    const controllerRef = useRef<ExpressionController | null>(null);
    const textureCache = useRef<Map<string, THREE.Texture>>(new Map());

    const loadTex = (path: string | undefined): THREE.Texture | null => {
      if (!path) return null;
      if (textureCache.current.has(path)) return textureCache.current.get(path)!;
      const loader = new THREE.TextureLoader();
      const tex = loader.load(path);
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      textureCache.current.set(path, tex);
      return tex;
    };

    useEffect(() => {
      const scene = gltf.scene;
      scene.rotation.set(0, 0, 0);

      if (!noAutoScale) {
        const box = new THREE.Box3().setFromObject(scene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = maxDim > 0 ? 2.0 / maxDim : 1;
        scene.scale.setScalar(scale);
        scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
      } else {
        scene.scale.setScalar(1);
        scene.position.set(0, 0, 0);
      }

      const textures: TextureMap = explicitTextures
        ?? (textureDir && assetTextureMap && Object.keys(assetTextureMap).length > 0
          ? buildTextureMapFromAssetInfo(textureDir, assetTextureMap)
          : {});

      const outlines: { parent: THREE.Object3D; mesh: THREE.Mesh }[] = [];

      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (child.name.includes('_outline')) return;

        const meshName = child.name;
        const dotStripped = meshName.replace(/\.\d{3}$/, '');
        const numStripped = meshName.replace(/\d{3}$/, '');
        const texConfig = textures[meshName]
          || textures[dotStripped]
          || (numStripped !== meshName && textures[numStripped])
          || {};
        const mainTex = loadTex(texConfig.mainTex);
        const shadowTex = loadTex(texConfig.shadowTex);

        if (meshName === 'EyeShadow' || meshName.includes('EyeShadow')) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x000000, transparent: true, opacity: 0.15, depthWrite: false,
          });
          child.renderOrder = 5;
          return;
        }

        if (meshName === 'EyeLens' || meshName.includes('EyeLens')) {
          child.material = new THREE.MeshBasicMaterial({
            map: mainTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
          });
          child.renderOrder = 10;
          return;
        }

        if (mainTex && shadowTex) {
          child.material = createToonMaterial({ mainTex, shadowTex });
        } else if (mainTex) {
          child.material = new THREE.MeshStandardMaterial({ map: mainTex });
        }

        if (child.parent && !(child as THREE.SkinnedMesh).isSkinnedMesh) {
          const outline = new THREE.Mesh(child.geometry, createOutlineMaterial());
          outline.name = `${meshName}_outline`;
          outline.renderOrder = -1;
          if (child.morphTargetDictionary) {
            outline.morphTargetDictionary = child.morphTargetDictionary;
            outline.morphTargetInfluences = child.morphTargetInfluences;
          }
          outlines.push({ parent: child.parent, mesh: outline });
        }
      });

      outlines.forEach(({ parent, mesh }) => parent.add(mesh));
      controllerRef.current = new ExpressionController(scene);

      if (groupRef.current) {
        groupRef.current.clear();
        groupRef.current.add(scene);
      }
    }, [gltf, explicitTextures, textureDir, assetTextureMap, noAutoScale]);

    useEffect(() => {
      if (!controllerRef.current || !expression) return;
      controllerRef.current.applyExpression(expression, expressionFrame);
    }, [expression, expressionFrame]);

    useImperativeHandle(ref, () => ({
      get expressionController() { return controllerRef.current; },
      get group() { return groupRef.current; }
    }));

    useFrame((_, delta) => {
      controllerRef.current?.update(delta);
    });

    return <group ref={groupRef} />;
  }
);
