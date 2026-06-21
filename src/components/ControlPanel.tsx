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
  const {
    config,
    setConfig,
    selectedSeat,
    selectSeat,
    seatData,
    fullAnalysisStats,
    toggleFullAnalysis,
    exportSummary,
  } = useClassroomStore();

  const fullEnabled = config.fullAnalysisEnabled;

  const handleToggle = () => {
    toggleFullAnalysis(!fullEnabled);
  };

  const handleThresholdChange = (value: number) => {
    setConfig({ complianceThreshold: value });
  };

  return (
    <div className="w-72 bg-[#0D1B2A] text-[#E0E1DD] flex flex-col h-full overflow-y-auto border-r border-[#1B3A4B]">
      <div className="p-4 border-b border-[#1B3A4B]">
        <h1 className="text-lg font-bold tracking-wide" style={{ fontFamily: '"Noto Sans SC", sans-serif' }}>
          考场 3D 视线预览
        </h1>
        <p className="text-xs text-[#778DA9] mt-1">标准化考场改造辅助工具</p>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* 全场分析开关 */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-[#F5A623] uppercase tracking-wider">
            全场分析
          </h2>
          <button
            onClick={handleToggle}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              fullEnabled
                ? 'bg-[#F5A623] text-[#0D1B2A] shadow-lg shadow-[#F5A623]/30'
                : 'bg-[#1B3A4B] text-[#778DA9] hover:bg-[#2A4F5E] hover:text-[#E0E1DD]'
            }`}
          >
            {fullEnabled ? '◉ 全场热力图已开启' : '◯ 一键全场分析'}
          </button>
          {fullEnabled && (
            <p className="text-[10px] text-[#415A77]">
              所有座位按可视比例分档显示颜色
            </p>
          )}
        </div>

        {/* 合规阈值 */}
        {fullEnabled && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#F5A623] uppercase tracking-wider">
              合规阈值
            </h2>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-[#778DA9]">可视比例阈值</label>
                <input
                  type="number"
                  value={config.complianceThreshold}
                  min={80}
                  max={100}
                  step={1}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v >= 80 && v <= 100) {
                      handleThresholdChange(v);
                    }
                  }}
                  className="w-16 bg-[#1B3A4B] text-[#E0E1DD] text-xs px-2 py-1 rounded text-right border border-[#2A4F5E] focus:border-[#F5A623] focus:outline-none"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                />
              </div>
              <input
                type="range"
                min={80}
                max={100}
                step={1}
                value={config.complianceThreshold}
                onChange={(e) => handleThresholdChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-[#1B3A4B] accent-[#F5A623] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#415A77]">
                <span>80%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        )}

        {/* 排布预设 */}
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

        {/* 考场参数 */}
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

        {/* 汇总卡片 - 全场分析时显示 */}
        {fullEnabled && fullAnalysisStats && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-[#F5A623] uppercase tracking-wider">
              考务合规报告
            </h2>
            <div className="bg-[#1B3A4B] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#778DA9]">座位总数</span>
                <span
                  className="text-sm font-bold"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  {fullAnalysisStats.totalSeats}
                </span>
              </div>

              <div className="h-px bg-[#2A4F5E] my-1" />

              {/* 三档统计 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#38A169]" />
                    <span className="text-xs text-[#E0E1DD]">合规 (≥95%)</span>
                  </div>
                  <span className="text-xs" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {fullAnalysisStats.compliantCount} 席 ({fullAnalysisStats.compliantPercent}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <span className="text-xs text-[#E0E1DD]">边缘 (80%–95%)</span>
                  </div>
                  <span className="text-xs" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {fullAnalysisStats.marginalCount} 席 ({fullAnalysisStats.marginalPercent}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E53E3E]" />
                    <span className="text-xs text-[#E0E1DD]">不合格 (&lt;80%)</span>
                  </div>
                  <span className="text-xs" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                    {fullAnalysisStats.nonCompliantCount} 席 ({fullAnalysisStats.nonCompliantPercent}%)
                  </span>
                </div>
              </div>

              <div className="h-px bg-[#2A4F5E] my-1" />

              {/* 阈值统计 */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#778DA9]">
                    低于阈值 ({config.complianceThreshold}%)
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      fullAnalysisStats.belowThresholdCount > 0
                        ? 'text-[#E53E3E]'
                        : 'text-[#38A169]'
                    }`}
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    {fullAnalysisStats.belowThresholdCount} 席
                  </span>
                </div>

                {fullAnalysisStats.minVisibilitySeat && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#778DA9]">全场最低可视</span>
                    <span
                      className="text-xs font-bold text-[#E53E3E]"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {fullAnalysisStats.minVisibility}% · 第
                      {fullAnalysisStats.minVisibilitySeat.row + 1}行第
                      {fullAnalysisStats.minVisibilitySeat.col + 1}列
                    </span>
                  </div>
                )}
              </div>

              {/* 三色条 */}
              <div className="flex h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-[#38A169]"
                  style={{ width: `${fullAnalysisStats.compliantPercent}%` }}
                />
                <div
                  className="bg-[#F59E0B]"
                  style={{ width: `${fullAnalysisStats.marginalPercent}%` }}
                />
                <div
                  className="bg-[#E53E3E]"
                  style={{ width: `${fullAnalysisStats.nonCompliantPercent}%` }}
                />
              </div>
            </div>

            {/* 导出按钮 */}
            <button
              onClick={exportSummary}
              className="w-full py-2 rounded-lg bg-[#1B3A4B] text-[#F5A623] text-xs font-medium hover:bg-[#2A4F5E] transition-colors border border-[#2A4F5E]"
            >
              ↓ 导出评估摘要 JSON
            </button>
          </div>
        )}

        {/* 统计 - 单座模式 */}
        {!fullEnabled && (
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
                  {selectedSeat !== null
                    ? `第${seatData[selectedSeat]?.row + 1}行 第${seatData[selectedSeat]?.col + 1}列`
                    : '—'}
                </span>
              </div>
            </div>
          </div>
        )}
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
          {fullEnabled
            ? '全场热力图模式 · 点击座位查看详细视线'
            : '点击座位查看视线分析 · 拖拽旋转 · 滚轮缩放'}
        </p>
      </div>
    </div>
  );
}
