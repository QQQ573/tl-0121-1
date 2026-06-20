import { ClassroomConfig, SeatData, AISLE_WIDTH, PODIUM_DEPTH } from '@/types/classroom';

export function computeLayout(config: ClassroomConfig): SeatData[] {
  const { rows, cols, rowSpacing, colSpacing, layoutPreset } = config;
  const seats: SeatData[] = [];

  if (layoutPreset === 'single') {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * colSpacing;
        const z = PODIUM_DEPTH + 0.5 + r * rowSpacing;
        seats.push({
          row: r,
          col: c,
          position: [x, 0, z],
          isOccluded: false,
          visibilityPercent: 100,
        });
      }
    }
  } else if (layoutPreset === 'double') {
    const halfCols = Math.ceil(cols / 2);
    const leftOffset = -AISLE_WIDTH / 2 - (halfCols - 1) * colSpacing / 2;
    const rightOffset = AISLE_WIDTH / 2 + (cols - halfCols - 1) * colSpacing / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let x: number;
        if (c < halfCols) {
          x = leftOffset + c * colSpacing;
        } else {
          x = rightOffset + (c - halfCols) * colSpacing;
        }
        const z = PODIUM_DEPTH + 0.5 + r * rowSpacing;
        seats.push({
          row: r,
          col: c,
          position: [x, 0, z],
          isOccluded: false,
          visibilityPercent: 100,
        });
      }
    }
  } else {
    for (let r = 0; r < rows; r++) {
      const offset = r % 2 === 1 ? colSpacing / 2 : 0;
      for (let c = 0; c < cols; c++) {
        const x = (c - (cols - 1) / 2) * colSpacing + offset;
        const z = PODIUM_DEPTH + 0.5 + r * rowSpacing;
        seats.push({
          row: r,
          col: c,
          position: [x, 0, z],
          isOccluded: false,
          visibilityPercent: 100,
        });
      }
    }
  }

  return seats;
}
