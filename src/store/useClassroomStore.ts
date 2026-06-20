import { create } from 'zustand';
import {
  ClassroomConfig,
  SeatData,
  SightlineResult,
  DEFAULT_CONFIG,
} from '@/types/classroom';
import { computeLayout } from '@/utils/layout';
import { computeSightline } from '@/utils/sightline';

interface ClassroomState {
  config: ClassroomConfig;
  selectedSeat: number | null;
  seatData: SeatData[];
  sightlineResult: SightlineResult | null;

  setConfig: (partial: Partial<ClassroomConfig>) => void;
  selectSeat: (index: number | null) => void;
}

export { type SightlineResult } from '@/types/classroom';

export const useClassroomStore = create<ClassroomState>((set, get) => {
  const initialSeats = computeLayout(DEFAULT_CONFIG);
  return {
    config: DEFAULT_CONFIG,
    selectedSeat: null,
    seatData: initialSeats,
    sightlineResult: null,

    setConfig: (partial) => {
      const newConfig = { ...get().config, ...partial };
      const newSeats = computeLayout(newConfig);
      const selectedSeat = get().selectedSeat;
      let result: SightlineResult | null = null;
      if (selectedSeat !== null && selectedSeat < newSeats.length) {
        result = computeSightline(selectedSeat, newSeats, newConfig);
        newSeats[selectedSeat] = {
          ...newSeats[selectedSeat],
          isOccluded: result.isOccluded,
          visibilityPercent: result.visibilityPercent,
        };
      }
      set({ config: newConfig, seatData: newSeats, sightlineResult: result });
    },

    selectSeat: (index) => {
      if (index === null) {
        set({ selectedSeat: null, sightlineResult: null });
        const seats = [...get().seatData];
        seats.forEach((s, i) => {
          seats[i] = { ...s, isOccluded: false, visibilityPercent: 100 };
        });
        set({ seatData: seats });
        return;
      }
      const seats = [...get().seatData];
      const config = get().config;
      const result = computeSightline(index, seats, config);
      seats[index] = {
        ...seats[index],
        isOccluded: result.isOccluded,
        visibilityPercent: result.visibilityPercent,
      };
      set({ selectedSeat: index, seatData: seats, sightlineResult: result });
    },
  };
});
