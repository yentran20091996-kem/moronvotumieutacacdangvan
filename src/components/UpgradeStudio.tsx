import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Key,
  Layers,
  Lightbulb,
  Loader2,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
  Stethoscope,
  Wand2,
  XCircle,
} from 'lucide-react';
import { PILLARS, PILLAR_MAP } from '../data/curriculum';
import {
  CheckWritingResponse,
  PillarId,
  SavedSentence,
  StorytellingStyle,
  UpgradeResponse,
} from '../types';
import {
  aiCheckWriting,
  aiUpgradeSingleStep,
  getStoredApiKey,
  SingleStepUpgradeResult,
} from '../services/geminiService';
import { soundEffects } from '../services/soundEffects';

interface UpgradeStudioProps {
  initialPillar: PillarId;
  initialSentence?: string;
  initialStorytellingStyle?: StorytellingStyle;
  savedSentences: SavedSentence[];
  onRecordUpgradeRun: () => void;
  onRecordCheckRun: () => void;
  onSaveSentence: (entry: {
    original: string;
    upgraded: string;
    pillar: PillarId;
    devices: string[];
  }) => void;
  onOpenSettings?: () => void;
}

type StudioMode = 'upgrade' | 'check' | 'scaffold';

interface StepState {
  step: 1 | 2 | 3;
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  data?: SingleStepUpgradeResult;
  usedModel?: string;
}

const INITIAL_STEPS: StepState[] = [
  { step: 1, name: 'Cấp độ 1: Thêm từ láy & sắc màu sinh động', status: 'idle' },
  { step: 2, name: 'Cấp độ 2: Phép So sánh tự nhiên, giàu sức gợi', status: 'idle' },
  { step: 3, name: 'Cấp độ 3: Phép Nhân hóa & Cảm xúc tinh tế', status: 'idle' },
];

