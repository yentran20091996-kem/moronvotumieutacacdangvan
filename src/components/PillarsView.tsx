import { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Check,
  Compass,
  Feather,
  Gamepad2,
  PenLine,
} from 'lucide-react';
import {
  HERO_IMAGE,
  PILLARS,
  VOCABULARY_LIBRARY,
  getStudentRank,
} from '../data/curriculum';
import { NavTab, PillarId, StorytellingStyle, StudentState, VocabItem } from '../types';
import { SafeImage } from './SafeImage';
import { exportPillarWorksheetDocx } from '../services/exportDocx';

interface PillarsViewProps {
  student: StudentState;
  onStartUpgrade: (
    pillar: PillarId,
    starterSentence?: string,
    storytellingStyle?: StorytellingStyle
  ) => void;
  onNavigate: (tab: NavTab) => void;
  onToggleSaveVocab: (id: string, item?: VocabItem) => void;
}

const SURFACE_MAP = {
  mint: 'bg-[#EBFAF2] border-[#C7EAD8]',
  rose: 'bg-[#FFF0F5] border-[#F5D0DF]',
  lemon: 'bg-[#FFFACD] border-[#EDE29A]',
};

export function PillarsView({
  student,
  onStartUpgrade,
  onNavigate,
  onToggleSaveVocab,
}: PillarsViewProps) {
  const [selectedPillarId, setSelectedPillarId] = useState<PillarId>('storytelling');
  const [storyStyle, setStoryStyle] = useState<StorytellingStyle>('add_details');
  const activePillar = PILLARS.find((p) => p.id === selectedPillarId) ?? PILLARS[0];
  const activeStoryMode =
    activePillar.id === 'storytelling' && activePillar.storytellingModes
      ? activePillar.storytellingModes[storyStyle]
      : null;
  const activeOutline = activeStoryMode ? activeStoryMode.outline : activePillar.outline;
  const activePrompts = activeStoryMode
    ? activeStoryMode.practicePrompts
    : activePillar.practicePrompts;
  const activeStarterSentence = activeStoryMode
    ? activeStoryMode.sampleSimpleSentence
    : activePillar.sampleSimpleSentence;
  const rank = getStudentRank(student.stats.xp);

  const pillarVocab = VOCABULARY_LIBRARY.filter((v) => v.pillar === activePillar.id).slice(0, 4);

  return (
    <div className="space-y-14 pb-16">
      {/* Hero Section: Two-column balanced split with storybook illustration */}
      <section className="pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-[#0F766E] mb-3">
              Chào {student.nickname} · Cấp {rank.levelNumber}: {rank.title}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.16] tracking-tight text-[#1E293B] mb-5">
              Biến từng câu văn nhỏ thành bức tranh rực rỡ sắc màu
            </h1>
            <p className="text-base sm:text-[17px] leading-[1.68] text-[#526277] max-w-[58ch] mb-7">
              Trợ lý Ngôn Từ luôn ở đây cùng Bạn nhỏ rèn luyện 4 dạng bài Tập làm văn lớp 5, tích lũy
              từ láy biểu cảm và làm chủ phép So sánh, Nhân hóa mỗi ngày.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onStartUpgrade('plants', 'Hoa hồng rất đẹp.')}
                className="inline-flex items-center gap-2.5 min-h-[50px] px-7 py-3 rounded-2xl bg-[#0F766E] text-white text-base font-semibold cursor-pointer hover:bg-[#0B5D56] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <PenLine className="w-5 h-5 shrink-0" />
                <span>Nâng cấp câu văn ngay</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('games')}
                className="inline-flex items-center gap-2.5 min-h-[50px] px-6 py-3 rounded-2xl bg-[#FFF0F5] border border-[#F5D0DF] text-[#9D174D] text-base font-semibold cursor-pointer hover:bg-[#FDE4EE] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Gamepad2 className="w-5 h-5 shrink-0" />
                <span>Chơi giải cứu tính từ</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] rounded-3xl overflow-hidden border border-[#DCEEE4] bg-[#EBFAF2]">
              <SafeImage
                src={HERO_IMAGE}
                alt="Bàn học sinh lớp 5 với quyển vở mở sẵn, bút máy và cành hoa phượng đỏ ngoài cửa sổ"
                fallbackTitle="Hành Trình Ngôn Từ Lớp 5"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-column Student Progress Strip below the hero split */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-[#EBFAF2] border border-[#C7EAD8] p-5">
            <p className="text-xs font-medium text-[#0F766E] mb-1">Điểm kinh nghiệm</p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-[#1E293B]">
              {student.stats.xp} XP
            </p>
            <p className="text-xs text-[#526277] mt-1">
              {rank.xpToNext > 0
                ? `Còn ${rank.xpToNext} XP lên ${rank.nextTitle}`
                : 'Đã đạt danh hiệu cao nhất'}
            </p>
          </div>

          <div className="rounded-2xl bg-[#FFF0F5] border border-[#F5D0DF] p-5">
            <p className="text-xs font-medium text-[#9D174D] mb-1">Từ hay đã sưu tầm</p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-[#1E293B]">
              {student.savedVocabIds.length} từ
            </p>
            <p className="text-xs text-[#526277] mt-1">Trong Sổ tay cá nhân</p>
          </div>

          <div className="rounded-2xl bg-[#FFFACD] border border-[#EDE29A] p-5">
            <p className="text-xs font-medium text-[#92400E] mb-1">Câu văn đã nâng cấp</p>
            <p className="font-mono tabular-nums text-2xl font-semibold text-[#1E293B]">
              {student.savedSentenceIds.length} câu
            </p>
            <p className="text-xs text-[#526277] mt-1">Sẵn sàng áp dụng vào bài</p>
          </div>

          <div className="rounded-2xl bg-white border border-[#DCEEE4] p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#0F766E] mb-1">Kho lưu trữ cá nhân</p>
              <p className="text-sm font-semibold text-[#1E293B]">Mở Sổ tay & Huy hiệu</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('notebook')}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:underline cursor-pointer self-start"
            >
              <BookOpen className="w-4 h-4" />
              <span>Xem Sổ tay</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Pillars Showcase */}
      <section aria-labelledby="pillars-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2
              id="pillars-heading"
              className="font-display text-2xl sm:text-3xl font-bold text-[#1E293B]"
            >
              4 Trụ cột Tập làm văn lớp 5
            </h2>
            <p className="text-[15px] text-[#526277] mt-1.5">
              Chọn một dạng bài bên dưới để xem bí kíp quan sát, dàn ý 3 phần và kho từ mẫu nhé Bạn nhỏ!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PILLARS.map((pillar) => {
            const isSelected = pillar.id === activePillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`group text-left rounded-3xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col bg-white ${
                  isSelected
                    ? 'border-[#0F766E] ring-2 ring-[#0F766E]/20 -translate-y-0.5'
                    : 'border-[#E2ECE6] hover:border-[#0F766E]/50 hover:-translate-y-0.5'
                }`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#EBFAF2]">
                  <SafeImage
                    src={pillar.image}
                    alt={pillar.title}
                    fallbackTitle={pillar.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#526277] mb-1">
                      Trụ cột {pillar.number} · {isSelected ? 'Đang khám phá' : 'Bấm để học'}
                    </p>
                    <h3 className="text-lg font-bold text-[#1E293B] mb-1.5">{pillar.title}</h3>
                    <p className="text-sm text-[#526277] leading-relaxed">{pillar.subtitle}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#EFF5F1] flex items-center justify-between text-sm font-semibold text-[#0F766E]">
                    <span>Xem dàn ý & từ mẫu</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Active Pillar Lesson Studio */}
      <section
        aria-label={`Hướng dẫn chi tiết ${activePillar.title}`}
        className={`rounded-3xl border p-6 sm:p-8 transition-colors ${
          SURFACE_MAP[activePillar.surfaceTint]
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 columns: Pedagogical method + 3-part outline */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-sm font-semibold text-[#0F766E]">
                Trụ cột {activePillar.number} · {activePillar.pedagogicalMethod}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1E293B]">
                  Bí kíp làm chủ bài {activePillar.title}
                </h3>
                <button
                  type="button"
                  onClick={() => exportPillarWorksheetDocx(activePillar.id)}
                  title="Tải về phiếu bài tập dạng Word (.docx) để in ấn làm bài tập"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#0F766E]/30 text-[#0F766E] text-xs font-bold hover:bg-[#0F766E] hover:text-white transition-all cursor-pointer shadow-2xs"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tải phiếu bài tập (.docx)</span>
                </button>
              </div>
              <p className="text-[15px] leading-relaxed text-[#334155] mt-2.5">
                {activeStoryMode ? activeStoryMode.summary : activePillar.methodDetail}
              </p>
            </div>

            {activePillar.storytellingModes && (
              <div className="bg-white/95 rounded-2xl border border-[#F5D0DF] p-5 space-y-3.5">
                <p className="text-sm font-bold text-[#9D174D]">
                  Chọn cách viết Kể chuyện sáng tạo lớp 5:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(['add_details', 'roleplay'] as StorytellingStyle[]).map((styleKey) => {
                    const guide = activePillar.storytellingModes![styleKey];
                    const selected = storyStyle === styleKey;
                    return (
                      <button
                        key={styleKey}
                        type="button"
                        onClick={() => setStoryStyle(styleKey)}
                        className={`text-left rounded-2xl p-4 border cursor-pointer transition-all ${
                          selected
                            ? 'bg-[#FFF0F5] border-[#BE185D] ring-2 ring-[#BE185D]/15'
                            : 'bg-[#FCFDFB] border-[#E8DCE2] hover:border-[#BE185D]/45'
                        }`}
                      >
                        <p className="text-sm font-bold text-[#1E293B]">{guide.label}</p>
                        <p className="text-xs text-[#526277] mt-1 leading-relaxed">
                          {guide.pronounHint}
                        </p>
                      </button>
                    );
                  })}
                </div>
                {activeStoryMode && (
                  <p className="text-xs text-[#334155] bg-[#FFFACD]/50 rounded-xl px-3.5 py-2.5 border border-[#EDE29A]">
                    <strong className="text-[#92400E]">Mẹo nhỏ: </strong>
                    {activeStoryMode.pedagogicalTip}
                  </p>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#1E293B] font-bold text-base">
                <Compass className="w-5 h-5 text-[#0F766E]" />
                <span>
                  {activeStoryMode
                    ? `Dàn ý 3 phần · ${activeStoryMode.shortLabel}`
                    : 'Dàn ý 3 phần chuẩn lớp 5'}
                </span>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-[#334155]">
                <div>
                  <span className="font-bold text-[#0F766E]">1. Mở bài: </span>
                  {activeOutline.opening}
                </div>
                <div>
                  <span className="font-bold text-[#9D174D]">2. Thân bài:</span>
                  <ul className="mt-1.5 space-y-1.5 pl-4 list-disc">
                    {activeOutline.body.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-bold text-[#92400E]">3. Kết bài: </span>
                  {activeOutline.closing}
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-[#1E293B] mb-2.5">
                Đề luyện tập gợi ý cho Sĩ tử nhí:
              </p>
              <div className="space-y-2.5">
                {activePrompts.map((promptText, idx) => (
                  <div
                    key={idx}
                    className="bg-white/90 rounded-2xl border border-black/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <span className="text-sm text-[#1E293B]">{promptText}</span>
                    <button
                      type="button"
                      onClick={() =>
                        onStartUpgrade(
                          activePillar.id,
                          activeStarterSentence,
                          activePillar.id === 'storytelling' ? storyStyle : undefined
                        )
                      }
                      className="inline-flex items-center gap-1.5 min-h-[38px] px-4 py-1.5 rounded-xl bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#0B5D56] cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      <span>Thử viết câu</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 columns: Expressive Vocabulary quick-pick */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-black/5 p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-lg text-[#1E293B] flex items-center gap-2">
                  <Feather className="w-5 h-5 text-[#0F766E]" />
                  <span>Từ đắt giá cho {activePillar.shortTitle}</span>
                </h4>
                <p className="text-xs text-[#526277] mt-0.5">
                  Bấm Lưu để cất vào Sổ tay (+5 XP mỗi từ)
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#EEF2F0]">
              {pillarVocab.map((item) => {
                const isSaved = student.savedVocabIds.includes(item.id);
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-base text-[#0F766E]">{item.word}</p>
                        <p className="text-xs text-[#526277]">{item.category}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleSaveVocab(item.id)}
                        className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 transition-colors ${
                          isSaved
                            ? 'bg-[#EBFAF2] text-[#0F766E]'
                            : 'bg-[#F8FAFC] border border-[#DCE5DF] text-[#334155] hover:bg-[#EBFAF2] hover:text-[#0F766E]'
                        }`}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        <span>{isSaved ? 'Đã lưu' : 'Lưu từ'}</span>
                      </button>
                    </div>
                    <p className="text-sm text-[#334155]">{item.meaning}</p>
                    <p className="text-xs text-[#526277] italic">Ví dụ: “{item.example}”</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  onStartUpgrade(
                    activePillar.id,
                    activeStarterSentence,
                    activePillar.id === 'storytelling' ? storyStyle : undefined
                  )
                }
                className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0B5D56] cursor-pointer whitespace-nowrap"
              >
                <PenLine className="w-4 h-4" />
                <span>Luyện nâng cấp câu</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('vocab')}
                className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 rounded-2xl bg-[#F8FAFC] border border-[#DCE5DF] text-[#1E293B] text-sm font-semibold hover:bg-[#EBFAF2] cursor-pointer whitespace-nowrap"
              >
                <span>Mở cả Kho từ</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
