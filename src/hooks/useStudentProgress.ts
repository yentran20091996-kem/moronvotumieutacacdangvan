import { useCallback, useEffect, useState } from 'react';
import { PillarId, SavedSentence, StudentState, VocabItem } from '../types';

const STORAGE_KEY = 'hanh_trinh_ngon_tu_v1';

const INITIAL_STATE: StudentState = {
  nickname: 'Sĩ tử nhí lớp 5',
  stats: {
    xp: 20,
    upgradesCount: 0,
    checksCount: 0,
    savedVocabCount: 2,
    savedSentencesCount: 1,
    rescueCorrectCount: 0,
    raceCorrectCount: 0,
    storiesCompletedCount: 0,
  },
  savedSentenceIds: [
    {
      id: 'starter-1',
      original: 'Hoa hồng rất đẹp.',
      upgraded:
        'Những đóa hồng nhung đỏ thắm, khoác trên mình lớp áo choàng nhung mịn màng còn đọng những hạt sương sớm long lanh.',
      pillar: 'plants',
      devices: ['Nhân hóa', 'Từ láy'],
      savedAt: new Date().toISOString(),
    },
  ],
  savedVocabIds: ['v-pl-1', 'v-sc-4'],
  customVocab: [],
};

export interface ToastNotice {
  id: number;
  message: string;
  xpGain?: number;
}

export function useStudentProgress() {
  const [state, setState] = useState<StudentState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return INITIAL_STATE;
      const parsed = JSON.parse(raw) as StudentState;
      if (!parsed || !parsed.stats) return INITIAL_STATE;
      return parsed;
    } catch {
      return INITIAL_STATE;
    }
  });

  const [toast, setToast] = useState<ToastNotice | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const notify = useCallback((message: string, xpGain?: number) => {
    const id = Date.now();
    setToast({ id, message, xpGain });
    window.setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 3600);
  }, []);

  const setNickname = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setState((prev) => ({ ...prev, nickname: trimmed.slice(0, 32) }));
  }, []);

  const recordUpgradeRun = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        xp: prev.stats.xp + 15,
        upgradesCount: prev.stats.upgradesCount + 1,
      },
    }));
  }, []);

  const recordCheckRun = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        xp: prev.stats.xp + 20,
        checksCount: prev.stats.checksCount + 1,
      },
    }));
  }, []);

  const saveSentence = useCallback(
    (entry: { original: string; upgraded: string; pillar: PillarId; devices: string[] }) => {
      let alreadySaved = false;
      setState((prev) => {
        const exists = prev.savedSentenceIds.some(
          (item) => item.upgraded.trim() === entry.upgraded.trim()
        );
        if (exists) {
          alreadySaved = true;
          return prev;
        }
        const nextItem: SavedSentence = {
          id: `sent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ...entry,
          savedAt: new Date().toISOString(),
        };
        const updatedList = [nextItem, ...prev.savedSentenceIds];
        return {
          ...prev,
          savedSentenceIds: updatedList,
          stats: {
            ...prev.stats,
            xp: prev.stats.xp + 10,
            savedSentencesCount: updatedList.length,
          },
        };
      });
      if (alreadySaved) {
        notify('Câu văn hay này đã nằm gọn trong Sổ tay của Bạn nhỏ rồi!');
      } else {
        notify('Tuyệt vời! Đã lưu câu văn vào Sổ tay Ngôn từ của Bạn nhỏ.', 10);
      }
    },
    [notify]
  );

  const removeSentence = useCallback((id: string) => {
    setState((prev) => {
      const updated = prev.savedSentenceIds.filter((s) => s.id !== id);
      return {
        ...prev,
        savedSentenceIds: updated,
        stats: {
          ...prev.stats,
          savedSentencesCount: updated.length,
        },
      };
    });
  }, []);

  const toggleSaveVocab = useCallback(
    (vocabId: string, customItem?: VocabItem) => {
      let added = false;
      setState((prev) => {
        const exists = prev.savedVocabIds.includes(vocabId);
        let nextIds: string[];
        let nextCustom = prev.customVocab;
        let xpDelta = 0;

        if (exists) {
          nextIds = prev.savedVocabIds.filter((id) => id !== vocabId);
        } else {
          added = true;
          nextIds = [vocabId, ...prev.savedVocabIds];
          xpDelta = 5;
          if (customItem && !prev.customVocab.some((c) => c.id === customItem.id)) {
            nextCustom = [customItem, ...prev.customVocab];
          }
        }

        return {
          ...prev,
          savedVocabIds: nextIds,
          customVocab: nextCustom,
          stats: {
            ...prev.stats,
            xp: prev.stats.xp + xpDelta,
            savedVocabCount: nextIds.length,
          },
        };
      });

      if (added) {
        notify('Bạn đang sở hữu vốn từ thật phong phú! Đã lưu vào Sổ tay.', 5);
      }
    },
    [notify]
  );

  const recordGameReward = useCallback(
    (kind: 'rescue' | 'race' | 'story' | 'hunter', xpEarned: number, correctDelta: number, message: string) => {
      setState((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          xp: prev.stats.xp + xpEarned,
          rescueCorrectCount:
            kind === 'rescue' ? prev.stats.rescueCorrectCount + correctDelta : prev.stats.rescueCorrectCount,
          raceCorrectCount:
            kind === 'race' || kind === 'hunter' ? prev.stats.raceCorrectCount + correctDelta : prev.stats.raceCorrectCount,
          storiesCompletedCount:
            kind === 'story' ? prev.stats.storiesCompletedCount + 1 : prev.stats.storiesCompletedCount,
        },
      }));
      notify(message, xpEarned);
    },
    [notify]
  );

  return {
    state,
    toast,
    dismissToast: () => setToast(null),
    setNickname,
    recordUpgradeRun,
    recordCheckRun,
    saveSentence,
    removeSentence,
    toggleSaveVocab,
    recordGameReward,
  };
}
