import { useClassroomStore } from '@/store/useClassroomStore';
import { ClassroomConfig } from '@/types/classroom';

type ConfigKey = keyof ClassroomConfig;

interface ParamConfig {
  key: ConfigKey;
  label: string;
  min: number;
  max: number;
  step: number;
}

const PARAMS: ParamConfig[] = [
  { key: 'rows', label: '行数', min: 1, max: 15, step: 1 },
  { key: 'cols', label: '列数', min: 1, max: 20, step: 1 },
  { key: 'rowSpacing', label: '行间距(m)', min: 0.5, max: 2.0, step: 0.05 },
  { key: 'colSpacing', label: '列间距(m)', min: 0.4, max: 1.5, step: 0.05 },
  { key: 'podiumHeight', label: '讲台高度(m)', min: 0, max: 0.5, step: 0.01 },
  { key: 'blackboardWidth', label: '黑板宽度(m)', min: 1, max: 8, step: 0.1 },
];

const PRESETS: { value: ClassroomConfig['layoutPreset']; label: string; desc: string }[] = [
  { value: 'single', label: '单列', desc: '所有座位均匀单列排布' },
  { value: 'double', label: '双列', desc: '左右两组，中间留过道' },
  { value: 'plum', label: '梅花', desc: '隔行错位，增加侧向视野' },
];

export function ControlPanel() {
  const { config, setConfig, selectedSeat, selectSeat, seatData } = useClassroomStore();

  return (
    <div className="w-72 bg-[#0D1B2A] text-[#E0E1DD] flex flex-col h-full overflow-y-auto border-r border-[#1B3A4B]">
      <div className="p-4 border-b border-[#1B3A4B]">
        <h1 className="text-lg font-bold tracking-wide" style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>
          考场 3D 视线预览
        </h1>
        <p className="text-xs text-[#778DA9] mt-1">标准化考场改造辅助工具</p>
      </div>

      <div className="p-4 space-y-3 flex-1">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F5A623] uppercase tracking-wider">排布预设</h2>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setConfig({ layoutPreset: p.value })}
                className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  config.layoutPreset === p.value
                    ? 'bg-[#F5A623] text-[#0D1B2A] shadow-lg shadow-[#F5A623]/30'
                    : 'bg-[#1B3A4B] text-[#778DA9] hover:bg-[#2A4F5E]'
                }`}
                title={p.desc}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F5A623] uppercase tracking-wider">考场参数</h2>
          {PARAMS.map((param) => {
            const value = config[param.key] as number;
            return (
              <div key={param.key} className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-[#778DA9]">{param.label}</label>
                  <input
                    type="number"
                    value={value}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      if (!isNaN(v) && v >= param.min && v <= param.max) {
                        setConfig({ [param.key]: v });
                      }
                    }}
                    className="w-16 bg-[#1B3A4B] text-[#E0E1DD] text-xs px-2 py-1 rounded text-right border border-[#2A4F5E] focus:border-[#F5A623] focus:outline-none"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  />
                </div>
                <input
                  type="range"
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  value={value}
                  onChange={(e) => setConfig({ [param.key]: parseFloat(e.target.value) })}
                  className="w-full h-1.5 rounded-full appearance-none bg-[#1B3A4B] accent-[#F5A623] cursor-pointer"
                />
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F5A623] uppercase tracking-wider">统计</h2>
          <div className="bg-[#1B3A4B] rounded-lg p-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#778DA9]">座位总数</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>{seatData.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#778DA9]">当前选中</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                {selectedSeat !== null ? `第${seatData[selectedSeat]?.row + 1}行 第${seatData[selectedSeat]?.col + 1}列` : '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedSeat !== null && (
        <div className="p-4 border-t border-[#1B3A4B]">
          <button
            onClick={() => selectSeat(null)}
            className="w-full py-2 rounded-lg bg-[#1B3A4B] text-[#778DA9] text-xs font-medium hover:bg-[#2A4F5E] transition-colors"
          >
            取消选中
          </button>
        </div>
      )}

      <div className="p-3 border-t border-[#1B3A4B]">
        <p className="text-[10px] text-[#415A77] text-center">
          点击座位查看视线分析 · 拖拽旋转 · 滚轮缩放
        </p>
      </div>
    </div>
  );
}
