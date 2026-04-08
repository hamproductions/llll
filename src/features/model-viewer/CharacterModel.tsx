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
  extraUrls?: string[];
  textures?: TextureMap;
  textureDir?: string;
  textureFiles?: string[];
  textureMap?: Record<string, Record<string, string>>;
  animationUrl?: string;
  expression?: ExpressionData | null;
  expressionFrame?: number;
}

export interface CharacterModelHandle {
  expressionController: ExpressionController | null;
  group: THREE.Group | null;
  getMeshNames: () => string[];
  setMeshVisible: (name: string, visible: boolean) => void;
  getMeshVisible: (name: string) => boolean;
  getBounds: () => { center: THREE.Vector3; size: THREE.Vector3 } | null;
  getAnimationNames: () => string[];
  playAnimation: (name: string, loop?: boolean) => void;
  stopAnimation: () => void;
  loadMotionGlb: (url: string) => void;
}

function buildTextureMapFromAssetInfo(
  textureDir: string,
  assetTextureMap: Record<string, Record<string, string>>
): TextureMap {
  const dir = textureDir.endsWith('/') ? textureDir : `${textureDir}/`;
  const map: TextureMap = {};
  for (const [meshName, props] of Object.entries(assetTextureMap)) {
    let mainTex = props['_MainTex'] || props['_MainTexture'] || props['_BaseMap'] || props['_Base_color'] || props['_Base'] || props['_Texture2D'] || props['_MainTexA']
      || Object.entries(props).find(([k]) => k.startsWith('_SampleTexture2D_') || k.startsWith('_GatherTexture2D_'))?.[1];
    const shadowTex = props['_1stShadowTex'];
    // Infer mainTex from shadowTex: col1 → col0
    if (!mainTex && shadowTex) {
      mainTex = shadowTex.replace('_col1', '_col0');
    }
    if (mainTex || shadowTex) {
      map[meshName] = {
        mainTex: mainTex ? `${dir}${mainTex}` : undefined,
        shadowTex: shadowTex ? `${dir}${shadowTex}` : undefined
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
  function CharacterModel({ url, extraUrls, textures: explicitTextures, textureDir, textureFiles, textureMap: assetTextureMap, animationUrl, expression, expressionFrame = 0 }, ref) {
    const gltf = useLoader(GLTFLoader, url, undefined, (error) => {
      console.warn(`Failed to load model: ${url}`, error);
    });
    const groupRef = useRef<THREE.Group>(null);
    const controllerRef = useRef<ExpressionController | null>(null);
    const textureCache = useRef<Map<string, THREE.Texture>>(new Map());
    const mixerRef = useRef<THREE.AnimationMixer | null>(null);
    const animClipsRef = useRef<THREE.AnimationClip[]>([]);

    const loadTex = (path: string | undefined): THREE.Texture | null => {
      if (!path) return null;
      if (textureCache.current.has(path)) return textureCache.current.get(path)!;
      const loader = new THREE.TextureLoader();
      const tex = loader.load(path, undefined, undefined, (err) => {
        console.error(`Texture load failed: ${path}`, err);
      });
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      textureCache.current.set(path, tex);
      return tex;
    };

    useEffect(() => {
      const scene = gltf.scene;

      // ── Debug: dump scene info ──
      const meshes: string[] = [];
      const materials: string[] = [];
      const embeddedTextures: string[] = [];
      scene.traverse((c) => {
        if (c instanceof THREE.Mesh) {
          meshes.push(c.name || '(unnamed)');
          const mats = Array.isArray(c.material) ? c.material : [c.material];
          mats.forEach((m: THREE.Material & { map?: THREE.Texture }) => {
            if (m.name && !materials.includes(m.name)) materials.push(m.name);
            if (m.map) embeddedTextures.push(`${c.name} → ${m.name} (has texture)`);
          });
        }
      });
      console.group(`%c[MODEL] ${url.split('/').pop()}`, 'color: #4fc3f7; font-weight: bold');
      console.log(`Meshes (${meshes.length}):`, meshes);
      console.log(`Materials (${materials.length}):`, materials);
      console.log(`Embedded textures (${embeddedTextures.length}):`, embeddedTextures);

      const applyScene = (root: THREE.Object3D) => {
        const box = new THREE.Box3().setFromObject(root);
        const center = box.getCenter(new THREE.Vector3());
        root.position.set(-center.x, -box.min.y, -center.z);
      };

      const textures: TextureMap = explicitTextures
        ?? (textureDir && assetTextureMap && Object.keys(assetTextureMap).length > 0
          ? buildTextureMapFromAssetInfo(textureDir, assetTextureMap)
          : {});

      const HIDDEN_BY_DEFAULT = ['IndoorShoes'];

      const texFileIndex = new Map<string, string>();
      if (textureDir && textureFiles) {
        const dir = textureDir.endsWith('/') ? textureDir : `${textureDir}/`;
        for (const f of textureFiles) {
          const key = f.replace(/\.[^.]+$/, '').toLowerCase();
          texFileIndex.set(key, `${dir}${f}`);
        }
      }

      const findTexByMaterialName = (matName: string): THREE.Texture | null => {
        if (!matName || matName === 'DefaultMaterial') return null;
        const key = matName.toLowerCase();
        const match = texFileIndex.get(key);
        if (match) return loadTex(match);
        for (const [k, v] of texFileIndex) {
          if (k.includes(key) || key.includes(k)) return loadTex(v);
        }
        return null;
      };

      const dir = textureDir?.endsWith('/') ? textureDir : `${textureDir}/`;
      const findTexFile = (pattern: string) => textureFiles?.find(f => f.toLowerCase().includes(pattern));
      const loadTexFile = (pattern: string) => {
        const file = findTexFile(pattern);
        return file && textureDir ? loadTex(`${dir}${file}`) : null;
      };

      const highlightTex = loadTexFile('highlightmain');
      const eyeColTex = loadTexFile('eye_col0');
      const eyeLensTex = loadTexFile('eye_lens');
      console.log(`[EYE] highlight=${!!highlightTex} eyeCol=${!!eyeColTex} lens=${!!eyeLensTex} textureFiles=${textureFiles?.length ?? 0}`);

      const hasExternalTextures = Object.keys(textures).length > 0;
      console.log(`External texture map: ${hasExternalTextures ? Object.keys(textures).length + ' entries' : 'NONE (using GLB materials)'}`);

      const applyMaterials = (obj: THREE.Object3D) => {
        obj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (child.name.includes('_outline')) return;
        if (HIDDEN_BY_DEFAULT.includes(child.name)) { child.visible = false; return; }

        const meshName = child.name;

        // v3 GLBs: embedded textures, just fix wrapping and let PBR materials render
        if (!hasExternalTextures) {
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          for (const m of mats) {
            const stdMat = m as THREE.MeshStandardMaterial;
            const tex = stdMat.map;
            console.log(`[V3] ${meshName}: mat=${stdMat.name} map=${!!tex} color=${stdMat.color?.getHexString()} type=${stdMat.type}` +
              (tex ? ` tex.image=${!!tex.image} tex.source=${(tex.source as any)?.data ? 'has data' : 'no data'} flipY=${tex.flipY} encoding=${tex.colorSpace} size=${tex.image?.width}x${tex.image?.height}` : ''));
            if (stdMat.map) {
              stdMat.map.wrapS = THREE.RepeatWrapping;
              stdMat.map.wrapT = THREE.RepeatWrapping;
            }
            stdMat.roughness = 1;
            stdMat.metalness = 0;
          }
          return;
        }
        const dotStripped = meshName.replace(/\.\d{3}$/, '');
        const underscoreNumStripped = meshName.replace(/_\d+$/, '');
        const numStripped = meshName.replace(/\d{3}$/, '');
        const texConfig = textures[meshName]
          || textures[dotStripped]
          || textures[underscoreNumStripped]
          || (numStripped !== meshName && textures[numStripped])
          || {};
        const mainTex = loadTex(texConfig.mainTex);
        const shadowTex = loadTex(texConfig.shadowTex);

        if (meshName === 'Eye' || meshName.startsWith('Eye_')) {
          const origMatName = (child.material as THREE.Material).name || '';
          const isHighlight = origMatName.includes('EyeHi') || origMatName.includes('Highlight');
          if (isHighlight) {
            // EyeHi: highlight sparkles (additive)
            child.material = new THREE.MeshBasicMaterial({
              map: highlightTex, transparent: true, blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
            child.renderOrder = 2;
            // Clone lens reflection on same geometry (CryTexture in game)
            if (eyeLensTex) {
              const lensMesh = child.clone();
              lensMesh.material = new THREE.MeshBasicMaterial({
                map: eyeLensTex, transparent: true, blending: THREE.AdditiveBlending,
                opacity: 0.6, depthWrite: false,
              });
              lensMesh.renderOrder = 3;
              child.parent?.add(lensMesh);
            }
          } else {
            // Eye base: iris/pupil texture (unlit flat)
            const eyeTex = mainTex || eyeColTex;
            if (eyeTex) {
              child.material = new THREE.MeshBasicMaterial({ map: eyeTex });
              child.renderOrder = 1;
              // v2 single-mesh Eye: clone highlight on top (lens handled by separate EyeLens mesh)
              // v3 multi-prim Eye: clone highlight + lens (no separate EyeLens mesh)
              if (meshName === 'Eye') {
                if (highlightTex) {
                  const hlMesh = child.clone();
                  hlMesh.material = new THREE.MeshBasicMaterial({
                    map: highlightTex, transparent: true, blending: THREE.AdditiveBlending,
                    depthWrite: false,
                  });
                  hlMesh.renderOrder = 2;
                  child.parent?.add(hlMesh);
                }
              }
            }
          }
          return;
        }

        if (meshName === 'EyeShadow' || meshName.includes('EyeShadow')) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0x000000, transparent: true, opacity: 0.15, depthWrite: false,
          });
          child.renderOrder = 5;
          return;
        }

        if (meshName === 'EyeLens' || meshName.includes('EyeLens')) {
          child.material = new THREE.MeshBasicMaterial({
            map: mainTex || eyeLensTex, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.5, depthWrite: false,
          });
          child.renderOrder = 10;
          return;
        }

        if (mainTex && shadowTex) {
          child.material = createToonMaterial({ mainTex, shadowTex });
        } else if (mainTex) {
          child.material = new THREE.MeshStandardMaterial({
            map: mainTex,
            alphaTest: 0.01,
            side: THREE.DoubleSide,
          });
        } else {
          const origMat = child.material as THREE.MeshStandardMaterial;
          const matName = origMat?.name || '';
          const fallbackTex = findTexByMaterialName(matName);
          if (fallbackTex) {
            child.material = new THREE.MeshStandardMaterial({
              map: fallbackTex,
              alphaTest: 0.01,
              side: THREE.DoubleSide,
            });
          } else if (matName && matName !== 'DefaultMaterial') {
            (child.material as THREE.Material).side = THREE.DoubleSide;
          }
        }

        });
      };

      applyMaterials(scene);
      applyScene(scene);
      controllerRef.current = new ExpressionController(scene);

      if (groupRef.current) {
        groupRef.current.clear();
        groupRef.current.add(scene);
      }
      console.groupEnd();
    }, [gltf, explicitTextures, textureDir, assetTextureMap]);

    useEffect(() => {
      if (!animationUrl || !groupRef.current) return;
      const loader = new GLTFLoader();
      loader.load(animationUrl, (animGltf) => {
        if (!groupRef.current) return;
        const scene = groupRef.current.children[0];
        if (!scene) return;
        const mixer = new THREE.AnimationMixer(scene);
        mixerRef.current = mixer;

        // Retarget clips: strip the root node prefix from track names
        // Animation tracks come as "RootName.property" or "RootName/Child.property"
        // We need them relative to the costume's scene root
        const retargeted = animGltf.animations.map(clip => {
          const tracks = clip.tracks.map(track => {
            let name = track.name;
            // Strip "SomePrefabName(Clone)." or any root prefix before the first bone/mesh
            const dotIdx = name.indexOf('.');
            if (dotIdx > 0) {
              const nodePath = name.substring(0, dotIdx);
              const prop = name.substring(dotIdx);
              // Remove root node name, keep child paths
              const slashIdx = nodePath.indexOf('/');
              if (slashIdx >= 0) {
                name = nodePath.substring(slashIdx + 1) + prop;
              }
            }
            return new THREE.KeyframeTrack(name, track.times, track.values as unknown as number[]);
          });
          return new THREE.AnimationClip(clip.name, clip.duration, tracks);
        });

        animClipsRef.current = retargeted;
        console.group(`%c[ANIM] ${animationUrl.split('/').pop()}`, 'color: #81c784; font-weight: bold');
        console.log(`Clips (${retargeted.length}):`, retargeted.map(c => `${c.name} (${c.duration.toFixed(1)}s, ${c.tracks.length} tracks)`));
        if (retargeted.length > 0) {
          console.log('Sample tracks:', retargeted[0].tracks.slice(0, 5).map(t => t.name));
        }
        console.groupEnd();
      }, undefined, (err) => {
        console.error('Failed to load animation GLB:', animationUrl, err);
      });
      return () => {
        mixerRef.current?.stopAllAction();
        mixerRef.current = null;
        animClipsRef.current = [];
      };
    }, [animationUrl]);

    useEffect(() => {
      if (!controllerRef.current || !expression) return;
      controllerRef.current.applyExpression(expression, expressionFrame);
    }, [expression, expressionFrame]);

    useImperativeHandle(ref, () => ({
      get expressionController() { return controllerRef.current; },
      get group() { return groupRef.current; },
      getMeshNames() {
        const names: string[] = [];
        gltf.scene.traverse((c) => { if (c instanceof THREE.Mesh) names.push(c.name); });
        return names;
      },
      setMeshVisible(name: string, visible: boolean) {
        gltf.scene.traverse((c) => { if (c instanceof THREE.Mesh && c.name === name) c.visible = visible; });
      },
      getMeshVisible(name: string) {
        let vis = true;
        gltf.scene.traverse((c) => { if (c instanceof THREE.Mesh && c.name === name) vis = c.visible; });
        return vis;
      },
      getBounds() {
        if (!groupRef.current?.children.length) return null;
        const box = new THREE.Box3().setFromObject(groupRef.current);
        return { center: box.getCenter(new THREE.Vector3()), size: box.getSize(new THREE.Vector3()) };
      },
      getAnimationNames() {
        return animClipsRef.current.map(c => c.name);
      },
      playAnimation(name: string, loop = true) {
        const mixer = mixerRef.current;
        if (!mixer) return;
        mixer.stopAllAction();
        const clip = animClipsRef.current.find(c => c.name === name);
        if (clip) {
          const action = mixer.clipAction(clip);
          action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
          action.clampWhenFinished = !loop;
          action.play();
        }
      },
      stopAnimation() {
        mixerRef.current?.stopAllAction();
      },
      loadMotionGlb(url: string) {
        const scene = groupRef.current?.children[0];
        if (!scene) return;

        // Find the costume's bone prefix (e.g. "KahLtA")
        let targetPrefix = '';
        scene.traverse((node) => {
          if (node instanceof THREE.Bone && node.name.includes('_Hips')) {
            targetPrefix = node.name.split('_Hips')[0];
          }
        });

        const loader = new GLTFLoader();
        loader.load(url, (motionGltf) => {
          if (!groupRef.current) return;
          mixerRef.current?.stopAllAction();

          // Retarget: replace source prefix with target prefix in all track names
          const clips = motionGltf.animations.map(clip => {
            const tracks = clip.tracks.map(track => {
              let name = track.name;
              // Replace costume prefix: KahDeA_Hips.quaternion → KahLtA_Hips.quaternion
              if (targetPrefix) {
                const match = name.match(/^([A-Za-z]+)_/);
                if (match && match[1] !== targetPrefix) {
                  name = name.replace(match[1], targetPrefix);
                }
              }
              return track.clone().name === name ? track : new (track.constructor as any)(name, track.times, track.values);
            });
            return new THREE.AnimationClip(clip.name, clip.duration, tracks);
          });

          const mixer = new THREE.AnimationMixer(scene);
          mixerRef.current = mixer;
          animClipsRef.current = clips;
          console.log(`[MOTION] Loaded ${clips.length} clips (prefix: ${targetPrefix}):`,
            clips.map(c => `${c.name}(${c.tracks.length}t)`));

          const loop = clips.find(c => c.name.endsWith('@l')) || clips[0];
          if (loop) mixer.clipAction(loop).play();
        }, undefined, (err) => console.error('[MOTION] Failed:', url, err));
      },
      setPose(pose: 'tpose' | 'apose' | 'soipo') {
        const scene = groupRef.current?.children[0];
        if (!scene) return;
        const bones: Record<string, THREE.Bone> = {};
        scene.traverse((node) => {
          if (node instanceof THREE.Bone) bones[node.name] = node;
        });

        const findBone = (suffix: string) => Object.entries(bones).find(([k]) => k.endsWith(suffix))?.[1];
        // Only reset arm bones — legs/hips/spine have critical bind pose rotations
        for (const suffix of ['_LArm', '_RArm', '_LForeArm', '_RForeArm']) {
          const bone = findBone(suffix);
          if (bone) bone.quaternion.identity();
        }

        if (pose === 'tpose') return;

        const lArm = findBone('_LArm');
        const rArm = findBone('_RArm');
        const lForeArm = findBone('_LForeArm');
        const rForeArm = findBone('_RForeArm');
        const lUpLeg = findBone('_LUpLeg');
        const rUpLeg = findBone('_RUpLeg');
        const lLeg = findBone('_LLeg');
        const rLeg = findBone('_RLeg');

        if (pose === 'apose') {
          if (lArm) lArm.quaternion.setFromEuler(new THREE.Euler(0, 0.7, 0));
          if (rArm) rArm.quaternion.setFromEuler(new THREE.Euler(0, -0.7, 0));
        }

        if (pose === 'soipo') {
          // Left arm up high pointing, right arm down
          if (lArm) lArm.quaternion.setFromEuler(new THREE.Euler(0, 0.4, 0.5));
          if (lForeArm) lForeArm.quaternion.setFromEuler(new THREE.Euler(0, -0.5, 0));
          if (rArm) rArm.quaternion.setFromEuler(new THREE.Euler(0, 0.8, -0.3));
          if (rForeArm) rForeArm.quaternion.setFromEuler(new THREE.Euler(0, 0.4, 0));
        }
      },
    }));

    useFrame((_, delta) => {
      controllerRef.current?.update(delta);
      mixerRef.current?.update(delta);
    });

    return <group ref={groupRef} />;
  }
);
