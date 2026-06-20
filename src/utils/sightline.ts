import * as THREE from 'three';
import {
  SeatData,
  ClassroomConfig,
  SightlineResult,
  EYE_HEIGHT,
  HEAD_RADIUS,
  BLACKBOARD_HEIGHT,
  BLACKBOARD_BOTTOM_Y,
} from '@/types/classroom';

export function computeSightline(
  seatIndex: number,
  seats: SeatData[],
  config: ClassroomConfig
): SightlineResult {
  const seat = seats[seatIndex];
  const eyePos: [number, number, number] = [
    seat.position[0],
    EYE_HEIGHT,
    seat.position[2],
  ];

  const bbBottom = BLACKBOARD_BOTTOM_Y + config.podiumHeight;
  const bbTop = bbBottom + BLACKBOARD_HEIGHT;
  const bbHalfW = config.blackboardWidth / 2;
  const bbZ = 0.05;

  const sampleCount = 9;
  const sampleResults: { point: [number, number, number]; blocked: boolean }[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const t = i / (sampleCount - 1);
    const sx = -bbHalfW + t * config.blackboardWidth;
    const points: [number, number, number][] = [
      [sx, bbBottom, bbZ],
      [sx, bbTop, bbZ],
    ];

    for (const samplePoint of points) {
      let blocked = false;
      const rayOrigin = new THREE.Vector3(...eyePos);
      const rayDir = new THREE.Vector3(
        samplePoint[0] - eyePos[0],
        samplePoint[1] - eyePos[1],
        samplePoint[2] - eyePos[2]
      ).normalize();

      const ray = new THREE.Ray(rayOrigin, rayDir);

      const sphere = new THREE.Sphere(
        new THREE.Vector3(),
        HEAD_RADIUS
      );

      for (let j = 0; j < seats.length; j++) {
        if (j === seatIndex) continue;
        const other = seats[j];
        if (other.position[2] <= seat.position[2]) continue;
        if (Math.abs(other.position[0] - seat.position[0]) > config.colSpacing * 2) continue;

        sphere.center.set(other.position[0], EYE_HEIGHT, other.position[2]);

        if (ray.intersectsSphere(sphere)) {
          const distToHead = rayOrigin.distanceTo(sphere.center);
          const distToBoard = rayOrigin.distanceTo(
            new THREE.Vector3(...samplePoint)
          );
          if (distToHead < distToBoard) {
            blocked = true;
            break;
          }
        }
      }

      sampleResults.push({ point: samplePoint, blocked });
    }
  }

  const totalSamples = sampleResults.length;
  const blockedSamples = sampleResults.filter((s) => s.blocked).length;
  const visibilityPercent = Math.round(
    ((totalSamples - blockedSamples) / totalSamples) * 100
  );

  return {
    seatIndex,
    totalSamples,
    blockedSamples,
    visibilityPercent,
    isOccluded: visibilityPercent < 100,
    sampleResults,
  };
}
