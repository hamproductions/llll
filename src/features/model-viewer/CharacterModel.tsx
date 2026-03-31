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
  expression?: ExpressionData | null;
  expressionFrame?: number;
}

export interface CharacterModelHandle {
  expressionController: ExpressionController | null;
  group: THREE.Group | null;
}

export const CharacterModel = forwardRef<CharacterModelHandle, CharacterModelProps>(
  function CharacterModel({ url, textures = {}, expression, expressionFrame = 0 }, ref) {
    const gltf = useLoader(GLTFLoader, url);
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

      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 2.0 / maxDim : 1;
      scene.scale.setScalar(scale);
      scene.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

      const outlines: { parent: THREE.Object3D; mesh: THREE.Mesh }[] = [];

      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (child.name.includes('_outline')) return;

        const meshName = child.name;
        const baseName = meshName.replace(/[\._]?\d+$/, '');
        const texConfig = textures[meshName] || textures[baseName] || textures['*'] || {};
        const mainTex = loadTex(texConfig.mainTex);
        const shadowTex = loadTex(texConfig.shadowTex);

        if (meshName === 'EyeShadow') {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x000000, transparent: true, opacity: 0.15, depthWrite: false,
          });
          child.renderOrder = 5;
          return;
        }

        if (meshName === 'EyeLens') {
          child.material = new THREE.MeshBasicMaterial({
            map: mainTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
          });
          child.renderOrder = 10;
          return;
        }

        child.material = createToonMaterial({ mainTex, shadowTex });

        if (child.parent) {
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
      (window as any).__modelScene = scene;
      (window as any).__expressionCtrl = controllerRef.current;

      if (groupRef.current) {
        groupRef.current.clear();
        groupRef.current.add(scene);
      }
    }, [gltf, textures]);

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
