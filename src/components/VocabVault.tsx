import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Bookmark,
  Check,
  Loader2,
  PenLine,
  Search,
  Wand2,
} from 'lucide-react';
import { PILLARS, PILLAR_MAP, VOCABULARY_LIBRARY } from '../data/curriculum';
import { PillarId, SuggestVocabResponse, VocabCategory, VocabItem } from '../types';
import { aiSuggestVocab, getStoredApiKey } from '../services/geminiService';
import { soundEffects } from '../services/soundEffects';

interface VocabVaultProps {
  savedVocabIds: string[];
  customVocab: VocabItem[];
  onToggleSaveVocab: (id: string, customItem?: VocabItem) => void;
  onPracticeWord: (pillar: PillarId, starterSentence: string) => void;
}

const CATEGORIES: ('Tất cả' | VocabCategory)[] = [
  'Tất cả',
  'Từ láy',
  'Màu sắc & Ánh sáng',
  'Âm thanh & Hình dáng',
  'So sánh',
  'Nhân hóa',
];

export function VocabVault({
  savedVocabIds,
  customVocab,
  onToggleSaveVocab,
  onPracticeWord,
}: VocabVaultProps) {
  const [selectedPillar, setSelectedPillar] = useState<'all' | PillarId>('all');
  const [selectedCategory, setSelectedCategory] = useState<'Tất cả' | VocabCategory>('Tất cả');
  const [query, setQuery] = useState('');

  // AI Topic Vocabulary Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiPillar, setAiPillar] = useState<PillarId>('scenery');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<SuggestVocabResponse | null>(null);

  const allVocab = useMemo(() => {
    const ids = new Set(VOCABULARY_LIBRARY.map((v) => v.id));
    const uniqueCustom = customVocab.filter((c) => !ids.has(c.id));
    return [...uniqueCustom, ...VOCABULARY_LIBRARY];
  }, [customVocab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allVocab.filter((item) => {
      if (selectedPillar !== 'all' && item.pillar !== selectedPillar) return false;
      if (selectedCategory !== 'Tất cả' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.word.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
      );
    });
  }, [allVocab, selectedPillar, selectedCategory, query]);

  const handleAiSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = aiTopic.trim();
    if (trimmed.length < 2) {
      setAiError('Bạn nhỏ hãy gõ một chủ đề ngắn (ví dụ: cơn mưa rào, cây bàng, con mèo mướp) nhé!');
      return;
    }

    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setAiError('MISSING_API_KEY: Bạn nhỏ hãy nhập API Key Gemini trên Header trước khi tìm từ gợi ý nhé!');
      return;
    }

    setAiLoading(true);
    setAiError(null);
    try {
      const res = await aiSuggestVocab({
        topic: trimmed,
        pillar: aiPillar,
      });
      setAiResult(res.data);
      soundEffects.playCorrect();
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : 'Có lỗi nhỏ khi kết nối, Bạn nhỏ thử lại nhé!'
      );
      soundEffects.playWrong();
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="py-8 sm:py-10 space-y-10 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#0F766E]">
          Kho Từ Vựng Biểu Cảm Lớp 5 · {allVocab.length} từ mẫu tuyển chọn
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1E293B]">
          Kho tàng từ láy, hình ảnh & biện pháp tu từ
        </h1>
        <p className="text-[15px] text-[#526277] max-w-2xl">
          Mỗi từ hay Bạn nhỏ lưu vào Sổ tay sẽ giúp bài văn thêm mềm mại, sống động và giàu cảm xúc hơn.
        </p>
      </div>

      {/* AI Topic Suggester Strip */}
      <section className="rounded-3xl bg-[#EBFAF2] border border-[#C7EAD8] p-6 space-y-5">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#1E293B]">
            Cần từ hay cho đề bài riêng của Bạn nhỏ?
          </h2>
          <p className="text-sm text-[#334155] mt-1">
            Nhập tên sự vật, khung cảnh hoặc nhân vật em sắp tả — Trợ lý Ngôn Từ sẽ mở khóa ngay 6 từ đắt giá!
          </p>
        </div>

        <form onSubmit={handleAiSuggest} className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder='Ví dụ: "cơn mưa rào mùa hạ", "cô giáo lớp 5", "cây bàng sân trường"...'
              aria-label="Chủ đề cần tìm từ vựng"
              className="w-full min-h-[48px] rounded-2xl bg-white border border-[#C7EAD8] px-4 text-sm text-[#1E293B] placeholder:text-[#8696A8]"
            />
          </div>
          <div className="md:col-span-3">
            <select
              value={aiPillar}
              onChange={(e) => setAiPillar(e.target.value as PillarId)}
              aria-label="Chọn dạng bài"
              className="w-full min-h-[48px] rounded-2xl bg-white border border-[#C7EAD8] px-4 text-sm font-medium text-[#1E293B]"
            >
              {PILLARS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={aiLoading}
              className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-2xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0B5D56] disabled:opacity-60 cursor-pointer whitespace-nowrap"
            >
              {aiLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tìm từ...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Gợi ý 6 từ hay</span>
                </>
              )}
            </button>
          </div>
        </form>

        {aiError && (
          <div
            role="alert"
            className="rounded-2xl bg-[#FFF0F5] border border-[#F5D0DF] p-3.5 flex items-center gap-2.5 text-sm text-[#9D174D]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{aiError}</span>
          </div>
        )}

        {aiResult && (
          <div className="bg-white rounded-2xl border border-[#C7EAD8] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-[#0F766E]">
                  Bộ từ gợi ý cho chủ đề: {aiResult.topicTitle}
                </h3>
                <p className="text-xs text-[#526277] mt-0.5">
                  Bí kíp quan sát: {aiResult.writingTip}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiResult(null)}
                className="text-xs font-semibold text-[#526277] hover:text-[#1E293B] cursor-pointer self-start"
              >
                Thu gọn
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiResult.words.map((w, idx) => {
                const customId = `ai-${aiTopic.trim().toLowerCase()}-${idx}`;
                const isSaved = savedVocabIds.includes(customId);
                const normalizedCategory: VocabCategory =
                  CATEGORIES.includes(w.category as VocabCategory) && w.category !== 'Tất cả'
                    ? (w.category as VocabCategory)
                    : 'Từ láy';

                const customVocabObj: VocabItem = {
                  id: customId,
                  word: w.word,
                  pillar: aiPillar,
                  category: normalizedCategory,
                  meaning: w.meaning,
                  example: w.example,
                  isCustom: true,
                };

                return (
                  <div
                    key={customId}
                    className="rounded-2xl bg-[#FCFDFB] border border-[#E6EFE9] p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1.5">
                      <p className="text-xs text-[#526277]">
                        {w.category} · {PILLAR_MAP[aiPillar].shortTitle}
                      </p>
                      <p className="font-bold text-base text-[#0F766E]">{w.word}</p>
                      <p className="text-sm text-[#334155]">{w.meaning}</p>
                      <p className="text-xs text-[#526277] italic">“{w.example}”</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-[#EFF5F1]">
                      <button
                        type="button"
                        onClick={() => onToggleSaveVocab(customId, customVocabObj)}
                        className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                          isSaved
                            ? 'bg-[#EBFAF2] text-[#0F766E]'
                            : 'bg-white border border-[#DCE5DF] text-[#334155] hover:bg-[#EBFAF2]'
                        }`}
                      >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                        <span>{isSaved ? 'Đã lưu' : 'Lưu từ'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onPracticeWord(aiPillar, w.example)}
                        className="inline-flex items-center gap-1 min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold text-[#0F766E] hover:bg-[#EBFAF2] cursor-pointer"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Luyện câu</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-xs font-medium text-[#9D174D]">{aiResult.encouragement}</p>
          </div>
        )}
      </section>

      {/* Filter Controls */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Pillar filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-[#DCEEE4]">
            <button
              type="button"
              onClick={() => setSelectedPillar('all')}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                selectedPillar === 'all'
                  ? 'bg-[#0F766E] text-white'
                  : 'text-[#526277] hover:text-[#1E293B]'
              }`}
            >
              Tất cả 4 dạng bài
            </button>
            {PILLARS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPillar(p.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                  selectedPillar === p.id
                    ? 'bg-[#0F766E] text-white'
                    : 'text-[#526277] hover:text-[#1E293B]'
                }`}
              >
                {p.shortTitle}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm từ láy, hình ảnh..."
              aria-label="Tìm kiếm trong kho từ vựng"
              className="w-full min-h-[44px] rounded-2xl bg-white border border-[#DCEEE4] pl-10 pr-4 text-sm text-[#1E293B] placeholder:text-[#8696A8]"
            />
          </div>
        </div>

        {/* Literary Category filter */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#FFF0F5] border-[#F5D0DF] text-[#9D174D]'
                    : 'bg-white border-[#E5EDE8] text-[#526277] hover:border-[#C7EAD8]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Vocabulary Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl bg-white border border-[#DCEEE4] p-10 text-center space-y-3">
          <p className="text-base font-bold text-[#1E293B]">
            Chưa thấy từ nào khớp với tìm kiếm của Bạn nhỏ
          </p>
          <p className="text-sm text-[#526277]">
            Sĩ tử nhí có thể xóa bộ lọc hoặc dùng khung “Gợi ý 6 từ hay” phía trên để tạo bộ từ mới nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            const isSaved = savedVocabIds.includes(item.id);
            const pillarName = PILLAR_MAP[item.pillar].shortTitle;
            return (
              <article
                key={item.id}
                className="rounded-3xl bg-white border border-[#E2ECE6] p-6 flex flex-col justify-between gap-4 hover:border-[#0F766E]/45 transition-colors"
              >
                <div className="space-y-2">
                  {/* Zero-pill clean unboxed metadata */}
                  <p className="text-xs font-medium text-[#526277]">
                    {pillarName} · {item.category}
                  </p>
                  <h3 className="text-lg font-bold text-[#0F766E] leading-snug">{item.word}</h3>
                  <p className="text-sm text-[#334155] leading-relaxed">{item.meaning}</p>
                  <p className="text-sm text-[#475569] italic bg-[#FCFDFB] rounded-xl p-3 border border-[#EFF5F1]">
                    “{item.example}”
                  </p>
                </div>

                <div className="pt-2 border-t border-[#EFF5F1] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleSaveVocab(item.id)}
                    className={`inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                      isSaved
                        ? 'bg-[#EBFAF2] text-[#0F766E]'
                        : 'bg-[#F8FAFC] border border-[#DCE5DF] text-[#334155] hover:bg-[#EBFAF2] hover:text-[#0F766E]'
                    }`}
                  >
                    {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? 'Đã lưu' : 'Lưu (+5 XP)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onPracticeWord(
                        item.pillar,
                        `Em thử đặt câu với từ "${item.word}": ${item.example}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#0F766E] hover:bg-[#EBFAF2] cursor-pointer whitespace-nowrap"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Thử đặt câu</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
