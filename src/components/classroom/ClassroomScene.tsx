import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Desk } from './Desk';
import { Blackboard } from './Blackboard';
import { Floor, HeadSpheres } from './Floor';
import { Sightlines } from './Sightlines';
import { useClassroomStore } from '@/store/useClassroomStore';
import { PODIUM_DEPTH } from '@/types/classroom';

function SceneContent() {
  const { seatData, selectedSeat, config, selectSeat } = useClassroomStore();

  const handleSeatClick = (index: number) => {
    if (selectedSeat === index) {
      selectSeat(null);
    } else {
      selectSeat(index);
    }
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-3, 6, -2]}
        intensity={0.3}
      />

      <Floor />
      <Blackboard />
      <HeadSpheres />
      <Sightlines />

      {seatData.map((seat, i) => (
        <Desk
          key={`${config.layoutPreset}-${i}`}
          position={seat.position}
          isSelected={selectedSeat === i}
          isOccluded={seat.isOccluded}
          onClick={() => handleSeatClick(i)}
        />
      ))}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={2}
        maxDistance={30}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.05}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN,
        }}
      />
    </>
  );
}

function CameraSetup() {
  const { seatData } = useClassroomStore();
  const { camera } = useThree();

  useMemo(() => {
    if (seatData.length === 0) return;
    const maxZ = Math.max(...seatData.map((s) => s.position[2]));
    const maxX = Math.max(...seatData.map((s) => Math.abs(s.position[0])));
    camera.position.set(0, maxZ * 0.8, maxZ + 2);
    camera.lookAt(0, 1, maxZ / 2);
  }, [seatData, camera]);

  return null;
}

export function ClassroomScene() {
  return (
    <Canvas
      shadows
      camera={{ fov: 50, near: 0.1, far: 100, position: [0, 6, 8] }}
      style={{ background: '#1a1a2e' }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <CameraSetup />
      <SceneContent />
    </Canvas>
  );
}