function highlightText(sentence: string, keywords: string[]) {
  if (!keywords || keywords.length === 0) return sentence;
  const escaped = keywords
    .filter((w) => w && w.trim().length > 1)
    .sort((a, b) => b.length - a.length)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  if (escaped.length === 0) return sentence;
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = sentence.split(regex);
  return parts.map((part, i) => {
    const isMatch = keywords.some((k) => k.toLowerCase() === part.toLowerCase());
    if (isMatch) {
      return (
        <mark
          key={i}
          className="bg-[#FFFACD] text-[#1E293B] font-semibold px-1 rounded"
        >
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function UpgradeStudio({
  initialPillar,
  initialSentence,
  initialStorytellingStyle,
  savedSentences,
  onRecordUpgradeRun,
  onRecordCheckRun,
  onSaveSentence,
  onOpenSettings,
}: UpgradeStudioProps) {
  const [mode, setMode] = useState<StudioMode>('upgrade');
  const [pillar, setPillar] = useState<PillarId>(initialPillar);
  const [storytellingStyle, setStorytellingStyle] = useState<StorytellingStyle>(
    initialStorytellingStyle ?? 'add_details'
  );
  const [roleplayCharacter, setRoleplayCharacter] = useState<string>('Chiếc thuyền giấy nhỏ');
  const [sentenceInput, setSentenceInput] = useState<string>(
    initialSentence || PILLAR_MAP[initialPillar].sampleSimpleSentence
  );
  const [checkInput, setCheckInput] = useState<string>(
    PILLAR_MAP[initialPillar].sampleCheckText
  );

  // Trạng thái 3 bước nâng cấp & Thanh tiến trình theo AI_INSTRUCTIONS.md
  const [stepStates, setStepStates] = useState<StepState[]>(INITIAL_STEPS);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isProcessSuccess, setIsProcessSuccess] = useState(false);
  const [originalAnalysis, setOriginalAnalysis] = useState<string | null>(null);

  // Trạng thái Scaffold Writing (Gia sư viết đoạn văn 4 bước)
  const [scaffoldTopic, setScaffoldTopic] = useState('Cây bàng mùa thay lá');
  const [scaffoldOpening, setScaffoldOpening] = useState('Mỗi khi mùa đông về, cây bàng ở góc sân trường em lại bắt đầu thay áo mới.');
  const [scaffoldBody, setScaffoldBody] = useState('Những chiếc lá bàng chuyển sang màu đỏ ối như những chiếc tai voi khổng lồ. Gió thổi vi vu, lá rụng xào xạc trên mặt đất.');
  const [scaffoldClosing, setScaffoldClosing] = useState('Em rất yêu cây bàng vì nó đã chứng kiến bao kỷ niệm tuổi học trò thân thương.');
  const [scaffoldResult, setScaffoldResult] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeModelAttempt, setActiveModelAttempt] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStoppedByError, setIsStoppedByError] = useState(false);
  const [checkResult, setCheckResult] = useState<CheckWritingResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setPillar(initialPillar);
    if (initialStorytellingStyle) {
      setStorytellingStyle(initialStorytellingStyle);
    }
    if (initialSentence) {
      setMode('upgrade');
      setSentenceInput(initialSentence);
    }
  }, [initialPillar, initialSentence, initialStorytellingStyle]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  /**
   * Cơ chế nâng cấp 3 bước tuần tự (Step 1, 2, 3) theo đúng AI_INSTRUCTIONS.md:
   * - Nếu một bước gặp lỗi API, tự động retry với model tiếp theo trong fallback.
   * - Giữ nguyên kết quả của các bước trước đó, chỉ retry bước đang lỗi.
   * - Nếu tất cả model đều thất bại -> Hiện thông báo lỗi màu đỏ nguyên văn API (VD: 429 RESOURCE_EXHAUSTED).
   * - Trạng thái các cột đang chờ chuyển thành "Đã dừng do lỗi", tuyệt đối không hiện "Hoàn tất" hoặc checkmark xanh.
   * - Progress bar chỉ hiển thị xanh khi bước đó thực sự thành công.
   */
  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = sentenceInput.trim();
    if (trimmed.length < 3) {
      setErrorMsg('Bạn nhỏ hãy nhập một câu văn ngắn trước khi bấm nâng cấp nhé!');
      return;
    }

    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setErrorMsg('MISSING_API_KEY: Chưa thiết lập khóa Gemini API. Bạn nhỏ vui lòng bấm "Lấy API key để sử dụng app" trên Header để cấu hình nhé!');
      setIsStoppedByError(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setIsStoppedByError(false);
    setIsProcessSuccess(false);
    setActiveModelAttempt(null);
    setProgressPercent(10);

    // Đặt lại các bước về trạng thái chuẩn bị chạy
    setStepStates([
      { step: 1, name: 'Cấp độ 1: Thêm từ láy & sắc màu sinh động', status: 'idle' },
      { step: 2, name: 'Cấp độ 2: Phép So sánh tự nhiên, giàu sức gợi', status: 'idle' },
      { step: 3, name: 'Cấp độ 3: Phép Nhân hóa & Cảm xúc tinh tế', status: 'idle' },
    ]);
    setOriginalAnalysis(`Câu văn gốc của Bạn nhỏ diễn đạt rõ ý mộc mạc, nhưng câu chữ còn đơn sơ. Trợ lý Ngôn Từ đang tiến hành 3 cấp độ nâng cấp giàu sắc thái biểu cảm...`);

    const stepsToRun: (1 | 2 | 3)[] = [1, 2, 3];

    for (let i = 0; i < stepsToRun.length; i++) {
      const currentStep = stepsToRun[i];

      // Đánh dấu bước hiện tại đang chạy (running)
      setStepStates((prev) =>
        prev.map((s) => (s.step === currentStep ? { ...s, status: 'running' } : s))
      );
      setProgressPercent(i === 0 ? 25 : i === 1 ? 55 : 85);

      try {
        const stepRes = await aiUpgradeSingleStep({
          sentence: trimmed,
          pillar,
          step: currentStep,
          storytellingStyle: pillar === 'storytelling' ? storytellingStyle : undefined,
          roleplayCharacter:
            pillar === 'storytelling' && storytellingStyle === 'roleplay'
              ? roleplayCharacter
              : undefined,
          onModelAttempt: (modelName, attempt, total) => {
            setActiveModelAttempt(
              `Bước ${currentStep}/3: Đang thử model ${attempt}/${total}: ${modelName}`
            );
          },
        });

        // Bước hiện tại thành công: Lưu kết quả và cập nhật trạng thái success
        setStepStates((prev) =>
          prev.map((s) =>
            s.step === currentStep
              ? {
                  ...s,
                  status: 'success',
                  data: stepRes.data,
                  usedModel: stepRes.usedModel,
                }
              : s
          )
        );
        setProgressPercent(i === 0 ? 33 : i === 1 ? 66 : 100);
      } catch (err) {
        // TẤT CẢ MODEL ĐỀU THẤT BẠI TẠI BƯỚC NÀY
        const rawError = err instanceof Error ? err.message : String(err);
        console.error(`Bước ${currentStep} thất bại:`, rawError);

        // Giữ nguyên kết quả các bước trước đó, chuyển bước hiện tại và các bước đang chờ thành "error"
        setStepStates((prev) =>
          prev.map((s) =>
            s.step >= currentStep && s.status !== 'success'
              ? { ...s, status: 'error' }
              : s
          )
        );

        setErrorMsg(rawError);
        setIsStoppedByError(true);
        setIsProcessSuccess(false);
        setLoading(false);
        setActiveModelAttempt(null);
        soundEffects.playWrong();
        return; // Dừng toàn bộ quy trình, không tiếp tục các bước sau
      }
    }

    // CẢ 3 BƯỚC ĐỀU THÀNH CÔNG VẺ VANG
    setLoading(false);
    setActiveModelAttempt(null);
    setProgressPercent(100);
    setIsProcessSuccess(true);
    setIsStoppedByError(false);
    onRecordUpgradeRun();
    soundEffects.playCorrect();
  };

  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = checkInput.trim();
    if (trimmed.length < 5) {
      setErrorMsg('Bạn nhỏ hãy viết ít nhất 1 câu hoàn chỉnh để Trợ lý Ngôn Từ đọc góp ý nhé!');
      return;
    }

    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setErrorMsg('MISSING_API_KEY: Chưa thiết lập khóa Gemini API. Bạn nhỏ vui lòng bấm "Lấy API key để sử dụng app" trên Header để cấu hình nhé!');
      setIsStoppedByError(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setIsStoppedByError(false);
    setActiveModelAttempt(null);

    try {
      const res = await aiCheckWriting({
        text: trimmed,
        pillar,
        storytellingStyle: pillar === 'storytelling' ? storytellingStyle : undefined,
        roleplayCharacter:
          pillar === 'storytelling' && storytellingStyle === 'roleplay'
            ? roleplayCharacter
            : undefined,
        onModelAttempt: (modelName, attempt, total) => {
          setActiveModelAttempt(`Đang thử model ${attempt}/${total}: ${modelName}`);
        },
      });

      setCheckResult(res.data);
      onRecordCheckRun();
      soundEffects.playCorrect();
    } catch (err) {
      const rawError = err instanceof Error ? err.message : String(err);
      setErrorMsg(rawError);
      setIsStoppedByError(true);
      soundEffects.playWrong();
    } finally {
      setLoading(false);
      setActiveModelAttempt(null);
    }
  };

  const handleScaffoldAssemble = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawParagraph = `${scaffoldOpening.trim()} ${scaffoldBody.trim()} ${scaffoldClosing.trim()}`;
    if (rawParagraph.length < 10) {
      setErrorMsg('Bạn nhỏ hãy viết đủ cả 3 phần Mở - Thân - Kết nhé!');
      return;
    }

    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setErrorMsg('MISSING_API_KEY: Vui lòng thiết lập API key trên Header trước khi ghép đoạn văn.');
      setIsStoppedByError(true);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setIsStoppedByError(false);

    try {
      const res = await aiCheckWriting({
        text: rawParagraph,
        pillar,
        onModelAttempt: (modelName, attempt, total) => {
          setActiveModelAttempt(`Gia sư AI đang trau chuốt (${attempt}/${total}): ${modelName}`);
        },
      });

      setScaffoldResult(res.data.correctedText);
      setCheckResult(res.data);
      onRecordCheckRun();
      soundEffects.playCorrect();
    } catch (err) {
      const rawError = err instanceof Error ? err.message : String(err);
      setErrorMsg(rawError);
      setIsStoppedByError(true);
      soundEffects.playWrong();
    } finally {
      setLoading(false);
      setActiveModelAttempt(null);
    }
  };

  const currentPillarInfo = PILLAR_MAP[pillar];
  const activeStoryGuide =
    pillar === 'storytelling' && currentPillarInfo.storytellingModes
      ? currentPillarInfo.storytellingModes[storytellingStyle]
      : null;
  const activeSampleSimple = activeStoryGuide
    ? activeStoryGuide.sampleSimpleSentence
    : currentPillarInfo.sampleSimpleSentence;
  const activeSampleCheck = activeStoryGuide
    ? activeStoryGuide.sampleCheckText
    : currentPillarInfo.sampleCheckText;

  const hasAnyStepRun = stepStates.some((s) => s.status !== 'idle');

  return (
    <div className="py-8 sm:py-10 space-y-8 pb-16">
      {/* Section Heading & Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-[#0F766E] mb-1">
            Xưởng Luyện Viết cùng Trợ lý Ngôn Từ
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1E293B]">
            {mode === 'upgrade'
              ? 'Nâng cấp câu văn giàu hình ảnh'
              : mode === 'check'
              ? 'Sửa lỗi & giải thích dễ hiểu'
              : 'Gia sư viết đoạn văn 4 bước'}
          </h1>
          <p className="text-[15px] text-[#526277] mt-2 max-w-2xl">
            {mode === 'upgrade'
              ? 'Quy trình 3 bước tự động thử lại khi quá tải: Cấp độ 1 (Từ láy) → Cấp độ 2 (So sánh) → Cấp độ 3 (Nhân hóa).'
              : mode === 'check'
              ? 'Viết thử một đoạn văn ngắn, Trợ lý Ngôn Từ sẽ chỉ rõ từng lỗi, giải thích vì sao sai và gợi ý cách viết mượt mà hơn.'
              : 'Quy trình đồng hành từng bước từ khơi gợi ý tưởng, dàn ý 3 phần đến đoạn văn hoàn chỉnh chuẩn lớp 5.'}
          </p>
        </div>

        {/* Interactive Mode Segmented Control (3 Modes) */}
        <div
          role="tablist"
          aria-label="Chế độ luyện viết"
          className="inline-flex items-center p-1.5 rounded-2xl bg-[#EBFAF2] border border-[#C7EAD8] self-start shrink-0 flex-wrap gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'upgrade'}
            onClick={() => {
              setMode('upgrade');
              setErrorMsg(null);
              setIsStoppedByError(false);
            }}
            className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
              mode === 'upgrade'
                ? 'bg-white text-[#0F766E] shadow-xs'
                : 'text-[#334155] hover:text-[#0F766E]'
            }`}
          >
            <Wand2 className="w-4 h-4 shrink-0" />
            <span>1. Nâng cấp câu (3 cấp độ)</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'check'}
            onClick={() => {
              setMode('check');
              setErrorMsg(null);
              setIsStoppedByError(false);
            }}
            className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
              mode === 'check'
                ? 'bg-white text-[#0F766E] shadow-xs'
                : 'text-[#334155] hover:text-[#0F766E]'
            }`}
          >
            <Stethoscope className="w-4 h-4 shrink-0" />
            <span>2. Bắt bệnh câu chữ</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'scaffold'}
            onClick={() => {
              setMode('scaffold');
              setErrorMsg(null);
              setIsStoppedByError(false);
            }}
            className={`inline-flex items-center gap-2 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
              mode === 'scaffold'
                ? 'bg-white text-[#0F766E] shadow-xs'
                : 'text-[#334155] hover:text-[#0F766E]'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0 text-amber-600" />
            <span>3. Gia sư viết đoạn văn</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Input Zone vs Right Result Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Zone (5 cols): Controls and Input Form */}
        <div className="lg:col-span-5 space-y-6 bg-white rounded-3xl border border-[#DCEEE4] p-6 sm:p-7 shadow-xs">
          {/* Pillar Selector Pills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#526277] uppercase tracking-wider">
              Chọn dạng bài Tập làm văn
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PILLARS.map((p) => {
                const isSelected = pillar === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPillar(p.id);
                      if (mode === 'upgrade') {
                        setSentenceInput(p.sampleSimpleSentence);
                      } else if (mode === 'check') {
                        setCheckInput(p.sampleCheckText);
                      }
                    }}
                    className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F766E] text-white shadow-2xs'
                        : 'bg-[#F8FAFC] border border-[#E2ECE6] text-[#334155] hover:border-[#0F766E]/40'
                    }`}
                  >
                    {p.title}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Theo Từng Chế Độ */}
          {mode === 'upgrade' ? (
            <form onSubmit={handleUpgradeSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="sentence-input" className="text-sm font-bold text-[#1E293B]">
                    Câu văn mộc mạc ban đầu của Bạn nhỏ
                  </label>
                  <button
                    type="button"
                    onClick={() => setSentenceInput(activeSampleSimple)}
                    className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    Lấy câu mẫu
                  </button>
                </div>
                <textarea
                  id="sentence-input"
                  rows={3}
                  value={sentenceInput}
                  onChange={(e) => setSentenceInput(e.target.value)}
                  placeholder="Ví dụ: Hoa hồng nở rất đẹp..."
                  className="w-full rounded-2xl border border-[#C7EAD8] bg-[#FCFDFB] px-4 py-3 text-sm leading-relaxed text-[#1E293B] placeholder:text-[#8696A8] focus:border-[#0F766E] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-[50px] px-6 py-3 rounded-2xl bg-[#0F766E] text-white text-sm font-bold hover:bg-[#0B5D56] disabled:opacity-60 cursor-pointer transition-all shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Trợ lý Ngôn Từ đang xử lý từng bước...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    <span>Nâng cấp 3 bước (+15 XP)</span>
                  </>
                )}
              </button>
            </form>
          ) : mode === 'check' ? (
            <form onSubmit={handleCheckSubmit} className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="check-writing-input" className="text-sm font-bold text-[#1E293B]">
                    Đoạn văn Bạn nhỏ muốn kiểm tra
                  </label>
                  <button
                    type="button"
                    onClick={() => setCheckInput(activeSampleCheck)}
                    className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    Dùng đoạn mẫu
                  </button>
                </div>
                <textarea
                  id="check-writing-input"
                  rows={6}
                  value={checkInput}
                  onChange={(e) => setCheckInput(e.target.value)}
                  placeholder="Viết từ 2 đến 5 câu về chủ đề Bạn nhỏ chọn..."
                  className="w-full rounded-2xl border border-[#C7EAD8] bg-[#FCFDFB] px-4 py-3 text-sm leading-relaxed text-[#1E293B] placeholder:text-[#8696A8] focus:border-[#0F766E] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-[50px] px-6 py-3 rounded-2xl bg-[#0F766E] text-white text-sm font-bold hover:bg-[#0B5D56] disabled:opacity-60 cursor-pointer transition-all shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang đọc và bắt bệnh câu chữ...</span>
                  </>
                ) : (
                  <>
                    <Stethoscope className="w-5 h-5" />
                    <span>Kiểm tra & Bắt bệnh (+20 XP)</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode 3: Scaffolded Writing Companion */
            <form onSubmit={handleScaffoldAssemble} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#526277] mb-1">
                  1. Chủ đề bài viết
                </label>
                <input
                  type="text"
                  value={scaffoldTopic}
                  onChange={(e) => setScaffoldTopic(e.target.value)}
                  className="w-full rounded-xl border border-[#C7EAD8] bg-[#FCFDFB] px-3 py-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F766E] mb-1">
                  2. Mở đoạn (Giới thiệu sự vật, thời gian, ấn tượng đầu)
                </label>
                <textarea
                  rows={2}
                  value={scaffoldOpening}
                  onChange={(e) => setScaffoldOpening(e.target.value)}
                  className="w-full rounded-xl border border-[#C7EAD8] bg-white p-2.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F766E] mb-1">
                  3. Thân đoạn (Tả chi tiết bằng từ láy, so sánh, nhân hóa)
                </label>
                <textarea
                  rows={3}
                  value={scaffoldBody}
                  onChange={(e) => setScaffoldBody(e.target.value)}
                  className="w-full rounded-xl border border-[#C7EAD8] bg-white p-2.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F766E] mb-1">
                  4. Kết đoạn (Tình cảm, kỷ niệm, bài học)
                </label>
                <textarea
                  rows={2}
                  value={scaffoldClosing}
                  onChange={(e) => setScaffoldClosing(e.target.value)}
                  className="w-full rounded-xl border border-[#C7EAD8] bg-white p-2.5 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2.5 min-h-[50px] px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-emerald-700 text-white text-sm font-bold hover:opacity-90 disabled:opacity-60 cursor-pointer transition-all shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gia sư AI đang kết nối & trau chuốt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Ghép đoạn văn & Trau chuốt (+25 XP)</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Model Attempt Status Banner */}
          {activeModelAttempt && (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900 flex items-center gap-2 animate-pulse">
              <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{activeModelAttempt}</span>
            </div>
          )}

          {/* Error Display màu đỏ nguyên văn theo AI_INSTRUCTIONS.md */}
          {errorMsg && (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 border-2 border-red-300 p-4 space-y-2 text-red-900 shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    Thông báo lỗi từ hệ thống / API:
                  </p>
                  <p className="font-mono text-xs text-red-950 font-semibold break-all bg-white/70 p-2 rounded-xl border border-red-200">
                    {errorMsg}
                  </p>
                </div>
              </div>

              {onOpenSettings && (
                <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                  <span className="text-xs text-red-800">Cần đổi hoặc thêm API Key mới?</span>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Mở Cài đặt API Key
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Zone (7 cols): Interactive Results Stage */}
        <div className="lg:col-span-7 space-y-5">
          {mode === 'upgrade' ? (
            hasAnyStepRun ? (
              <div className="space-y-5">
                {/* Progress Bar tuân thủ nghiêm ngặt AI_INSTRUCTIONS.md */}
                <div className="rounded-2xl bg-white border border-[#DCEEE4] p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#0F766E]" />
                      Tiến trình nâng cấp câu văn (3 cấp độ)
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isStoppedByError
                          ? 'text-red-600'
                          : isProcessSuccess
                          ? 'text-emerald-700'
                          : 'text-teal-700'
                      }`}
                    >
                      {isStoppedByError
                        ? 'Đã dừng do lỗi'
                        : isProcessSuccess
                        ? 'Hoàn tất 100%'
                        : `${progressPercent}%`}
                    </span>
                  </div>

                  {/* Thanh Progress bar: Chỉ hiển thị xanh khi thực sự thành công */}
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isStoppedByError
                          ? 'bg-red-500'
                          : isProcessSuccess
                          ? 'bg-emerald-600'
                          : 'bg-teal-500 animate-pulse'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Original Analysis Banner */}
                {originalAnalysis && (
                  <div className="rounded-3xl bg-[#EBFAF2] border border-[#C7EAD8] p-5">
                    <p className="text-xs font-semibold text-[#0F766E] mb-1">
                      Nhận xét từ Trợ lý Ngôn Từ · {currentPillarInfo.title}
                    </p>
                    <p className="text-sm leading-relaxed text-[#1E293B]">
                      {originalAnalysis}
                    </p>
                  </div>
                )}

                {/* 3 Cột / Thẻ Trạng thái tương ứng 3 bước */}
                <div className="space-y-4">
                  {stepStates.map((stepItem, idx) => {
                    const isSaved =
                      stepItem.data &&
                      savedSentences.some(
                        (s) => s.upgraded.trim() === stepItem.data!.sentence.trim()
                      );
                    const copyKey = `step-${idx}`;

                    // Giao diện khi Bước đang chạy (running)
                    if (stepItem.status === 'running') {
                      return (
                        <div
                          key={stepItem.step}
                          className="rounded-3xl border-2 border-dashed border-teal-400 bg-teal-50/50 p-6 space-y-3 animate-pulse"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-teal-800">
                              {stepItem.name}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              Đang xử lý...
                            </span>
                          </div>
                          <p className="text-xs text-teal-700">
                            Trợ lý Ngôn Từ đang tính toán từ láy và hình ảnh phù hợp học sinh lớp 5...
                          </p>
                        </div>
                      );
                    }

                    // Giao diện khi Bước BỊ LỖI (ĐÃ DỪNG DO LỖI theo AI_INSTRUCTIONS.md)
                    if (stepItem.status === 'error') {
                      return (
                        <div
                          key={stepItem.step}
                          className="rounded-3xl border-2 border-red-300 bg-red-50/60 p-6 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-red-900">
                              {stepItem.name}
                            </span>
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold shadow-xs">
                              <XCircle className="w-3.5 h-3.5" />
                              Đã dừng do lỗi
                            </span>
                          </div>
                          <p className="text-xs text-red-700 leading-relaxed">
                            Bước xử lý này đã bị gián đoạn do lỗi kết nối hoặc cạn kiệt hạn ngạch API. Tuyệt đối không hoàn tất cho đến khi được thử lại.
                          </p>
                        </div>
                      );
                    }

                    // Giao diện khi Bước CHƯA CHẠY (idle)
                    if (stepItem.status === 'idle') {
                      return (
                        <div
                          key={stepItem.step}
                          className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5 space-y-2 opacity-70"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-600">
                              {stepItem.name}
                            </span>
                            <span className="text-xs font-medium text-slate-400">
                              Đang chờ...
                            </span>
                          </div>
                        </div>
                      );
                    }

                    // Giao diện khi Bước THÀNH CÔNG (success) -> Hiện checkmark xanh Hoàn tất
                    const data = stepItem.data!;
                    return (
                      <article
                        key={stepItem.step}
                        className="rounded-3xl border-2 border-emerald-300 bg-white p-6 space-y-3.5 shadow-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            {data.level || stepItem.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              Hoàn tất
                            </span>
                            {stepItem.usedModel && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {stepItem.usedModel}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-lg sm:text-[19px] leading-[1.65] text-[#1E293B] font-medium">
                          “{highlightText(data.sentence, data.highlightWords)}”
                        </p>

                        <p className="text-sm text-[#475569] leading-relaxed">
                          <span className="font-semibold text-[#1E293B]">Vì sao hay hơn: </span>
                          {data.explanation}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() =>
                              onSaveSentence({
                                original: sentenceInput.trim(),
                                upgraded: data.sentence,
                                pillar,
                                devices: data.devices,
                              })
                            }
                            className={`inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                              isSaved
                                ? 'bg-[#EBFAF2] text-[#0F766E]'
                                : 'bg-[#0F766E] text-white hover:bg-[#0B5D56]'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{isSaved ? 'Đã cất vào Sổ tay' : 'Lưu câu văn hay (+5 XP)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(data.sentence, copyKey)}
                            className="inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white border border-[#DCEEE4] text-[#334155] text-xs font-semibold hover:bg-[#F8FAFC] cursor-pointer"
                          >
                            {copiedId === copyKey ? (
                              <Check className="w-3.5 h-3.5 text-[#0F766E]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === copyKey ? 'Đã sao chép' : 'Sao chép'}</span>
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-[#DCEEE4] p-8 text-center space-y-3">
                <Wand2 className="w-10 h-10 text-[#0F766E] mx-auto opacity-60" />
                <h3 className="font-bold text-lg text-[#1E293B]">
                  Xưởng Nâng Cấp đang chờ câu văn của Bạn nhỏ
                </h3>
                <p className="text-sm text-[#526277] max-w-md mx-auto">
                  Hãy nhập một câu đơn giản ở bên trái, Trợ lý Ngôn Từ sẽ nâng cấp theo 3 cấp độ (Từ láy → So sánh → Nhân hóa) có cơ chế dự phòng tự động chuyển model nếu lỗi!
                </p>
              </div>
            )
          ) : mode === 'check' ? (
            checkResult ? (
              <div className="space-y-5">
                {/* Praise first */}
                <div className="rounded-3xl bg-[#EBFAF2] border border-[#C7EAD8] p-6 space-y-1.5">
                  <p className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Điểm sáng đáng khen của Bạn nhỏ</span>
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#1E293B]">{checkResult.praise}</p>
                </div>

                {/* Polished Text */}
                <div className="rounded-3xl bg-[#FFFACD]/50 border border-[#EDE29A] p-6 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-bold text-base text-[#78350F]">
                      Đoạn văn sau khi làm mượt
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopy(checkResult.correctedText, 'polished')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78350F] hover:underline cursor-pointer"
                    >
                      {copiedId === 'polished' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{copiedId === 'polished' ? 'Đã chép' : 'Chép đoạn văn'}</span>
                    </button>
                  </div>
                  <p className="text-base leading-[1.75] text-[#1E293B]">
                    {checkResult.correctedText}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onSaveSentence({
                          original: checkInput.trim(),
                          upgraded: checkResult.correctedText,
                          pillar,
                          devices: ['Đoạn văn đã sửa mượt', checkResult.literaryBoost.device],
                        })
                      }
                      className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-[#0F766E] text-white text-xs font-semibold hover:bg-[#0B5D56] cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Lưu đoạn văn vào Sổ tay (+10 XP)</span>
                    </button>
                  </div>
                </div>

                {/* Issues & Why Wrong */}
                <div className="rounded-3xl bg-white border border-[#DCEEE4] p-6 space-y-4">
                  <h3 className="font-bold text-lg text-[#1E293B]">
                    Những chỗ cần chỉnh & Giải thích “Tại sao sai?”
                  </h3>
                  {checkResult.issues.length === 0 ? (
                    <p className="text-sm text-[#0F766E] bg-[#EBFAF2] rounded-2xl p-4">
                      Tuyệt vời quá! Đoạn văn của Bạn nhỏ không mắc lỗi chính tả hay ngữ pháp nào cả!
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {checkResult.issues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-[#FCFDFB] border border-[#E7EFEA] p-4 space-y-2.5"
                        >
                          <p className="text-xs font-semibold text-[#9D174D]">
                            Điểm {idx + 1} · {issue.category}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl bg-[#FFF0F5] px-3.5 py-2.5 text-[#9D174D]">
                              <span className="block text-xs font-semibold opacity-80 mb-0.5">
                                Chưa ổn:
                              </span>
                              <span className="line-through">{issue.wrongSnippet}</span>
                            </div>
                            <div className="rounded-xl bg-[#EBFAF2] px-3.5 py-2.5 text-[#0F766E]">
                              <span className="block text-xs font-semibold opacity-80 mb-0.5">
                                Nên sửa thành:
                              </span>
                              <span className="font-semibold">{issue.fixedSnippet}</span>
                            </div>
                          </div>
                          <p className="text-sm text-[#334155] leading-relaxed">
                            <span className="font-semibold text-[#1E293B]">Tại sao cần sửa: </span>
                            {issue.whyWrong}
                          </p>
                          <p className="text-xs text-[#526277]">
                            <span className="font-semibold text-[#92400E]">Mẹo nhớ nhanh: </span>
                            {issue.tip}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white border border-[#DCEEE4] p-8 text-center space-y-3">
                <Stethoscope className="w-10 h-10 text-[#0F766E] mx-auto opacity-60" />
                <h3 className="font-bold text-lg text-[#1E293B]">
                  Bác sĩ Câu Chữ sẵn sàng đọc bài cùng Bạn nhỏ
                </h3>
                <p className="text-sm text-[#526277] max-w-md mx-auto">
                  Hãy dán hoặc viết một đoạn văn ngắn ở bên trái để Trợ lý Ngôn Từ tìm điểm sáng và giải thích tỉ mỉ từng chỗ cần sửa nhé!
                </p>
              </div>
            )
          ) : (
            /* Mode 3 Display: Scaffolded Writing Outcome */
            <div className="space-y-5">
              {scaffoldResult ? (
                <div className="rounded-3xl bg-white border border-[#C7EAD8] p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                      Đoạn văn hoàn chỉnh được trau chuốt
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(scaffoldResult, 'scaffold')}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E]"
                    >
                      {copiedId === 'scaffold' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedId === 'scaffold' ? 'Đã chép' : 'Sao chép đoạn văn'}</span>
                    </button>
                  </div>
                  <div className="rounded-2xl bg-[#EBFAF2]/60 p-5 border border-[#C7EAD8]">
                    <p className="text-base sm:text-lg leading-[1.8] text-[#1E293B]">
                      {scaffoldResult}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSaveSentence({
                          original: `${scaffoldOpening} ${scaffoldBody} ${scaffoldClosing}`,
                          upgraded: scaffoldResult,
                          pillar,
                          devices: ['Đoạn văn 4 bước hoàn chỉnh'],
                        })
                      }
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#0F766E] text-white text-xs sm:text-sm font-semibold hover:bg-[#0B5D56]"
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Cất đoạn văn này vào Sổ tay (+15 XP)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl bg-white border border-[#DCEEE4] p-8 text-center space-y-3">
                  <Layers className="w-10 h-10 text-amber-600 mx-auto opacity-60" />
                  <h3 className="font-bold text-lg text-[#1E293B]">
                    Quy trình Gia sư viết đoạn văn 4 bước
                  </h3>
                  <p className="text-sm text-[#526277] max-w-md mx-auto">
                    Viết từng câu cho Mở đoạn, Thân đoạn và Kết đoạn ở cột bên trái. Bấm "Ghép đoạn văn & Trau chuốt", Trợ lý Ngôn Từ sẽ liên kết mạch lạc và bổ sung sắc màu tu từ cho bài viết của Bạn nhỏ!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
