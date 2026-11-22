import { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { TopNav } from './components/TopNav';
import { PillarsView } from './components/PillarsView';
import { UpgradeStudio } from './components/UpgradeStudio';
import { VocabVault } from './components/VocabVault';
import { GameArena } from './components/GameArena';
import { NotebookView } from './components/NotebookView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { useStudentProgress } from './hooks/useStudentProgress';
import { NavTab, PillarId, StorytellingStyle } from './types';
import {
  AVAILABLE_MODELS,
  getStoredApiKey,
  getStoredModel,
} from './services/geminiService';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('pillars');
  const [studioPillar, setStudioPillar] = useState<PillarId>('storytelling');
  const [studioStarter, setStudioStarter] = useState<string | undefined>(undefined);
  const [studioStoryStyle, setStudioStoryStyle] = useState<StorytellingStyle>('add_details');

  // Settings & API Key modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [activeModelName, setActiveModelName] = useState('Gemini 3 Flash');

  const {
    state,
    toast,
    dismissToast,
    setNickname,
    recordUpgradeRun,
    recordCheckRun,
    saveSentence,
    removeSentence,
    toggleSaveVocab,
    recordGameReward,
  } = useStudentProgress();

  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key));
    const currentModelId = getStoredModel();
    const foundModel = AVAILABLE_MODELS.find((m) => m.id === currentModelId);
    if (foundModel) {
      setActiveModelName(foundModel.name);
    }

    // Quy tắc AI_INSTRUCTIONS: Khi chưa có key, hiển thị Modal bắt buộc nhập
    if (!key) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleKeySaved = () => {
    const key = getStoredApiKey();
    setHasApiKey(Boolean(key));
    const currentModelId = getStoredModel();
    const foundModel = AVAILABLE_MODELS.find((m) => m.id === currentModelId);
    if (foundModel) {
      setActiveModelName(foundModel.name);
    }
  };

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartUpgrade = (
    pillar: PillarId,
    starterSentence?: string,
    storytellingStyle?: StorytellingStyle
  ) => {
    setStudioPillar(pillar);
    setStudioStarter(starterSentence);
    if (storytellingStyle) {
      setStudioStoryStyle(storytellingStyle);
    }
    setActiveTab('upgrade');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFDFB] text-[#1E293B]">
      <TopNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        hasApiKey={hasApiKey}
        activeModelName={activeModelName}
      />

      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6">
        {activeTab === 'pillars' && (
          <PillarsView
            student={state}
            onStartUpgrade={handleStartUpgrade}
            onNavigate={handleSelectTab}
            onToggleSaveVocab={toggleSaveVocab}
          />
        )}

        {activeTab === 'upgrade' && (
          <UpgradeStudio
            initialPillar={studioPillar}
            initialSentence={studioStarter}
            initialStorytellingStyle={studioStoryStyle}
            savedSentences={state.savedSentenceIds}
            onRecordUpgradeRun={recordUpgradeRun}
            onRecordCheckRun={recordCheckRun}
            onSaveSentence={saveSentence}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabVault
            savedVocabIds={state.savedVocabIds}
            customVocab={state.customVocab}
            onToggleSaveVocab={toggleSaveVocab}
            onPracticeWord={handleStartUpgrade}
          />
        )}

        {activeTab === 'games' && (
          <GameArena
            onReward={recordGameReward}
            onSaveStory={saveSentence}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {activeTab === 'notebook' && (
          <NotebookView
            student={state}
            onSetNickname={setNickname}
            onRemoveSentence={removeSentence}
            onToggleSaveVocab={(id) => toggleSaveVocab(id)}
            onStartUpgrade={handleStartUpgrade}
          />
        )}
      </main>

      {/* Settings Modal (Cấu hình Model & API Key theo AI_INSTRUCTIONS) */}
      <ApiKeyModal
        isOpen={isSettingsOpen}
        isMandatory={!hasApiKey}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={handleKeySaved}
      />

      {/* Editorial Footer */}
      <footer className="border-t border-[#E4EFE8] bg-[#FCFDFB]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#526277]">
          <p className="font-medium text-[#1E293B]">
            Hành Trình Ngôn Từ · Người bạn đồng hành luyện viết văn lớp 5
          </p>
          <p className="text-xs sm:text-sm text-[#0F766E]">
            “Mỗi câu văn hay hôm nay là một hạt mầm đẹp cho tâm hồn mai sau.”
          </p>
        </div>
      </footer>

      {/* Floating Encouragement Toast from Trợ lý Ngôn Từ */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl bg-[#1E293B] text-white px-4 py-3.5 shadow-lg flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-xl bg-[#0F766E] flex items-center justify-center shrink-0 mt-0.5">
            <Award className="w-4 h-4 text-[#FFFACD]" />
          </div>
          <div className="flex-1 text-sm leading-snug">
            <p className="font-medium">{toast.message}</p>
            {toast.xpGain ? (
              <p className="font-mono text-xs text-[#FFFACD] mt-1">+{toast.xpGain} XP</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Đóng thông báo"
            className="text-white/70 hover:text-white cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
