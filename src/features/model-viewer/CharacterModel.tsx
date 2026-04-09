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
  stopAnimation: () => void;
  loadMotionGlb: (url: string) => void;
  setPose: (pose: 'tpose' | 'apose' | 'soipo') => void;
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
  function CharacterModel({ url, extraUrls, textures: explicitTextures, textureDir, textureFiles, textureMap: assetTextureMap, expression, expressionFrame = 0 }, ref) {
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

    const processedScenes = useRef(new WeakSet<THREE.Group>());

    useEffect(() => {
      const scene = gltf.scene;
      const alreadyProcessed = processedScenes.current.has(scene);

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

      const HIDDEN_BY_DEFAULT: string[] = [];

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

      // v3: all textures embedded in GLB — no file fetches needed

      const hasExternalTextures = Object.keys(textures).length > 0;
      console.log(`External texture map: ${hasExternalTextures ? Object.keys(textures).length + ' entries' : 'NONE (using GLB materials)'}`);

      const applyMaterials = (obj: THREE.Object3D) => {
        obj.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        if (child.name.includes('_outline')) return;
        if (HIDDEN_BY_DEFAULT.includes(child.name)) { child.visible = false; return; }

        const meshName = child.name;

        // v3 GLBs: embedded textures — apply eye special cases, make others flat/matte
        if (!hasExternalTextures) {
          const origMatName = (child.material as THREE.Material).name || '';
          const mats = Array.isArray(child.material) ? child.material : [child.material];
          const embeddedMap = (mats[0] as THREE.MeshStandardMaterial)?.map;

          // Eye highlight layer — texture embedded in GLB
          if (origMatName.includes('EyeHi') || origMatName.includes('Highlight')) {
            const hlMap = embeddedMap;
            child.material = new THREE.MeshBasicMaterial({
              map: hlMap, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
            });
            child.renderOrder = 2;
            // Lens: check aoMap (embedded) or fallback to file
            const stdMat = mats[0] as THREE.MeshStandardMaterial;
            const lensMap = stdMat?.aoMap;
            if (lensMap) {
              const lensMesh = child.clone();
              lensMesh.material = new THREE.MeshBasicMaterial({
                map: lensMap, transparent: true, blending: THREE.AdditiveBlending, opacity: 0.6, depthWrite: false,
              });
              lensMesh.renderOrder = 3;
              child.parent?.add(lensMesh);
            }
            return;
          }

          // Eye base
          if (meshName === 'Eye' || meshName.startsWith('Eye_')) {
            if (embeddedMap) {
              embeddedMap.wrapS = THREE.RepeatWrapping;
              embeddedMap.wrapT = THREE.RepeatWrapping;
              child.material = new THREE.MeshBasicMaterial({ map: embeddedMap });
              child.renderOrder = 1;
            }
            return;
          }

          // EyeShadow
          if (meshName === 'EyeShadow' || meshName.includes('EyeShadow')) {
            child.material = new THREE.MeshBasicMaterial({
              color: 0x000000, transparent: true, opacity: 0.15, depthWrite: false,
            });
            child.renderOrder = 5;
            return;
          }

          // Everything else: toon shader with embedded textures
          if (embeddedMap) {
            embeddedMap.wrapS = THREE.RepeatWrapping;
            embeddedMap.wrapT = THREE.RepeatWrapping;

            // Shadow texture is in occlusionMap (smuggled via _OcclusionMap slot)
            const stdMat = mats[0] as THREE.MeshStandardMaterial;
            let shadowTex: THREE.Texture | null = stdMat.aoMap;

            // Fallback: find external col1 file by material name (e.g. "Foo_MT" → "Foo_col1.png")
            if (!shadowTex && textureFiles && textureDir) {
              const matBase = origMatName.replace(/_MT$/, '');
              const col1File = textureFiles.find(f => f.startsWith(matBase) && f.includes('col1'));
              if (col1File) shadowTex = loadTex(`${dir}${col1File}`);
            }

            if (shadowTex) {
              shadowTex.wrapS = THREE.RepeatWrapping;
              shadowTex.wrapT = THREE.RepeatWrapping;
              const toon = createToonMaterial({ mainTex: embeddedMap, shadowTex });
              toon.userData = { toonMainTex: embeddedMap, toonShadowTex: shadowTex, isToon: true };
              child.material = toon;
            } else {
              child.material = new THREE.MeshBasicMaterial({ map: embeddedMap });
            }
          }
          return;
        }

        // v2 path: load textures from files
        const highlightTex = loadTexFile('highlightmain');
        const eyeColTex = loadTexFile('eye_col0');
        const eyeLensTex = loadTexFile('eye_lens');

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

      // Only process materials for character models (has skinned meshes)
      // Stages/props keep original GLTFLoader materials
      let hasSkinned = false;
      scene.traverse((c: any) => { if (c.isSkinnedMesh) hasSkinned = true; });

      if (hasSkinned && !alreadyProcessed) {
        applyMaterials(scene);
        processedScenes.current.add(scene);
        controllerRef.current = new ExpressionController(scene);
      } else if (!hasSkinned) {
        // Stages/props: fix metalness (Unity exports metalness=1 which looks grey)
        scene.traverse((c: any) => {
          if (c.isMesh && c.material) {
            const mats = Array.isArray(c.material) ? c.material : [c.material];
            mats.forEach((m: any) => {
              if (m.metalness !== undefined) m.metalness = 0;
              if (m.roughness !== undefined) m.roughness = 1;
            });
          }
        });
      }
      applyScene(scene);

      // Stop any running animation before swapping scene
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
      animClipsRef.current = [];

      if (groupRef.current) {
        groupRef.current.clear();
        groupRef.current.add(scene);
      }
      console.groupEnd();

      return () => {
        mixerRef.current?.stopAllAction();
        mixerRef.current = null;
        textureCache.current.clear();
      };
    }, [gltf, explicitTextures, textureDir, assetTextureMap]);


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
        const costumeRoot = groupRef.current?.children[0];
        if (!groupRef.current || !costumeRoot) return;
        const loader = new GLTFLoader();
        loader.load(url, (motionGltf) => {
          if (!groupRef.current) return;
          mixerRef.current?.stopAllAction();

          // Detect body prefix from motion (_Hips is unique)
          let motionBodyPrefix = '';
          let motionFacePrefix = '';
          motionGltf.scene.traverse((n: any) => {
            if (n.isBone && n.name.endsWith('_Hips') && !motionBodyPrefix) {
              motionBodyPrefix = n.name.slice(0, n.name.indexOf('_Hips'));
            }
          });

          // Detect body + face prefix from costume
          let costumeBodyPrefix = '';
          let costumeFacePrefix = '';
          const costumeBonesSet = new Set<string>();
          costumeRoot.traverse((n: any) => {
            if (n.isBone) {
              costumeBonesSet.add(n.name);
              if (n.name.endsWith('_Hips') && !costumeBodyPrefix)
                costumeBodyPrefix = n.name.slice(0, n.name.indexOf('_Hips'));
            }
          });

          // Derive face prefixes: body prefix up to first uppercase after char 0
          // KahDeA → Kah, KozDeA → Koz, RurUsA → Rur
          const deriveFacePrefix = (bodyPfx: string) => {
            for (let i = 1; i < bodyPfx.length; i++) {
              if (bodyPfx[i] >= 'A' && bodyPfx[i] <= 'Z') return bodyPfx.slice(0, i);
            }
            return bodyPfx;
          };
          motionFacePrefix = deriveFacePrefix(motionBodyPrefix);
          costumeFacePrefix = deriveFacePrefix(costumeBodyPrefix);

          console.log(`[MOTION] Prefix: motion=${motionBodyPrefix}/${motionFacePrefix} → costume=${costumeBodyPrefix}/${costumeFacePrefix}`)
          console.log(`[MOTION] Costume has face bones:`, Array.from(costumeBonesSet).filter(b => b.startsWith(costumeFacePrefix + '_')));

          // Retarget by prefix replacement
          const dropped = new Set<string>();
          const mapped = new Set<string>();
          const clips = motionGltf.animations.map(clip => {
            const tracks: THREE.KeyframeTrack[] = [];
            for (const track of clip.tracks) {
              const [nodeName, ...propParts] = track.name.split('.');
              const prop = '.' + propParts.join('.');

              let targetName = '';
              if (nodeName.startsWith(motionBodyPrefix + '_')) {
                // Cross-costume: skip hair/physics bones (SP_, Hair) — they're costume-specific
                const boneSuffix = nodeName.substring(motionBodyPrefix.length + 1);
                if (motionBodyPrefix !== costumeBodyPrefix && (boneSuffix.startsWith('SP_') || boneSuffix.startsWith('Hair'))) {
                  continue;
                }
                targetName = costumeBodyPrefix + nodeName.substring(motionBodyPrefix.length);
              } else if (nodeName.startsWith(motionFacePrefix + '_')) {
                // Same costume: animate face bones directly
                // Cross-costume: skip face bones — hierarchy under Head handles it
                if (motionBodyPrefix === costumeBodyPrefix) {
                  targetName = costumeFacePrefix + nodeName.substring(motionFacePrefix.length);
                }
              }

              if (targetName && costumeBonesSet.has(targetName)) {
                tracks.push(new (track.constructor as any)(`${targetName}${prop}`, track.times, track.values));
                if (prop === '.quaternion') mapped.add(`${nodeName} → ${targetName}`);
              } else if (costumeBonesSet.has(nodeName)) {
                tracks.push(track);
                if (prop === '.quaternion') mapped.add(`${nodeName} (exact)`);
              } else {
                dropped.add(nodeName);
              }
            }
            return new THREE.AnimationClip(clip.name, clip.duration, tracks);
          });
          const faceMapped = Array.from(mapped).filter(m => m.includes(costumeFacePrefix + '_'));
          console.log(`[MOTION] Mapped total: ${mapped.size}, FACE mapped (${faceMapped.length}):`, faceMapped);
          if (dropped.size > 0) console.warn(`[MOTION] Dropped (${dropped.size}):`, Array.from(dropped));

          const mixer = new THREE.AnimationMixer(costumeRoot);
          mixerRef.current = mixer;
          animClipsRef.current = clips;


          // Debug: dump face hierarchy at runtime
          let faceNode: any = null;
          costumeRoot.traverse((c: any) => { if (!faceNode && c.name?.startsWith('3d_face')) faceNode = c; });
          if (faceNode) {
            const chain: string[] = [];
            let cur = faceNode;
            while (cur) { chain.push(cur.name || '(unnamed)'); cur = cur.parent; }
            chain.reverse();
            console.log(`[MOTION] 3d_face runtime parent chain:`, chain.join(' → '));
          }

          setTimeout(() => {
            const bodyHead = costumeRoot.getObjectByName(costumeBodyPrefix + '_Head');
            const faceHead = costumeRoot.getObjectByName(costumeFacePrefix + '_Head');
            const bodyHips = costumeRoot.getObjectByName(costumeBodyPrefix + '_Hips');
            if (bodyHead && faceHead) {
              bodyHead.updateWorldMatrix(true, false);
              faceHead.updateWorldMatrix(true, false);
              const bw = bodyHead.matrixWorld.elements;
              const fw = faceHead.matrixWorld.elements;
              console.log(`[MOTION] Body ${bodyHead.name} worldPos: [${bw[12].toFixed(3)},${bw[13].toFixed(3)},${bw[14].toFixed(3)}]`);
              console.log(`[MOTION] Face ${faceHead.name} worldPos: [${fw[12].toFixed(3)},${fw[13].toFixed(3)},${fw[14].toFixed(3)}]`);
              console.log(`[MOTION] Diff: [${(bw[12]-fw[12]).toFixed(3)},${(bw[13]-fw[13]).toFixed(3)},${(bw[14]-fw[14]).toFixed(3)}]`);
              if (bodyHips) {
                bodyHips.updateWorldMatrix(true, false);
                const hw = bodyHips.matrixWorld.elements;
                console.log(`[MOTION] Hips worldPos: [${hw[12].toFixed(3)},${hw[13].toFixed(3)},${hw[14].toFixed(3)}]`);
              }
            }
          }, 1000);

          const loop = clips.find(c => c.name.endsWith('@l')) || clips[0];
          if (loop) {
            console.log(`[MOTION] Playing: ${loop.name} (${loop.tracks.length} tracks, ${loop.duration.toFixed(1)}s)`);
            mixer.clipAction(loop).play();
          }
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
