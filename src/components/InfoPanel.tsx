import { useClassroomStore } from '@/store/useClassroomStore';

export function InfoPanel() {
  const { sightlineResult, selectedSeat, seatData } = useClassroomStore();

  if (selectedSeat === null || !sightlineResult) return null;

  const seat = seatData[selectedSeat];
  const percent = sightlineResult.visibilityPercent;
  const isOccluded = sightlineResult.isOccluded;

  const barColor = isOccluded ? '#E53E3E' : '#38A169';

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#0D1B2A]/90 backdrop-blur-md border border-[#1B3A4B] rounded-xl px-6 py-4 min-w-[320px] animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-[#778DA9] text-xs">座位</span>
          <span className="text-[#E0E1DD] text-sm font-semibold ml-2">
            第{seat.row + 1}行 第{seat.col + 1}列
          </span>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            backgroundColor: isOccluded ? 'rgba(229,62,62,0.2)' : 'rgba(56,161,105,0.2)',
            color: barColor,
          }}
        >
          {isOccluded ? '存在遮挡' : '视线清晰'}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[#778DA9]">可视黑板比例</span>
          <span
            className="font-bold"
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              color: barColor,
            }}
          >
            {percent}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#1B3A4B] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percent}%`,
              backgroundColor: barColor,
            }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-[#415A77]">
        <span>采样射线: {sightlineResult.totalSamples}</span>
        <span>遮挡射线: {sightlineResult.blockedSamples}</span>
      </div>
    </div>
  );
}
