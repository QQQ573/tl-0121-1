import * as THREE from 'three';
import {
  BLACKBOARD_HEIGHT,
  BLACKBOARD_BOTTOM_Y,
  PODIUM_DEPTH,
} from '@/types/classroom';
import { useClassroomStore } from '@/store/useClassroomStore';

export function Blackboard() {
  const { config } = useClassroomStore();
  const { blackboardWidth, podiumHeight } = config;

  const bbBottom = BLACKBOARD_BOTTOM_Y + podiumHeight;
  const bbCenterY = bbBottom + BLACKBOARD_HEIGHT / 2;

  return (
    <group>
      {/* Blackboard surface */}
      <mesh position={[0, bbCenterY, 0]} castShadow>
        <boxGeometry args={[blackboardWidth, BLACKBOARD_HEIGHT, 0.05]} />
        <meshStandardMaterial color="#1A472A" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Blackboard frame */}
      {[
        [0, bbBottom - 0.02, 0.03],
        [0, bbBottom + BLACKBOARD_HEIGHT + 0.02, 0.03],
        [-blackboardWidth / 2 - 0.02, bbCenterY, 0.03],
        [blackboardWidth / 2 + 0.02, bbCenterY, 0.03],
      ].map((pos, i) => {
        const isHorizontal = i < 2;
        return (
          <mesh
            key={`frame-${i}`}
            position={pos as [number, number, number]}
          >
            <boxGeometry
              args={[
                isHorizontal ? blackboardWidth + 0.08 : 0.04,
                isHorizontal ? 0.04 : BLACKBOARD_HEIGHT + 0.08,
                0.02,
              ]}
            />
            <meshStandardMaterial color="#5C3A1E" roughness={0.6} />
          </mesh>
        );
      })}

      {/* Chalk tray */}
      <mesh position={[0, bbBottom - 0.02, 0.04]}>
        <boxGeometry args={[blackboardWidth * 0.8, 0.03, 0.06]} />
        <meshStandardMaterial color="#5C3A1E" roughness={0.6} />
      </mesh>

      {/* Podium / platform */}
      <mesh
        position={[0, podiumHeight / 2, PODIUM_DEPTH / 2]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[blackboardWidth + 1, podiumHeight, PODIUM_DEPTH]} />
        <meshStandardMaterial color="#B8A088" roughness={0.8} />
      </mesh>

      {/* Podium front edge stripe */}
      <mesh position={[0, podiumHeight + 0.005, 0.01]}>
        <boxGeometry args={[blackboardWidth + 1, 0.01, 0.02]} />
        <meshStandardMaterial color="#F5A623" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}
