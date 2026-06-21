import { create } from 'zustand';
import {
  ClassroomConfig,
  SeatData,
  SightlineResult,
  FullAnalysisStats,
  DEFAULT_CONFIG,
  VisibilityLevel,
  ExportSummary,
} from '@/types/classroom';
import { computeLayout } from '@/utils/layout';
import { computeSightline } from '@/utils/sightline';

interface ClassroomState {
  config: ClassroomConfig;
  selectedSeat: number | null;
  seatData: SeatData[];
  sightlineResult: SightlineResult | null;
  fullAnalysisStats: FullAnalysisStats | null;

  setConfig: (partial: Partial<ClassroomConfig>) => void;
  selectSeat: (index: number | null) => void;
  toggleFullAnalysis: (enabled: boolean) => void;
  runFullAnalysis: () => void;
  exportSummary: () => void;
}

export { type SightlineResult, type FullAnalysisStats, type ExportSummary } from '@/types/classroom';

function getVisibilityLevel(
  visibilityPercent: number): VisibilityLevel {
  if (visibilityPercent >= 95) return 'compliant';
  if (visibilityPercent >= 80) return 'marginal';
  return 'nonCompliant';
}

function computeFullStats(
  seats: SeatData[],
  threshold: number
): FullAnalysisStats {
  const totalSeats = seats.length;
  let compliantCount = 0;
  let marginalCount = 0;
  let nonCompliantCount = 0;
  let belowThresholdCount = 0;
  let minVisibility = 100;
  let minVisibilitySeat: { row: number; col: number } | null = null;

  seats.forEach((seat) => {
    const level = seat.visibilityLevel || getVisibilityLevel(seat.visibilityPercent);
    if (level === 'compliant') compliantCount++;
    else if (level === 'marginal') marginalCount++;
    else nonCompliantCount++;

    if (seat.visibilityPercent < threshold) belowThresholdCount++;

    if (seat.visibilityPercent < minVisibility) {
      minVisibility = seat.visibilityPercent;
      minVisibilitySeat = { row: seat.row, col: seat.col };
    }
  });

  const pct = (count: number) =>
    totalSeats > 0 ? Math.round((count / totalSeats) * 100) : 0;

  return {
    totalSeats,
    compliantCount,
    compliantPercent: pct(compliantCount),
    marginalCount,
    marginalPercent: pct(marginalCount),
    nonCompliantCount,
    nonCompliantPercent: pct(nonCompliantCount),
    belowThresholdCount,
    belowThresholdPercent: pct(belowThresholdCount),
    minVisibility: totalSeats > 0 ? minVisibility : 0,
    minVisibilitySeat,
  };
}

