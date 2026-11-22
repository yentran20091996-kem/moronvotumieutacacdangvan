import { useMemo, useState } from 'react';
import { Award, Compass, HelpCircle, Sparkles } from 'lucide-react';
import { StudentStats } from '../types';

interface LiteracyRadarChartProps {
  stats: StudentStats;
  totalSavedSentences: number;
  totalSavedVocabs: number;
}

interface DimensionScore {
  key: string;
  label: string;
  score: number; // 0 - 100
  level: string;
  description: string;
  tip: string;
}

export function LiteracyRadarChart({
  stats,
  totalSavedSentences,
  totalSavedVocabs,
}: LiteracyRadarChartProps) {
  const [hoveredDim, setHoveredDim] = useState<DimensionScore | null>(null);

  // Tính toán 5 khía cạnh năng lực (thang điểm 0 - 100)
  const dimensions: DimensionScore[] = useMemo(() => {
    // 1. Vốn từ láy & từ gợi cảm
    const vocabScore = Math.min(
      100,
      Math.round(totalSavedVocabs * 12 + stats.upgradesCount * 8 + 35)
    );

    // 2. Nghệ thuật So sánh
    const comparisonScore = Math.min(
      100,
      Math.round(stats.rescueCorrectCount * 10 + stats.upgradesCount * 6 + 40)
    );

    // 3. Nghệ thuật Nhân hóa
    const personificationScore = Math.min(
      100,
      Math.round(stats.raceCorrectCount * 10 + stats.upgradesCount * 6 + 35)
    );

    // 4. Mạch lạc cốt truyện & Kể chuyện
    const narrativeScore = Math.min(
      100,
      Math.round(stats.storiesCompletedCount * 25 + stats.savedSentencesCount * 6 + 30)
    );

    // 5. Chuẩn xác chính tả & Ngữ pháp
    const accuracyScore = Math.min(
      100,
      Math.round(stats.checksCount * 18 + stats.rescueCorrectCount * 5 + 45)
    );

    const getLevelText = (s: number) => {
      if (s >= 85) return 'Bậc thầy nhí';
      if (s >= 70) return 'Khởi sắc xuất sắc';
      if (s >= 55) return 'Vững vàng tự tin';
      return 'Đang nảy mầm';
    };

    return [
      {
        key: 'vocab',
        label: 'Vốn từ láy & Gợi cảm',
        score: vocabScore,
        level: getLevelText(vocabScore),
        description: 'Khả năng vận dụng từ láy, từ gợi thanh, gợi tả màu sắc, âm thanh sinh động.',
        tip: 'Hãy lưu thêm từ vựng mới trong "Kho từ" để nâng điểm cánh này!',
      },
      {
        key: 'comparison',
        label: 'Phép So sánh',
        score: comparisonScore,
        level: getLevelText(comparisonScore),
        description: 'Kỹ năng liên tưởng tương đồng, tạo hình ảnh so sánh độc đáo và gần gũi.',
        tip: 'Chơi thêm thử thách "Giải cứu Cây bàng" để rèn luyện mắt quan sát.',
      },
      {
        key: 'personification',
        label: 'Phép Nhân hóa',
        score: personificationScore,
        level: getLevelText(personificationScore),
        description: 'Biến đồ vật, loài vật và thiên nhiên trở nên có tâm hồn, ánh mắt, nụ cười.',
        tip: 'Luyện tập nâng cấp câu văn ở Cấp độ 3 trong Xưởng Nâng Cấp nhé.',
      },
      {
        key: 'narrative',
        label: 'Mạch lạc & Cốt truyện',
        score: narrativeScore,
        level: getLevelText(narrativeScore),
        description: 'Khả năng kết nối 3 chặng (Mở đầu - Thắt nút - Mở nút) thành truyện trọn vẹn.',
        tip: 'Chơi tiếp minigame "Xếp gạch Cốt truyện" để nâng cao điểm cốt truyện.',
      },
      {
        key: 'accuracy',
        label: 'Chuẩn xác & Diễn đạt',
        score: accuracyScore,
        level: getLevelText(accuracyScore),
        description: 'Viết đúng chính tả, đủ chủ vị ngữ, dùng dấu câu đúng lúc và lời văn trôi chảy.',
        tip: 'Nhờ Trợ lý Ngôn Từ "Bắt bệnh câu chữ" trước khi nộp bài làm văn.',
      },
    ];
  }, [stats, totalSavedSentences, totalSavedVocabs]);

  // Cấu hình tọa độ Radar Chart SVG (Tâm tại (150, 150), Bán kính max R = 100)
  const size = 300;
  const center = size / 2;
  const radius = 105;
  const angleStep = (Math.PI * 2) / dimensions.length;

  // Tọa độ các đỉnh của đa giác dữ liệu
  const polygonPoints = dimensions
    .map((dim, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (dim.score / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Trung bình điểm năng lực
  const averageScore = Math.round(
    dimensions.reduce((acc, cur) => acc + cur.score, 0) / dimensions.length
  );

  return (
    <div className="rounded-3xl bg-white border border-[#C7EAD8] p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8F3EC] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#0F766E]" />
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#1E293B]">
              Bản Đồ Năng Lực Văn Học (5 Chiều)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#526277] mt-0.5">
            Biểu đồ radar trực quan hóa sự tiến bộ qua các buổi luyện tập
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#EBFAF2] border border-[#C7EAD8] px-3.5 py-1.5 rounded-2xl">
          <Sparkles className="w-4 h-4 text-[#0F766E]" />
          <span className="text-xs font-semibold text-[#0F766E]">
            Chỉ số tổng hòa: <strong className="text-base">{averageScore}</strong>/100
          </span>
        </div>
      </div>

      {/* Grid: Biểu đồ SVG bên trái + Chi tiết 5 kỹ năng bên phải */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radar SVG Visualizer */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-[300px] h-[300px]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full overflow-visible"
              aria-label="Biểu đồ radar năng lực văn học"
            >
              {/* Lưới đa giác đồng tâm (25%, 50%, 75%, 100%) */}
              {[0.25, 0.5, 0.75, 1.0].map((level, lIdx) => {
                const levelPoints = dimensions
                  .map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    const r = radius * level;
                    const x = center + r * Math.cos(angle);
                    const y = center + r * Math.sin(angle);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                  })
                  .join(' ');

                return (
                  <polygon
                    key={lIdx}
                    points={levelPoints}
                    fill={lIdx === 3 ? '#F0FDF4' : 'none'}
                    stroke="#D1FAE5"
                    strokeWidth="1.5"
                    strokeDasharray={lIdx < 3 ? '3 3' : undefined}
                  />
                );
              })}

              {/* Các trục tia từ tâm ra 5 đỉnh */}
              {dimensions.map((dim, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                return (
                  <line
                    key={dim.key}
                    x1={center}
                    y1={center}
                    x2={x}
                    y2={y}
                    stroke="#A7F3D0"
                    strokeWidth="1.5"
                  />
                );
              })}

              {/* Vùng dữ liệu học sinh (Polygon màu xanh ngọc bích sang trọng) */}
              <polygon
                points={polygonPoints}
                fill="rgba(16, 185, 129, 0.35)"
                stroke="#0F766E"
                strokeWidth="2.5"
                className="transition-all duration-500 ease-out"
              />

              {/* Các điểm mốc (Nodes) tương tác */}
              {dimensions.map((dim, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = (dim.score / 100) * radius;
                const x = center + r * Math.cos(angle);
                const y = center + r * Math.sin(angle);
                const isHovered = hoveredDim?.key === dim.key;

                return (
                  <g
                    key={dim.key}
                    onMouseEnter={() => setHoveredDim(dim)}
                    onMouseLeave={() => setHoveredDim(null)}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 8 : 5}
                      fill={isHovered ? '#0F766E' : '#10B981'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-all duration-200 shadow-md"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-[11px] text-[#526277] italic mt-2 text-center">
            *Rê chuột lên từng điểm để xem lời khuyên phát triển từ Trợ lý Ngôn Từ
          </p>
        </div>

        {/* Breakdown Card List */}
        <div className="lg:col-span-6 space-y-2.5">
          {dimensions.map((dim) => {
            const isHovered = hoveredDim?.key === dim.key;
            return (
              <div
                key={dim.key}
                onMouseEnter={() => setHoveredDim(dim)}
                onMouseLeave={() => setHoveredDim(null)}
                className={`p-3 rounded-2xl border transition-all ${
                  isHovered
                    ? 'border-[#0F766E] bg-[#EBFAF2] shadow-xs'
                    : 'border-[#E4EFE8] bg-[#FBFDFB] hover:border-[#C7EAD8]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E293B]">
                      {dim.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-[#C7EAD8] text-[#0F766E]">
                      {dim.level}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#0F766E]">
                    {dim.score}/100
                  </span>
                </div>

                {/* Progress bar con */}
                <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-gradient-to-r from-[#10B981] to-[#0F766E] h-full rounded-full transition-all duration-500"
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                {isHovered && (
                  <p className="text-[11px] text-[#065F46] mt-2 font-medium bg-white/80 p-2 rounded-xl border border-[#A7F3D0]">
                    💡 {dim.tip}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
