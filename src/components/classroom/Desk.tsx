import { useRef, useState } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import {
  DESK_WIDTH,
  DESK_DEPTH,
  DESK_HEIGHT,
  CHAIR_WIDTH,
  CHAIR_DEPTH,
  CHAIR_SEAT_HEIGHT,
  CHAIR_BACK_HEIGHT,
} from '@/types/classroom';

interface DeskProps {
  position: [number, number, number];
  isSelected: boolean;
  isOccluded: boolean;
  onClick: () => void;
}

const woodMaterial = new THREE.MeshStandardMaterial({
  color: '#8B7355',
  roughness: 0.7,
  metalness: 0.1,
});

const metalMaterial = new THREE.MeshStandardMaterial({
  color: '#4A4A4A',
  roughness: 0.4,
  metalness: 0.6,
});

export function Desk({ position, isSelected, isOccluded, onClick }: DeskProps) {
  const [hovered, setHovered] = useState(false);

  const cushionColor = isOccluded
    ? '#E53E3E'
    : '#38A169';

  const cushionMaterial = new THREE.MeshStandardMaterial({
    color: cushionColor,
    roughness: 0.8,
    metalness: 0.05,
    emissive: isSelected
      ? new THREE.Color(cushionColor).multiplyScalar(0.3)
      : new THREE.Color('#000000'),
  });

  const legW = 0.03;
  const deskTopY = DESK_HEIGHT;
  const [x, , z] = position;

  return (
    <group
      position={position}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'default';
      }}
    >
      {/* Desk top */}
      <mesh position={[0, deskTopY, 0]} material={woodMaterial} castShadow>
        <boxGeometry args={[DESK_WIDTH, 0.03, DESK_DEPTH]} />
      </mesh>
      {/* Desk legs */}
      {[
        [-DESK_WIDTH / 2 + legW, deskTopY / 2, -DESK_DEPTH / 2 + legW],
        [DESK_WIDTH / 2 - legW, deskTopY / 2, -DESK_DEPTH / 2 + legW],
        [-DESK_WIDTH / 2 + legW, deskTopY / 2, DESK_DEPTH / 2 - legW],
        [DESK_WIDTH / 2 - legW, deskTopY / 2, DESK_DEPTH / 2 - legW],
      ].map((pos, i) => (
        <mesh
          key={`dl-${i}`}
          position={pos as [number, number, number]}
          material={metalMaterial}
        >
          <boxGeometry args={[legW, deskTopY, legW]} />
        </mesh>
      ))}

      {/* Chair seat */}
      <mesh
        position={[0, CHAIR_SEAT_HEIGHT, DESK_DEPTH / 2 + CHAIR_DEPTH / 2 + 0.05]}
        material={cushionMaterial}
      >
        <boxGeometry args={[CHAIR_WIDTH, 0.04, CHAIR_DEPTH]} />
      </mesh>
      {/* Chair legs */}
      {[
        [-CHAIR_WIDTH / 2 + legW, CHAIR_SEAT_HEIGHT / 2, DESK_DEPTH / 2 + 0.05],
        [CHAIR_WIDTH / 2 - legW, CHAIR_SEAT_HEIGHT / 2, DESK_DEPTH / 2 + 0.05],
        [-CHAIR_WIDTH / 2 + legW, CHAIR_SEAT_HEIGHT / 2, DESK_DEPTH / 2 + CHAIR_DEPTH + 0.05],
        [CHAIR_WIDTH / 2 - legW, CHAIR_SEAT_HEIGHT / 2, DESK_DEPTH / 2 + CHAIR_DEPTH + 0.05],
      ].map((pos, i) => (
        <mesh
          key={`cl-${i}`}
          position={[
            (pos as number[])[0],
            (pos as number[])[1],
            (pos as number[])[2],
          ]}
          material={metalMaterial}
        >
          <boxGeometry args={[legW, CHAIR_SEAT_HEIGHT, legW]} />
        </mesh>
      ))}
      {/* Chair back */}
      <mesh
        position={[
          0,
          CHAIR_SEAT_HEIGHT + CHAIR_BACK_HEIGHT / 2,
          DESK_DEPTH / 2 + CHAIR_DEPTH + 0.05,
        ]}
        material={woodMaterial}
      >
        <boxGeometry args={[CHAIR_WIDTH, CHAIR_BACK_HEIGHT, 0.03]} />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, CHAIR_DEPTH / 2 + DESK_DEPTH / 2 + 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial color="#F5A623" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Hover glow */}
      {hovered && !isSelected && (
        <mesh position={[0, 0.02, CHAIR_DEPTH / 2 + DESK_DEPTH / 2 + 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.55, 32]} />
          <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
