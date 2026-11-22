export type PillarId = 'storytelling' | 'plants' | 'scenery' | 'people';

export type StorytellingStyle = 'add_details' | 'roleplay';

export type NavTab = 'pillars' | 'upgrade' | 'vocab' | 'games' | 'notebook';

export type VocabCategory =
  | 'Từ láy'
  | 'Màu sắc & Ánh sáng'
  | 'Âm thanh & Hình dáng'
  | 'So sánh'
  | 'Nhân hóa';

export interface StorytellingModeGuide {
  id: StorytellingStyle;
  label: string;
  shortLabel: string;
  summary: string;
  pedagogicalTip: string;
  pronounHint: string;
  outline: {
    opening: string;
    body: string[];
    closing: string;
  };
  sampleSimpleSentence: string;
  sampleCheckText: string;
  sampleCharacters?: string[];
  practicePrompts: string[];
}

export interface PillarInfo {
  id: PillarId;
  number: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  image: string;
  surfaceTint: 'mint' | 'rose' | 'lemon';
  pedagogicalMethod: string;
  methodDetail: string;
  keyElements: string[];
  outline: {
    opening: string;
    body: string[];
    closing: string;
  };
  sampleSimpleSentence: string;
  sampleCheckText: string;
  practicePrompts: string[];
  storytellingModes?: Record<StorytellingStyle, StorytellingModeGuide>;
}

export interface VocabItem {
  id: string;
  word: string;
  pillar: PillarId;
  category: VocabCategory;
  meaning: string;
  example: string;
  isCustom?: boolean;
}

export interface UpgradeOption {
  level: string;
  sentence: string;
  devices: string[];
  highlightWords: string[];
  explanation: string;
}

export interface UpgradeResponse {
  originalAnalysis: string;
  upgrades: UpgradeOption[];
  bonusVocabulary: {
    word: string;
    category: string;
    meaning: string;
  }[];
  encouragement: string;
}

export interface WritingIssue {
  wrongSnippet: string;
  fixedSnippet: string;
  category: string;
  whyWrong: string;
  tip: string;
}

export interface CheckWritingResponse {
  praise: string;
  correctedText: string;
  issues: WritingIssue[];
  literaryBoost: {
    device: string;
    suggestion: string;
  };
  encouragement: string;
}

export interface SuggestVocabResponse {
  topicTitle: string;
  writingTip: string;
  words: {
    word: string;
    category: string;
    meaning: string;
    example: string;
  }[];
  encouragement: string;
}

export interface SavedSentence {
  id: string;
  original: string;
  upgraded: string;
  pillar: PillarId;
  devices: string[];
  savedAt: string;
}

export interface QuizQuestion {
  id: string;
  game: 'rescue' | 'race';
  pillar: PillarId;
  prompt: string;
  sentenceWithBlank: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  literaryNote: string;
}

export interface StoryStep {
  stage: string;
  question: string;
  choices: {
    id: string;
    label: string;
    snippet: string;
    deviceTag: string;
  }[];
}

export interface StoryAdventure {
  id: string;
  title: string;
  theme: string;
  storytellingStyle?: StorytellingStyle;
  narratorRole?: string;
  steps: StoryStep[];
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  rewardLabel: string;
  check: (stats: StudentStats) => { unlocked: boolean; current: number; target: number };
}

export interface StudentStats {
  xp: number;
  upgradesCount: number;
  checksCount: number;
  savedVocabCount: number;
  savedSentencesCount: number;
  rescueCorrectCount: number;
  raceCorrectCount: number;
  storiesCompletedCount: number;
}

export interface StudentState {
  nickname: string;
  stats: StudentStats;
  savedSentenceIds: SavedSentence[];
  savedVocabIds: string[];
  customVocab: VocabItem[];
}
