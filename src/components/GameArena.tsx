import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Compass,
  Cpu,
  Crosshair,
  Flag,
  Gamepad2,
  Key,
  Loader2,
  RotateCcw,
  Shuffle,
  Sparkles,
  Trophy,
  Wand2,
  XCircle,
} from 'lucide-react';
import {
  PILLAR_MAP,
  RACE_GAME_QUESTIONS,
  RESCUE_GAME_QUESTIONS,
  STORY_ADVENTURES,
  STORY_THEME_IDEAS,
} from '../data/curriculum';
import { PillarId, QuizQuestion, StoryAdventure, StorytellingStyle } from '../types';
import { aiGenerateStoryAdventure, getStoredApiKey } from '../services/geminiService';
import { soundEffects } from '../services/soundEffects';

interface GameArenaProps {
  onReward: (
    kind: 'rescue' | 'race' | 'story' | 'hunter',
    xpEarned: number,
    correctDelta: number,
    message: string
  ) => void;
  onSaveStory: (entry: {
    original: string;
    upgraded: string;
    pillar: PillarId;
    devices: string[];
  }) => void;
  onOpenSettings?: () => void;
}

type GameMode = 'rescue' | 'race' | 'hunter' | 'story';

interface RhetoricHunterItem {
  id: string;
  sentence: string;
  correctType: 'sosanh' | 'nhanhoa';
  explanation: string;
  detail: string;
}

const RHETORIC_HUNTER_QUESTIONS: RhetoricHunterItem[] = [
  {
    id: 'h1',
    sentence: 'Mặt trời như quả cầu lửa khổng lồ từ từ nhô lên khỏi rặng tre xanh.',
    correctType: 'sosanh',
    explanation: 'Phép So sánh',
    detail: 'Câu có từ so sánh "như", ví mặt trời đỏ rực với quả cầu lửa ấm áp.',
  },
  {
    id: 'h2',
    sentence: 'Chị gió xuân dịu dàng lướt qua rặng cúc, khẽ khàng đánh thức muôn mầm non.',
    correctType: 'nhanhoa',
    explanation: 'Phép Nhân hóa',
    detail: 'Gọi gió bằng "chị" và tả hành động "dịu dàng đánh thức" ấm áp như con người.',
  },
  {
    id: 'h3',
    sentence: 'Dòng sông quê em uốn lượn như một dải lụa đào mềm mại vắt qua xóm làng.',
    correctType: 'sosanh',
    explanation: 'Phép So sánh',
    detail: 'So sánh dáng hình uốn lượn của dòng sông với "dải lụa đào" qua từ "như".',
  },
  {
    id: 'h4',
    sentence: 'Cây bàng già cỗi trầm ngâm đứng gác góc sân trường qua bao mùa thi rộn rã.',
    correctType: 'nhanhoa',
    explanation: 'Phép Nhân hóa',
    detail: 'Cây bàng được gán cho tâm trạng "trầm ngâm" và tư thế "đứng gác" như bác bảo vệ trung thành.',
  },
  {
    id: 'h5',
    sentence: 'Tiếng suối trong veo ngân nga róc rách như khúc nhạc ngọt ngào của rừng già.',
    correctType: 'sosanh',
    explanation: 'Phép So sánh',
    detail: 'So sánh âm thanh tiếng suối với "khúc nhạc ngọt ngào" qua từ "như".',
  },
  {
    id: 'h6',
    sentence: 'Những bông cúc họa mi thẹn thùng hé nở, ngước mắt đón ánh nắng ban mai.',
    correctType: 'nhanhoa',
    explanation: 'Phép Nhân hóa',
    detail: 'Nụ hoa được tả "thẹn thùng" và "ngước mắt" e ấp, tình cảm như một em bé.',
  },
  {
    id: 'h7',
    sentence: 'Mảnh trăng đầu tháng cong cong thanh mảnh như chiếc lưỡi liềm vàng ai bỏ quên.',
    correctType: 'sosanh',
    explanation: 'Phép So sánh',
    detail: 'So sánh vầng trăng khuyết với "chiếc lưỡi liềm vàng" qua từ "như".',
  },
  {
    id: 'h8',
    sentence: 'Những đám mây đen kịt vội vã rủ nhau chạy trốn khi cơn gió lốc ầm ầm kéo tới.',
    correctType: 'nhanhoa',
    explanation: 'Phép Nhân hóa',
    detail: 'Gán cho mây hành động "vội vã rủ nhau chạy trốn" sinh động như con người.',
  },
];

