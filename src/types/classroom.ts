export type VisibilityLevel = 'compliant' | 'marginal' | 'nonCompliant';

export interface ClassroomConfig {
  rows: number;
  cols: number;
  rowSpacing: number;
  colSpacing: number;
  podiumHeight: number;
  blackboardWidth: number;
  layoutPreset: 'single' | 'double' | 'plum';
  complianceThreshold: number;
  fullAnalysisEnabled: boolean;
}

export interface SeatData {
  row: number;
  col: number;
  position: [number, number, number];
  isOccluded: boolean;
  visibilityPercent: number;
  visibilityLevel?: VisibilityLevel;
}

export interface SightlineResult {
  seatIndex: number;
  totalSamples: number;
  blockedSamples: number;
  visibilityPercent: number;
  isOccluded: boolean;
  sampleResults: { point: [number, number, number]; blocked: boolean }[];
}

export interface FullAnalysisStats {
  totalSeats: number;
  compliantCount: number;
  compliantPercent: number;
  marginalCount: number;
  marginalPercent: number;
  nonCompliantCount: number;
  nonCompliantPercent: number;
  belowThresholdCount: number;
  belowThresholdPercent: number;
  minVisibility: number;
  minVisibilitySeat: { row: number; col: number } | null;
}

export interface ExportSummary {
  config: ClassroomConfig;
  stats: FullAnalysisStats;
  belowThresholdSeats: { row: number; col: number; visibilityPercent: number }[];
  timestamp: string;
}

export const DEFAULT_CONFIG: ClassroomConfig = {
  rows: 6,
  cols: 8,
  rowSpacing: 0.9,
  colSpacing: 0.8,
  podiumHeight: 0.15,
  blackboardWidth: 4.0,
  layoutPreset: 'double',
  complianceThreshold: 95,
  fullAnalysisEnabled: false,
};

export const VISIBILITY_LEVEL_COLORS: Record<VisibilityLevel, string> = {
  compliant: '#38A169',
  marginal: '#F59E0B',
  nonCompliant: '#E53E3E',
};

export const DESK_WIDTH = 0.6;
export const DESK_DEPTH = 0.4;
export const DESK_HEIGHT = 0.75;
export const CHAIR_WIDTH = 0.45;
export const CHAIR_DEPTH = 0.4;
export const CHAIR_SEAT_HEIGHT = 0.45;
export const CHAIR_BACK_HEIGHT = 0.8;
export const EYE_HEIGHT = 1.2;
export const HEAD_RADIUS = 0.1;
export const BLACKBOARD_HEIGHT = 1.2;
export const BLACKBOARD_BOTTOM_Y = 0.9;
export const PODIUM_DEPTH = 1.2;
export const AISLE_WIDTH = 0.6;
