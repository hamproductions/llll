import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';

type BgMode = 'dark' | 'light' | 'transparent';

interface ViewportProps {
  bgMode?: BgMode;
  showGrid?: boolean;
  children?: React.ReactNode;
}

const bgColors: Record<BgMode, string> = {
  dark: '#1a1a2e',
  light: '#e8e8e8',
  transparent: 'transparent'
};

export function Viewport({ bgMode = 'dark', showGrid = true, children }: ViewportProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 3], fov: 35, near: 0.01, far: 100 }}
      style={{
        width: '100%',
        height: '100%',
        background: bgColors[bgMode]
      }}
      gl={{ alpha: bgMode === 'transparent', antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      <directionalLight position={[-2, 3, -1]} intensity={0.3} />
      <OrbitControls
        target={[0, 1, 0]}
        minDistance={1}
        maxDistance={10}
        enableDamping
        dampingFactor={0.1}
      />
      {showGrid && (
        <Grid
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#4a4a6a"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#6a6a8a"
          fadeDistance={10}
          infiniteGrid
          position={[0, 0, 0]}
        />
      )}
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