export function GameArena({ onReward, onSaveStory, onOpenSettings }: GameArenaProps) {
  const [activeGame, setActiveGame] = useState<GameMode>('rescue');

  // Quiz state (rescue & race)
  const [questionIdx, setQuestionIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Hunter Game state (Thợ Săn Tu Từ)
  const [hunterIdx, setHunterIdx] = useState(0);
  const [hunterChoice, setHunterChoice] = useState<'sosanh' | 'nhanhoa' | null>(null);
  const [hunterScore, setHunterScore] = useState(0);
  const [hunterStreak, setHunterStreak] = useState(0);
  const [hunterFinished, setHunterFinished] = useState(false);

  // Dynamic Story Builder state
  const [stories, setStories] = useState<StoryAdventure[]>(STORY_ADVENTURES);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyStepIdx, setStoryStepIdx] = useState(0);
  const [chosenSnippets, setChosenSnippets] = useState<
    { snippet: string; deviceTag: string }[]
  >([]);
  const [storyDone, setStoryDone] = useState(false);
  const [playedStoryIds, setPlayedStoryIds] = useState<string[]>([]);

  // Story Generator controls
  const [storyStyle, setStoryStyle] = useState<StorytellingStyle>('add_details');
  const [storyThemeInput, setStoryThemeInput] = useState('');
  const [storyRoleplayChar, setStoryRoleplayChar] = useState('');
  const [generatingStory, setGeneratingStory] = useState(false);
  const [storyGenError, setStoryGenError] = useState<string | null>(null);
  const [isStoryStoppedByError, setIsStoryStoppedByError] = useState(false);
  const [modelAttemptInfo, setModelAttemptInfo] = useState<string | null>(null);

  const questions: QuizQuestion[] =
    activeGame === 'rescue' ? RESCUE_GAME_QUESTIONS : RACE_GAME_QUESTIONS;
  const currentQ = questions[questionIdx];
  const currentHunterQ = RHETORIC_HUNTER_QUESTIONS[hunterIdx];

  const resetQuiz = () => {
    setQuestionIdx(0);
    setSelectedOptionId(null);
    setScore(0);
    setStreak(0);
    setQuizFinished(false);
  };

  const resetHunter = () => {
    setHunterIdx(0);
    setHunterChoice(null);
    setHunterScore(0);
    setHunterStreak(0);
    setHunterFinished(false);
  };

  const resetStory = (nextStoryIndex = storyIndex) => {
    setStoryIndex(nextStoryIndex);
    setStoryStepIdx(0);
    setChosenSnippets([]);
    setStoryDone(false);
  };

  const handleSelectGame = (mode: GameMode) => {
    setActiveGame(mode);
    resetQuiz();
    resetHunter();
    if (mode !== 'story') {
      setStoryGenError(null);
      setIsStoryStoppedByError(false);
    }
  };

  const handleChooseQuizOption = (optionId: string) => {
    if (selectedOptionId !== null || !currentQ) return;
    setSelectedOptionId(optionId);
    const picked = currentQ.options.find((o) => o.id === optionId);
    if (picked?.isCorrect) {
      const nextStreak = streak + 1;
      setScore((s) => s + 1);
      setStreak(nextStreak);
      const xp = activeGame === 'rescue' ? 10 : 15;

      if (nextStreak >= 2) {
        soundEffects.playStreak();
      } else {
        soundEffects.playCorrect();
      }

      onReward(
        activeGame === 'rescue' ? 'rescue' : 'race',
        xp,
        1,
        nextStreak >= 2
          ? `Chuỗi ${nextStreak} câu đúng liên tiếp! Bạn nhỏ giỏi quá!`
          : 'Chính xác rồi! Vốn từ của Sĩ tử nhí ngày càng sắc bén!'
      );
    } else {
      setStreak(0);
      soundEffects.playWrong();
    }
  };

  const handleNextQuestion = () => {
    if (questionIdx + 1 >= questions.length) {
      setQuizFinished(true);
      soundEffects.playFanfare();
    } else {
      setQuestionIdx((i) => i + 1);
      setSelectedOptionId(null);
    }
  };

  const handleChooseHunter = (choice: 'sosanh' | 'nhanhoa') => {
    if (hunterChoice !== null || !currentHunterQ) return;
    setHunterChoice(choice);
    const isCorrect = choice === currentHunterQ.correctType;
    if (isCorrect) {
      const nextStreak = hunterStreak + 1;
      setHunterScore((s) => s + 1);
      setHunterStreak(nextStreak);

      if (nextStreak >= 2) {
        soundEffects.playStreak();
      } else {
        soundEffects.playCorrect();
      }

      onReward(
        'hunter',
        15,
        1,
        `Chuẩn xác! Đó chính là ${currentHunterQ.explanation}!`
      );
    } else {
      setHunterStreak(0);
      soundEffects.playWrong();
    }
  };

  const handleNextHunter = () => {
    if (hunterIdx + 1 >= RHETORIC_HUNTER_QUESTIONS.length) {
      setHunterFinished(true);
      soundEffects.playFanfare();
    } else {
      setHunterIdx((i) => i + 1);
      setHunterChoice(null);
    }
  };

  const activeStory = stories[storyIndex] ?? stories[0];
  const currentStoryStep = activeStory?.steps[storyStepIdx];

  const handleChooseStoryBranch = (snippet: string, deviceTag: string) => {
    const nextChosen = [...chosenSnippets, { snippet, deviceTag }];
    setChosenSnippets(nextChosen);
    soundEffects.playCorrect();

    if (storyStepIdx + 1 >= activeStory.steps.length) {
      setStoryDone(true);
      soundEffects.playFanfare();
      if (!playedStoryIds.includes(activeStory.id)) {
        setPlayedStoryIds((prev) => [...prev, activeStory.id]);
      }
      onReward(
        'story',
        30,
        1,
        'Hoan hô Tác giả tí hon! Bạn nhỏ vừa hoàn thành một câu chuyện tuyệt hay!'
      );
    } else {
      setStoryStepIdx((i) => i + 1);
    }
  };

  const handleGenerateFreshStory = async (overrideTheme?: string) => {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
      setStoryGenError('MISSING_API_KEY: Bạn nhỏ hãy nhập API Key Gemini trong mục Cài đặt trên Header trước khi sáng tạo truyện mới nhé!');
      setIsStoryStoppedByError(true);
      return;
    }

    setGeneratingStory(true);
    setStoryGenError(null);
    setIsStoryStoppedByError(false);
    setModelAttemptInfo(null);

    try {
      const excludeTitles = stories.map((s) => s.title);
      const res = await aiGenerateStoryAdventure({
        theme: (overrideTheme ?? storyThemeInput).trim(),
        storytellingStyle: storyStyle,
        roleplayCharacter: storyStyle === 'roleplay' ? storyRoleplayChar.trim() : '',
        excludeTitles,
        onModelAttempt: (modelName, attempt, total) => {
          setModelAttemptInfo(`Đang gọi model ${attempt}/${total}: ${modelName}`);
        },
      });

      const created = res.data;
      if (!created.steps || created.steps.length === 0) {
        throw new Error('Nội dung truyện mới chưa đầy đủ, Bạn nhỏ bấm thử lại nhé!');
      }

      const nextList = [...stories, created];
      setStories(nextList);
      resetStory(nextList.length - 1);
      setStoryThemeInput('');
      soundEffects.playFanfare();
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message : String(err);
      setStoryGenError(rawMsg);
      setIsStoryStoppedByError(true);
      soundEffects.playWrong();
    } finally {
      setGeneratingStory(false);
      setModelAttemptInfo(null);
    }
  };

  const handlePickUnplayedOrGenerate = () => {
    const unplayedIdx = stories.findIndex(
      (st, idx) => idx !== storyIndex && !playedStoryIds.includes(st.id)
    );
    if (unplayedIdx !== -1) {
      resetStory(unplayedIdx);
    } else {
      handleGenerateFreshStory('');
    }
  };

  const fullStoryText = chosenSnippets.map((c) => c.snippet).join(' ');

  return (
    <div className="py-8 sm:py-10 space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#0F766E]">
          Học mà chơi · Tích điểm XP & Mở khóa Huy hiệu
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#1E293B]">
          Đấu trường Thử thách Ngôn từ
        </h1>
        <p className="text-[15px] text-[#526277] max-w-2xl">
          Chọn một trong 4 trò chơi tương tác dưới đây để rèn luyện từ láy, phân loại So sánh, Nhân hóa và thỏa sức sáng tạo câu chuyện cùng Trợ lý Ngôn Từ!
        </p>
      </div>

      {/* 4 Game Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => handleSelectGame('rescue')}
          className={`text-left rounded-3xl p-5 border cursor-pointer transition-all ${
            activeGame === 'rescue'
              ? 'bg-[#EBFAF2] border-[#0F766E] ring-2 ring-[#0F766E]/15 shadow-xs'
              : 'bg-white border-[#DCEEE4] hover:border-[#0F766E]/45'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Gamepad2 className="w-6 h-6 text-[#0F766E]" />
            <span className="font-mono text-xs font-semibold text-[#0F766E]">+10 XP</span>
          </div>
          <h2 className="font-bold text-base text-[#1E293B]">Giải cứu Tính từ</h2>
          <p className="text-xs text-[#526277] mt-1 leading-relaxed">
            Chọn từ láy và tính từ chuẩn nhất để giải cứu câu văn khô khan.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleSelectGame('race')}
          className={`text-left rounded-3xl p-5 border cursor-pointer transition-all ${
            activeGame === 'race'
              ? 'bg-[#FFF0F5] border-[#BE185D] ring-2 ring-[#BE185D]/15 shadow-xs'
              : 'bg-white border-[#F5D0DF] hover:border-[#BE185D]/45'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Flag className="w-6 h-6 text-[#BE185D]" />
            <span className="font-mono text-xs font-semibold text-[#BE185D]">+15 XP</span>
          </div>
          <h2 className="font-bold text-base text-[#1E293B]">Cuộc đua Tu từ</h2>
          <p className="text-xs text-[#526277] mt-1 leading-relaxed">
            Tăng tốc về đích bằng cách chọn câu So sánh và Nhân hóa chuẩn nhất.
          </p>
        </button>

        {/* Feature from game-development skill: Thợ Săn Tu Từ */}
        <button
          type="button"
          onClick={() => handleSelectGame('hunter')}
          className={`text-left rounded-3xl p-5 border cursor-pointer transition-all ${
            activeGame === 'hunter'
              ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-amber-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Crosshair className="w-6 h-6 text-amber-700" />
            <span className="font-mono text-xs font-bold text-amber-800">+15 XP / chớp nhoáng</span>
          </div>
          <h2 className="font-bold text-base text-[#1E293B]">Thợ Săn Tu Từ</h2>
          <p className="text-xs text-[#526277] mt-1 leading-relaxed">
            Phản xạ nhanh: Phân biệt câu văn dùng phép So sánh hay Nhân hóa!
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleSelectGame('story')}
          className={`text-left rounded-3xl p-5 border cursor-pointer transition-all ${
            activeGame === 'story'
              ? 'bg-[#FFFACD] border-[#B45309] ring-2 ring-[#B45309]/15 shadow-xs'
              : 'bg-white border-[#EDE29A] hover:border-[#B45309]/45'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <Compass className="w-6 h-6 text-[#92400E]" />
            <span className="font-mono text-xs font-semibold text-[#92400E]">+30 XP</span>
          </div>
          <h2 className="font-bold text-base text-[#1E293B]">Xếp gạch Cốt truyện</h2>
          <p className="text-xs text-[#526277] mt-1 leading-relaxed">
            Ghép các chặng truyện linh hoạt bằng AI, truyện mới không trùng lặp!
          </p>
        </button>
      </div>

      {/* GAME 1 & 2: Rescue & Race Quiz */}
      {activeGame === 'rescue' || activeGame === 'race' ? (
        <section className="rounded-3xl bg-white border border-[#DCEEE4] p-6 sm:p-8 max-w-4xl shadow-xs">
          {quizFinished ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-[#FFFACD] text-[#92400E] flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F766E]">Hoàn thành chặng thử thách!</p>
                <h3 className="font-display text-3xl font-bold text-[#1E293B] mt-1">
                  Bạn nhỏ đạt {score}/{questions.length} câu xuất sắc!
                </h3>
                <p className="text-sm text-[#526277] mt-2 max-w-md mx-auto">
                  {score >= questions.length - 1
                    ? 'Một thành tích đáng tự hào! Trợ lý Ngôn Từ tin rằng bài Tập làm văn sắp tới của Sĩ tử nhí sẽ tỏa sáng rực rỡ!'
                    : 'Cố lên nhé Bạn nhỏ, mỗi lần luyện tập lại giúp kho tàng ngôn từ của em lớn thêm một bậc đấy!'}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetQuiz}
                  className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 rounded-2xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0B5D56] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại vòng này</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectGame(activeGame === 'rescue' ? 'hunter' : 'rescue')}
                  className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 rounded-2xl bg-[#EBFAF2] text-[#0F766E] text-sm font-semibold hover:bg-[#D9F4E6] cursor-pointer"
                >
                  <span>Chuyển trò chơi khác</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress & Streak Bar */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#526277]">
                  Câu {questionIdx + 1}/{questions.length} · {PILLAR_MAP[currentQ.pillar]?.shortTitle}
                </span>
                <div className="flex items-center gap-3">
                  {streak >= 2 && (
                    <span className="px-2.5 py-1 rounded-full bg-[#FFFACD] text-[#92400E] font-mono animate-pulse">
                      🔥 Chuỗi {streak} câu đúng
                    </span>
                  )}
                  <span className="font-mono text-[#0F766E]">Điểm: {score}</span>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg sm:text-xl text-[#1E293B]">
                  {currentQ.prompt}
                </h3>
                <div className="rounded-2xl bg-[#EBFAF2] border border-[#C7EAD8] p-5 text-base sm:text-lg text-[#1E293B] font-medium leading-relaxed">
                  “{currentQ.sentenceWithBlank}”
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const showResult = selectedOptionId !== null;
                  let btnStyle = 'bg-[#FCFDFB] border-[#DCEEE4] hover:border-[#0F766E] text-[#1E293B]';

                  if (showResult) {
                    if (opt.isCorrect) {
                      btnStyle = 'bg-[#EBFAF2] border-[#0F766E] text-[#0F766E] font-bold ring-2 ring-[#0F766E]/20';
                    } else if (isSelected && !opt.isCorrect) {
                      btnStyle = 'bg-[#FFF0F5] border-[#BE185D] text-[#BE185D] line-through';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={showResult}
                      onClick={() => handleChooseQuizOption(opt.id)}
                      className={`text-left p-4 rounded-2xl border transition-all text-sm leading-relaxed cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{opt.text}</span>
                        {showResult && opt.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-[#0F766E] shrink-0" />
                        )}
                        {showResult && isSelected && !opt.isCorrect && (
                          <XCircle className="w-5 h-5 text-[#BE185D] shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next */}
              {selectedOptionId && (
                <div className="space-y-4 pt-2">
                  <div className="rounded-2xl bg-[#FFFACD]/60 border border-[#EDE29A] p-4 text-xs sm:text-sm text-[#78350F] space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#92400E]" />
                      <span>Góc văn học mở rộng:</span>
                    </p>
                    <p className="leading-relaxed">{currentQ.literaryNote}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2 rounded-2xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0B5D56] cursor-pointer"
                  >
                    <span>{questionIdx + 1 >= questions.length ? 'Xem kết quả' : 'Câu tiếp theo'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      ) : activeGame === 'hunter' ? (
        /* GAME 3: Thợ Săn Tu Từ (Rhetoric Hunter) */
        <section className="rounded-3xl bg-white border border-amber-200 p-6 sm:p-8 max-w-4xl shadow-xs space-y-6">
          {hunterFinished ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-700">Hoàn thành thử thách Thợ Săn Tu Từ!</p>
                <h3 className="font-display text-3xl font-bold text-[#1E293B] mt-1">
                  Đoán đúng {hunterScore}/{RHETORIC_HUNTER_QUESTIONS.length} câu!
                </h3>
                <p className="text-sm text-[#526277] mt-2 max-w-md mx-auto">
                  Bạn nhỏ sở hữu đôi mắt quan sát và tư duy văn học cực kỳ nhạy bén!
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetHunter}
                  className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 rounded-2xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại lượt mới</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#526277]">
                  Câu {hunterIdx + 1}/{RHETORIC_HUNTER_QUESTIONS.length} · Thợ Săn Tu Từ
                </span>
                <div className="flex items-center gap-3">
                  {hunterStreak >= 2 && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-mono animate-pulse">
                      ⚡ Chuỗi {hunterStreak} câu chuẩn xác
                    </span>
                  )}
                  <span className="font-mono text-amber-700 font-bold">Điểm: {hunterScore}</span>
                </div>
              </div>

              {/* Sentence Display Card */}
              <div className="rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 p-6 sm:p-8 text-center space-y-2">
                <p className="text-xs uppercase font-bold text-amber-700 tracking-wider">
                  Đố Bạn nhỏ câu văn này dùng phép tu từ nào?
                </p>
                <p className="text-xl sm:text-2xl font-bold leading-relaxed text-[#1E293B]">
                  “{currentHunterQ.sentence}”
                </p>
              </div>

              {/* 2 Big Choice Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={hunterChoice !== null}
                  onClick={() => handleChooseHunter('sosanh')}
                  className={`min-h-[64px] rounded-2xl border-2 p-4 text-base sm:text-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    hunterChoice === null
                      ? 'border-indigo-300 bg-indigo-50/70 text-indigo-900 hover:bg-indigo-100 active:scale-[0.98]'
                      : currentHunterQ.correctType === 'sosanh'
                      ? 'border-emerald-600 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500'
                      : hunterChoice === 'sosanh'
                      ? 'border-rose-400 bg-rose-100 text-rose-900 line-through'
                      : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                  }`}
                >
                  <span>🪞 Phép So Sánh</span>
                </button>

                <button
                  type="button"
                  disabled={hunterChoice !== null}
                  onClick={() => handleChooseHunter('nhanhoa')}
                  className={`min-h-[64px] rounded-2xl border-2 p-4 text-base sm:text-lg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    hunterChoice === null
                      ? 'border-rose-300 bg-rose-50/70 text-rose-900 hover:bg-rose-100 active:scale-[0.98]'
                      : currentHunterQ.correctType === 'nhanhoa'
                      ? 'border-emerald-600 bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500'
                      : hunterChoice === 'nhanhoa'
                      ? 'border-rose-400 bg-rose-100 text-rose-900 line-through'
                      : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                  }`}
                >
                  <span>🌱 Phép Nhân Hóa</span>
                </button>
              </div>

              {/* Explanation & Next */}
              {hunterChoice !== null && (
                <div className="space-y-4 pt-2 animate-fade-in">
                  <div className="rounded-2xl bg-amber-50 border border-amber-300 p-4 text-xs sm:text-sm text-amber-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>{currentHunterQ.explanation}:</span>
                    </p>
                    <p className="leading-relaxed">{currentHunterQ.detail}</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextHunter}
                    className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2 rounded-2xl bg-amber-700 text-white text-sm font-semibold hover:bg-amber-800 cursor-pointer shadow-xs"
                  >
                    <span>{hunterIdx + 1 >= RHETORIC_HUNTER_QUESTIONS.length ? 'Xem tổng kết' : 'Câu tiếp theo'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        /* GAME 4: Story Adventure */
        <section className="rounded-3xl bg-white border border-[#DCEEE4] p-6 sm:p-8 max-w-4xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8F3EC] pb-4">
            <div>
              <p className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                Xếp gạch Cốt truyện Sáng tạo
              </p>
              <h3 className="font-display text-2xl font-bold text-[#1E293B] mt-0.5">
                {activeStory.title}
              </h3>
              <p className="text-xs text-[#526277] mt-1">
                Chủ đề: {activeStory.theme} · Người kể: {activeStory.narratorRole}
              </p>
            </div>
            <button
              type="button"
              onClick={handlePickUnplayedOrGenerate}
              disabled={generatingStory}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#EBFAF2] text-[#0F766E] text-xs font-semibold hover:bg-[#D9F4E6] cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Đổi câu chuyện khác</span>
            </button>
          </div>

          {/* Fallback Attempt Status */}
          {modelAttemptInfo && (
            <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-900 flex items-center gap-2 animate-pulse">
              <Cpu className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>{modelAttemptInfo}</span>
            </div>
          )}

          {/* Error màu đỏ nguyên văn theo AI_INSTRUCTIONS.md */}
          {storyGenError && (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 border-2 border-red-300 p-4 space-y-2 text-red-900 shadow-sm"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                    Thông báo lỗi từ Gemini API:
                  </p>
                  <p className="font-mono text-xs text-red-950 font-semibold break-all bg-white/70 p-2 rounded-xl border border-red-200">
                    {storyGenError}
                  </p>
                </div>
              </div>

              {onOpenSettings && (
                <div className="pt-2 border-t border-red-200 flex items-center justify-between">
                  <span className="text-xs text-red-800">Cần thiết lập hoặc thay đổi API Key?</span>
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    Cài đặt API Key
                  </button>
                </div>
              )}
            </div>
          )}

          {isStoryStoppedByError ? (
            <div className="rounded-3xl bg-red-50/60 border-2 border-dashed border-red-300 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <XCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-red-800">
                Đã dừng do lỗi (Tất cả model đều thất bại)
              </h3>
              <p className="text-sm text-red-700 max-w-md mx-auto">
                Không thể tạo câu chuyện mới lúc này. Bạn nhỏ hãy kiểm tra lại kết nối hoặc đổi khóa API Gemini trên Header nhé.
              </p>
            </div>
          ) : storyDone ? (
            /* Story Finished */
            <div className="space-y-6">
              <div className="rounded-3xl bg-[#FFFACD]/60 border border-[#EDE29A] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-[#92400E] uppercase tracking-wider">
                    🎉 Tác phẩm hoàn chỉnh của Bạn nhỏ:
                  </p>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#92400E] border border-[#EDE29A]">
                    +30 XP
                  </span>
                </div>
                <p className="text-base sm:text-lg leading-[1.8] text-[#1E293B]">
                  {fullStoryText}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onSaveStory({
                      original: `Chủ đề truyện: ${activeStory.title}`,
                      upgraded: fullStoryText,
                      pillar: 'storytelling',
                      devices: ['Kể chuyện 3 chặng', activeStory.narratorRole || 'Sáng tạo'],
                    })
                  }
                  className="inline-flex items-center gap-2 min-h-[46px] px-5 rounded-2xl bg-[#0F766E] text-white text-sm font-semibold hover:bg-[#0B5D56] cursor-pointer"
                >
                  <Bookmark className="w-4 h-4" />
                  <span>Cất truyện vào Sổ tay (+10 XP)</span>
                </button>
                <button
                  type="button"
                  onClick={() => resetStory()}
                  className="inline-flex items-center gap-2 min-h-[46px] px-5 rounded-2xl bg-[#EBFAF2] text-[#0F766E] text-sm font-semibold hover:bg-[#D9F4E6] cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại truyện này với nhánh khác</span>
                </button>
              </div>
            </div>
          ) : (
            /* Story Step Selection */
            currentStoryStep && (
              <div className="space-y-5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#526277]">
                  <span>Chặng {storyStepIdx + 1}/3: {currentStoryStep.stage}</span>
                  <span>Bước {storyStepIdx + 1} của 3</span>
                </div>

                <h4 className="font-bold text-lg text-[#1E293B]">
                  {currentStoryStep.question}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentStoryStep.choices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleChooseStoryBranch(choice.snippet, choice.deviceTag)}
                      className="text-left rounded-2xl border border-[#DCEEE4] p-5 hover:border-[#0F766E] hover:bg-[#EBFAF2]/30 transition-all cursor-pointer space-y-2 flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#FFFACD] text-[#92400E] border border-[#EDE29A]">
                          {choice.deviceTag}
                        </span>
                        <p className="font-bold text-sm text-[#0F766E]">{choice.label}</p>
                        <p className="text-sm text-[#1E293B] leading-relaxed">
                          “{choice.snippet}”
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#0F766E] pt-2 flex items-center gap-1">
                        <span>Chọn hướng này</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}

          {/* AI Generator Box at bottom */}
          <div className="pt-4 border-t border-[#E8F3EC] space-y-3">
            <p className="text-xs font-bold text-[#526277] uppercase tracking-wider flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Sáng tạo truyện hoàn toàn mới bằng Gemini AI</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={storyThemeInput}
                onChange={(e) => setStoryThemeInput(e.target.value)}
                placeholder="Nhập ý tưởng mới (ví dụ: Chú gấu con lạc mẹ, Giọt sương sớm...)"
                className="flex-1 min-h-[42px] rounded-xl border border-[#DCEEE4] bg-white px-3.5 text-xs sm:text-sm text-[#1E293B] placeholder:text-[#8696A8] outline-none focus:border-[#0F766E]"
              />
              <button
                type="button"
                disabled={generatingStory}
                onClick={() => handleGenerateFreshStory()}
                className="min-h-[42px] px-5 rounded-xl bg-[#0F766E] text-white text-xs sm:text-sm font-semibold hover:bg-[#0B5D56] disabled:opacity-60 cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0"
              >
                {generatingStory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo truyện mới...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tạo cốt truyện mới</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
