import { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Check,
  Copy,
  Download,
  Edit3,
  FileText,
  Lock,
  PenLine,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  BADGES,
  PILLARS,
  PILLAR_MAP,
  VOCABULARY_LIBRARY,
  getStudentRank,
} from '../data/curriculum';
import { PillarId, StudentState } from '../types';
import { LiteracyRadarChart } from './LiteracyRadarChart';
import { exportStudentNotebookDocx } from '../services/exportDocx';

interface NotebookViewProps {
  student: StudentState;
  onSetNickname: (name: string) => void;
  onRemoveSentence: (id: string) => void;
  onToggleSaveVocab: (id: string) => void;
  onStartUpgrade: (pillar: PillarId, starterSentence?: string) => void;
}

export function NotebookView({
  student,
  onSetNickname,
  onRemoveSentence,
  onToggleSaveVocab,
  onStartUpgrade,
}: NotebookViewProps) {
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(student.nickname);
  const [sentenceFilter, setSentenceFilter] = useState<'all' | PillarId>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportingDoc, setExportingDoc] = useState(false);

  const rank = getStudentRank(student.stats.xp);

  const savedVocabItems = useMemo(() => {
    const map = new Map([...VOCABULARY_LIBRARY, ...student.customVocab].map((v) => [v.id, v]));
    return student.savedVocabIds
      .map((id) => map.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [student.savedVocabIds, student.customVocab]);

  const filteredSentences = useMemo(() => {
    if (sentenceFilter === 'all') return student.savedSentenceIds;
    return student.savedSentenceIds.filter((s) => s.pillar === sentenceFilter);
  }, [student.savedSentenceIds, sentenceFilter]);

  const unlockedCount = BADGES.filter((b) => b.check(student.stats).unlocked).length;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (draftName.trim()) {
      onSetNickname(draftName.trim());
    }
    setEditingName(false);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1600);
  };

  const handleExportDocx = () => {
    setExportingDoc(true);
    try {
      exportStudentNotebookDocx(student, savedVocabItems);
    } finally {
      setTimeout(() => setExportingDoc(false), 1000);
    }
  };

  return (
    <div className="py-8 sm:py-10 space-y-10 pb-16">
      {/* Student Profile & Rank Banner */}
      <section className="rounded-3xl bg-[#EBFAF2] border border-[#C7EAD8] p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[#0F766E]">
                Sổ tay Ngôn từ cá nhân · Cấp {rank.levelNumber}
              </p>
              {/* Nút Xuất Sổ tay Word (.doc / .docx) */}
              <button
                type="button"
                onClick={handleExportDocx}
                disabled={exportingDoc}
                title="Tải về file Word (.docx) để in ấn hoặc nộp cho thầy cô"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white border border-[#0F766E]/30 text-[#0F766E] text-xs font-bold shadow-xs hover:bg-[#0F766E] hover:text-white transition-all cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>{exportingDoc ? 'Đang xuất file...' : 'Xuất Sổ tay (.docx)'}</span>
                <Download className="w-3 h-3" />
              </button>
            </div>

            {editingName ? (
              <form onSubmit={handleSaveName} className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  maxLength={32}
                  aria-label="Tên hiển thị của Bạn nhỏ"
                  className="min-h-[44px] rounded-2xl bg-white border border-[#0F766E] px-4 text-lg font-bold text-[#1E293B]"
                />
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-2xl bg-[#0F766E] text-white text-sm font-semibold cursor-pointer"
                >
                  Lưu tên
                </button>
              </form>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1E293B]">
                  {student.nickname}
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setDraftName(student.nickname);
                    setEditingName(true);
                  }}
                  className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-xl bg-white border border-[#C7EAD8] text-xs font-semibold text-[#0F766E] hover:bg-[#F5FCF8] cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Đổi tên</span>
                </button>
              </div>
            )}
            <p className="text-sm text-[#334155]">
              Danh hiệu hiện tại: <strong className="text-[#0F766E]">{rank.title}</strong> · Đã mở khóa{' '}
              <strong className="font-mono tabular-nums">{unlockedCount}/{BADGES.length}</strong> huy hiệu.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#C7EAD8] p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#1E293B]">Tiến độ thăng hạng</span>
              <span className="font-mono tabular-nums font-bold text-[#0F766E]">
                {student.stats.xp} XP
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#EBFAF2] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0F766E] transition-all duration-300"
                style={{ width: `${rank.progress}%` }}
              />
            </div>
            <p className="text-xs text-[#526277]">
              {rank.xpToNext > 0
                ? `Cố lên! Chỉ cần thêm ${rank.xpToNext} XP nữa để chạm mốc "${rank.nextTitle}".`
                : 'Chúc mừng Sĩ tử nhí đã đạt danh hiệu Đại Sứ Ngôn Từ!'}
            </p>
          </div>
        </div>
      </section>

      {/* Feature from d3-visualization skill: Literacy Radar Chart */}
      <section>
        <LiteracyRadarChart
          stats={student.stats}
          totalSavedSentences={student.savedSentenceIds.length}
          totalSavedVocabs={student.savedVocabIds.length}
        />
      </section>

      {/* Badges & Virtual Rewards */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E293B]">
            Bộ sưu tập Huy hiệu & Quà ảo
          </h2>
          <p className="text-sm text-[#526277] mt-1">
            Hoàn thành nhiệm vụ luyện viết và trò chơi để mở khóa trọn bộ 8 huy hiệu danh giá nhé!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const status = badge.check(student.stats);
            return (
              <div
                key={badge.id}
                className={`rounded-3xl p-5 border flex flex-col justify-between gap-3 ${
                  status.unlocked
                    ? 'bg-[#FFFACD]/60 border-[#EDE29A]'
                    : 'bg-white border-[#E4ECE7]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        status.unlocked
                          ? 'bg-[#F59E0B]/20 text-[#92400E]'
                          : 'bg-[#F1F5F9] text-[#94A3B8]'
                      }`}
                    >
                      {status.unlocked ? (
                        <Award className="w-5 h-5 text-amber-600" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-mono tabular-nums text-xs font-semibold text-[#526277]">
                      {status.current}/{status.target}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#1E293B]">{badge.title}</h3>
                  <p className="text-xs text-[#526277] leading-relaxed">{badge.description}</p>
                </div>
                <p
                  className={`text-xs font-semibold pt-2 border-t ${
                    status.unlocked
                      ? 'border-[#EDE29A] text-[#92400E]'
                      : 'border-[#EFF5F1] text-[#64748B]'
                  }`}
                >
                  {status.unlocked ? `Đã nhận · ${badge.rewardLabel}` : badge.rewardLabel}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Saved Upgraded Sentences */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E293B]">
              Kho Câu văn hay đã nâng cấp ({student.savedSentenceIds.length})
            </h2>
            <p className="text-sm text-[#526277] mt-1">
              Mở ra đọc lại trước mỗi giờ Tập làm văn để bài viết của Bạn nhỏ luôn tràn đầy ý hay!
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSentenceFilter('all')}
              className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                sentenceFilter === 'all'
                  ? 'bg-[#0F766E] text-white'
                  : 'bg-white border border-[#DCEEE4] text-[#526277]'
              }`}
            >
              Tất cả
            </button>
            {PILLARS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSentenceFilter(p.id)}
                className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer ${
                  sentenceFilter === p.id
                    ? 'bg-[#0F766E] text-white'
                    : 'bg-white border border-[#DCEEE4] text-[#526277]'
                }`}
              >
                {p.shortTitle}
              </button>
            ))}
          </div>
        </div>

        {filteredSentences.length === 0 ? (
          <div className="rounded-3xl bg-white border border-[#DCEEE4] p-8 text-center space-y-3">
            <BookOpen className="w-8 h-8 text-[#0F766E] mx-auto opacity-75" />
            <p className="text-base font-bold text-[#1E293B]">
              Chưa có câu văn nào trong mục này
            </p>
            <button
              type="button"
              onClick={() => onStartUpgrade('plants')}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-2xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0B5D56] cursor-pointer"
            >
              <PenLine className="w-4 h-4" />
              <span>Đến Xưởng Nâng cấp ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredSentences.map((item) => (
              <article
                key={item.id}
                className="rounded-3xl bg-white border border-[#DCEEE4] p-6 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2.5">
                  <p className="text-xs font-medium text-[#526277]">
                    {PILLAR_MAP[item.pillar].title} · {item.devices.join(' · ')}
                  </p>
                  <p className="text-base leading-relaxed font-medium text-[#1E293B]">
                    “{item.upgraded}”
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Ý gốc: {item.original}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#EFF5F1] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(item.upgraded, item.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedId === item.id ? 'Đã chép câu' : 'Chép câu'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveSentence(item.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#94A3B8] hover:text-[#BE185D] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Saved Vocabulary Collection */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1E293B]">
          Từ vựng yêu thích đã lưu ({savedVocabItems.length})
        </h2>

        {savedVocabItems.length === 0 ? (
          <p className="text-sm text-[#526277]">
            Bạn nhỏ hãy ghé Kho từ để lưu những từ láy, phép So sánh và Nhân hóa mình yêu thích nhé!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedVocabItems.map((vocab) => (
              <div
                key={vocab.id}
                className="rounded-2xl bg-[#FFF0F5]/45 border border-[#F5D0DF] p-5 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <p className="text-xs text-[#526277]">
                    {PILLAR_MAP[vocab.pillar].shortTitle} · {vocab.category}
                  </p>
                  <p className="font-bold text-base text-[#9D174D]">{vocab.word}</p>
                  <p className="text-sm text-[#334155]">{vocab.meaning}</p>
                  <p className="text-xs text-[#526277] italic">“{vocab.example}”</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#F5D0DF]/70">
                  <button
                    type="button"
                    onClick={() => onStartUpgrade(vocab.pillar, vocab.example)}
                    className="text-xs font-semibold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    Thử nâng cấp tiếp
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleSaveVocab(vocab.id)}
                    className="text-xs text-[#64748B] hover:text-[#9D174D] cursor-pointer"
                  >
                    Bỏ lưu
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
