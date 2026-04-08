import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';

type BgMode = 'dark' | 'light' | 'transparent';
type CameraMode = 'orbit' | 'fps' | 'turntable';

interface ViewportProps {
  bgMode?: BgMode;
  showGrid?: boolean;
  cameraMode?: CameraMode;
  resetKey?: string;
  children?: React.ReactNode;
  fitTarget?: { center: THREE.Vector3; size: THREE.Vector3 } | null;
}

const bgColors: Record<BgMode, string> = {
  dark: '#1a1a2e',
  light: '#e8e8e8',
  transparent: 'transparent'
};

function CameraReset({ resetKey, cameraMode, fitTarget }: { resetKey?: string; cameraMode: CameraMode; fitTarget?: { center: THREE.Vector3; size: THREE.Vector3 } | null }) {
  const { camera } = useThree();

  useEffect(() => {
    if (cameraMode === 'fps') {
      camera.position.set(0, 2, -5);
      camera.lookAt(0, 1, 0);
      return;
    }

    if (fitTarget) {
      const { center, size } = fitTarget;
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      const dist = (maxDim / 2) / Math.tan(fov / 2) * 1.4;
      camera.position.set(center.x, center.y, center.z + dist);
      camera.lookAt(center.x, center.y, center.z);
    } else {
      camera.position.set(0, 1.2, 3.5);
      camera.lookAt(0, 1, 0);
    }
  }, [resetKey, cameraMode, fitTarget]);

  return null;
}

function FPSControls() {
  const { camera, gl } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const locked = useRef(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!locked.current) return;
      if (['Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ'].includes(e.code)) e.preventDefault();
      keys.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0 || e.button === 2) {
        gl.domElement.requestPointerLock();
      }
    };

    const onPointerLockChange = () => {
      locked.current = document.pointerLockElement === gl.domElement;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!locked.current) return;
      euler.current.setFromQuaternion(camera.quaternion);
      euler.current.y -= e.movementX * 0.002;
      euler.current.x -= e.movementY * 0.002;
      euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
      camera.quaternion.setFromEuler(euler.current);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    gl.domElement.addEventListener('mousedown', onMouseDown);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      gl.domElement.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('mousemove', onMouseMove);
      if (document.pointerLockElement === gl.domElement) {
        document.exitPointerLock();
      }
    };
  }, [camera, gl]);

  useFrame((_, delta) => {
    const speed = keys.current['ShiftLeft'] ? 15 : 5;
    const move = new THREE.Vector3();

    if (keys.current['KeyW']) move.z -= 1;
    if (keys.current['KeyS']) move.z += 1;
    if (keys.current['KeyA']) move.x -= 1;
    if (keys.current['KeyD']) move.x += 1;
    if (keys.current['Space']) move.y += 1;
    if (keys.current['ControlLeft'] || keys.current['KeyQ']) move.y -= 1;

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * delta);
      move.applyQuaternion(camera.quaternion);
      camera.position.add(move);
      const B = 50;
      camera.position.clamp(new THREE.Vector3(-B, 0.1, -B), new THREE.Vector3(B, B, B));
    }
  });

  return null;
}

function SceneBackground({ bgMode }: { bgMode: BgMode }) {
  const { scene, gl } = useThree();

  useEffect(() => {
    if (bgMode === 'transparent') {
      scene.background = null;
      gl.setClearColor(0x000000, 0);
    } else {
      scene.background = new THREE.Color(bgColors[bgMode]);
      gl.setClearColor(bgColors[bgMode], 1);
    }
  }, [bgMode, scene, gl]);

  return null;
}

export function Viewport({ bgMode = 'dark', showGrid = true, cameraMode = 'orbit', resetKey, fitTarget, children }: ViewportProps) {
  const isFps = cameraMode === 'fps';

  return (
    <Canvas
      camera={{
        position: isFps ? [0, 2, 5] : [0, 1.2, 3],
        fov: isFps ? 70 : 35,
        near: 0.01,
        far: 1000
      }}
      style={{ width: '100%', height: '100%' }}
      gl={{ alpha: true, antialias: true }}
    >
      <SceneBackground bgMode={bgMode} />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#ffffff', '#444466', 0.3]} />
      <directionalLight position={[5, 8, 3]} intensity={0.8} />
      <directionalLight position={[-3, 4, -2]} intensity={0.3} />
      {isFps && <pointLight position={[0, 3, 0]} intensity={1} distance={30} />}
      <CameraReset resetKey={resetKey} cameraMode={cameraMode} fitTarget={fitTarget} />
      {cameraMode === 'orbit' || cameraMode === 'turntable' ? (
        <OrbitControls
          target={fitTarget ? [fitTarget.center.x, fitTarget.center.y, fitTarget.center.z] : [0, 1, 0]}
          minDistance={0.3}
          maxDistance={50}
          enablePan
          enableDamping
          dampingFactor={0.1}
          autoRotate={cameraMode === 'turntable'}
          autoRotateSpeed={2}
        />
      ) : (
        <FPSControls />
      )}
      {showGrid && (
        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#4a4a6a"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#6a6a8a"
          fadeDistance={isFps ? 100 : 10}
          infiniteGrid
          position={[0, 0, 0]}
        />
      )}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
