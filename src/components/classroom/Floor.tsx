import { useClassroomStore } from '@/store/useClassroomStore';
import { PODIUM_DEPTH, EYE_HEIGHT, HEAD_RADIUS } from '@/types/classroom';

export function Floor() {
  const { config, seatData } = useClassroomStore();

  const maxZ = seatData.length > 0
    ? Math.max(...seatData.map((s) => s.position[2])) + 1
    : PODIUM_DEPTH + 3;
  const maxWidth = Math.max(
    config.blackboardWidth + 2,
    config.cols * config.colSpacing + 2
  );

  return (
    <group>
      {/* Main floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, maxZ / 2]} receiveShadow>
        <planeGeometry args={[maxWidth + 2, maxZ + 1]} />
        <meshStandardMaterial color="#E8E0D4" roughness={0.9} />
      </mesh>

      {/* Floor grid lines for reference */}
      {Array.from({ length: Math.floor(maxZ) + 1 }, (_, i) => (
        <mesh key={`grid-z-${i}`} position={[0, 0.001, i]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[maxWidth + 2, 0.005]} />
          <meshBasicMaterial color="#C4B8A8" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Side walls */}
      <mesh position={[-(maxWidth + 2) / 2, 1.5, maxZ / 2]}>
        <boxGeometry args={[0.1, 3, maxZ + 1]} />
        <meshStandardMaterial color="#F0EBE3" roughness={0.9} side={2} />
      </mesh>
      <mesh position={[(maxWidth + 2) / 2, 1.5, maxZ / 2]}>
        <boxGeometry args={[0.1, 3, maxZ + 1]} />
        <meshStandardMaterial color="#F0EBE3" roughness={0.9} side={2} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.5, maxZ + 0.5]}>
        <boxGeometry args={[maxWidth + 2, 3, 0.1]} />
        <meshStandardMaterial color="#F0EBE3" roughness={0.9} side={2} />
      </mesh>

      {/* Head spheres (invisible helpers, shown as wireframe when debugging) */}
    </group>
  );
}

export function HeadSpheres() {
  const { seatData, selectedSeat, config } = useClassroomStore();

  if (selectedSeat === null) return null;
  const seat = seatData[selectedSeat];

  return (
    <group>
      {seatData.map((s, i) => {
        if (i === selectedSeat) return null;
        if (s.position[2] <= seat.position[2]) return null;
        if (Math.abs(s.position[0] - seat.position[0]) > config.colSpacing * 2) return null;

        return (
          <mesh
            key={`head-${i}`}
            position={[s.position[0], EYE_HEIGHT, s.position[2]]}
          >
            <sphereGeometry args={[HEAD_RADIUS, 12, 8]} />
            <meshStandardMaterial
              color="#FFD700"
              transparent
              opacity={0.25}
              wireframe
            />
          </mesh>
        );
      })}
    </group>
  );
}