export const useClassroomStore = create<ClassroomState>((set, get) => {
  const initialSeats = computeLayout(DEFAULT_CONFIG);
  return {
    config: DEFAULT_CONFIG,
    selectedSeat: null,
    seatData: initialSeats,
    sightlineResult: null,
    fullAnalysisStats: null,

    setConfig: (partial) => {
      const prevConfig = get().config;
      const newConfig = { ...prevConfig, ...partial };
      const keys = Object.keys(partial);
      const onlyThreshold =
        keys.length === 1 && keys[0] === 'complianceThreshold';

      const layoutChanged =
        keys.some((k) =>
          ['rows', 'cols', 'rowSpacing', 'colSpacing', 'layoutPreset', 'podiumHeight', 'blackboardWidth'].includes(k)
        );
      const fullToggled =
        keys.includes('fullAnalysisEnabled');

      if (onlyThreshold && prevConfig.fullAnalysisEnabled) {
        const stats = computeFullStats(get().seatData, newConfig.complianceThreshold);
        set({ config: newConfig, fullAnalysisStats: stats });
        return;
      }

      const newSeats = layoutChanged || fullToggled
        ? computeLayout(newConfig)
        : [...get().seatData];
      let selectedSeat = get().selectedSeat;
      const fullEnabled = newConfig.fullAnalysisEnabled;

      if (selectedSeat !== null && selectedSeat >= newSeats.length) {
        selectedSeat = null;
      }

      let result: SightlineResult | null = null;
      let stats: FullAnalysisStats | null = null;

      if (fullEnabled) {
        if (layoutChanged || fullToggled || !get().fullAnalysisStats) {
          for (let i = 0; i < newSeats.length; i++) {
            const r = computeSightline(i, newSeats, newConfig);
            newSeats[i] = {
              ...newSeats[i],
              isOccluded: r.isOccluded,
              visibilityPercent: r.visibilityPercent,
              visibilityLevel: getVisibilityLevel(r.visibilityPercent),
            };
          }
        }
        stats = computeFullStats(newSeats, newConfig.complianceThreshold);
        if (selectedSeat !== null && selectedSeat < newSeats.length) {
          result = computeSightline(selectedSeat, newSeats, newConfig);
        }
      } else {
        if (selectedSeat !== null && selectedSeat < newSeats.length) {
          result = computeSightline(selectedSeat, newSeats, newConfig);
          newSeats[selectedSeat] = {
            ...newSeats[selectedSeat],
            isOccluded: result.isOccluded,
            visibilityPercent: result.visibilityPercent,
          };
        }
      }

      set({
        config: newConfig,
        seatData: newSeats,
        selectedSeat,
        sightlineResult: result,
        fullAnalysisStats: stats,
      });
    },

    selectSeat: (index) => {
      const config = get().config;

      if (index === null) {
        const seats = [...get().seatData];
        if (!config.fullAnalysisEnabled) {
          seats.forEach((s, i) => {
            seats[i] = { ...s, isOccluded: false, visibilityPercent: 100, visibilityLevel: undefined };
          });
        }
        set({ selectedSeat: null, sightlineResult: null, seatData: seats });
        return;
      }

      const seats = [...get().seatData];
      const result = computeSightline(index, seats, config);
      seats[index] = {
        ...seats[index],
        isOccluded: result.isOccluded,
        visibilityPercent: result.visibilityPercent,
        visibilityLevel: config.fullAnalysisEnabled
          ? getVisibilityLevel(result.visibilityPercent)
          : undefined,
      };
      set({ selectedSeat: index, seatData: seats, sightlineResult: result });
    },

    toggleFullAnalysis: (enabled) => {
      const config = get().config;
      if (enabled === config.fullAnalysisEnabled) return;

      const newConfig = { ...config, fullAnalysisEnabled: enabled };
      const seats = [...get().seatData];
      let stats: FullAnalysisStats | null = null;

      if (enabled) {
        for (let i = 0; i < seats.length; i++) {
          const r = computeSightline(i, seats, newConfig);
          seats[i] = {
            ...seats[i],
            isOccluded: r.isOccluded,
            visibilityPercent: r.visibilityPercent,
            visibilityLevel: getVisibilityLevel(r.visibilityPercent),
          };
        }
        stats = computeFullStats(seats, newConfig.complianceThreshold);
      } else {
        seats.forEach((s, i) => {
          seats[i] = { ...s, isOccluded: false, visibilityPercent: 100, visibilityLevel: undefined };
        });
      }

      const selectedSeat = get().selectedSeat;
      let result: SightlineResult | null = null;
      if (selectedSeat !== null && selectedSeat < seats.length) {
        result = computeSightline(selectedSeat, seats, newConfig);
        if (!enabled) {
          seats[selectedSeat] = {
            ...seats[selectedSeat],
            isOccluded: result.isOccluded,
            visibilityPercent: result.visibilityPercent,
          };
        }
      }

      set({
        config: newConfig,
        seatData: seats,
        fullAnalysisStats: stats,
        sightlineResult: result,
      });
    },

    runFullAnalysis: () => {
      const config = get().config;
      const seats = computeLayout(config);
      for (let i = 0; i < seats.length; i++) {
        const r = computeSightline(i, seats, config);
        seats[i] = {
          ...seats[i],
          isOccluded: r.isOccluded,
          visibilityPercent: r.visibilityPercent,
          visibilityLevel: getVisibilityLevel(r.visibilityPercent),
        };
      }
      const stats = computeFullStats(seats, config.complianceThreshold);
      set({ seatData: seats, fullAnalysisStats: stats });
    },

    exportSummary: () => {
      const config = get().config;
      const stats = get().fullAnalysisStats;
      const seats = get().seatData;

      if (!stats) return;

      const belowThresholdSeats = seats
        .filter((s) => s.visibilityPercent < config.complianceThreshold)
        .map((s) => ({
          row: s.row + 1,
          col: s.col + 1,
          visibilityPercent: s.visibilityPercent,
        }));

      const summary: ExportSummary = {
        config: { ...config },
        stats: { ...stats },
        belowThresholdSeats,
        timestamp: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(summary, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `classroom-evaluation-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
  };
});
