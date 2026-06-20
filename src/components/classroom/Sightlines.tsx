import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useClassroomStore } from '@/store/useClassroomStore';
import { EYE_HEIGHT, BLACKBOARD_HEIGHT, BLACKBOARD_BOTTOM_Y } from '@/types/classroom';

export function Sightlines() {
  const { selectedSeat, sightlineResult, seatData, config } = useClassroomStore();

  const lines = useMemo(() => {
    if (selectedSeat === null || !sightlineResult) return [];

    const seat = seatData[selectedSeat];
    const eyePos: [number, number, number] = [
      seat.position[0],
      EYE_HEIGHT,
      seat.position[2],
    ];

    return sightlineResult.sampleResults.map((sample, i) => {
      const color = sample.blocked ? '#E53E3E' : '#38A169';
      const points: [number, number, number][] = [eyePos, sample.point];

      return { key: i, points, color, blocked: sample.blocked };
    });
  }, [selectedSeat, sightlineResult, seatData]);

  if (selectedSeat === null || !sightlineResult) return null;

  const seat = seatData[selectedSeat];
  const bbBottom = BLACKBOARD_BOTTOM_Y + config.podiumHeight;
  const bbTop = bbBottom + BLACKBOARD_HEIGHT;
  const bbHalfW = config.blackboardWidth / 2;

  return (
    <group>
      {lines.map(({ key, points, color }) => (
        <Line
          key={key}
          points={points}
          color={color}
          lineWidth={2}
          transparent
          opacity={0.7}
        />
      ))}

      {/* Eye point indicator */}
      <mesh position={[seat.position[0], EYE_HEIGHT, seat.position[2]]}>
        <sphereGeometry args={[0.05, 16, 12]} />
        <meshBasicMaterial color="#F5A623" />
      </mesh>

      {/* Blackboard visibility overlay */}
      <BlackboardOverlay
        bbBottom={bbBottom}
        bbTop={bbTop}
        bbHalfW={bbHalfW}
      />
    </group>
  );
}

function BlackboardOverlay({
  bbBottom,
  bbTop,
  bbHalfW,
}: {
  bbBottom: number;
  bbTop: number;
  bbHalfW: number;
}) {
  const { sightlineResult } = useClassroomStore();

  if (!sightlineResult) return null;

  const blockedPoints = sightlineResult.sampleResults.filter(
    (s) => s.blocked
  );

  return (
    <group>
      {blockedPoints.map((sample, i) => (
        <mesh key={`blocked-${i}`} position={sample.point}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshBasicMaterial color="#E53E3E" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
