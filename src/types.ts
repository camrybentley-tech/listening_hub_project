export type AppTab = 'vocabulary' | 'listening_lab' | 'my_words';

export type CEFRLevel = 'A2' | 'B1' | 'B2' | 'C1';

export type Accent = 'British English' | 'American English' | 'Australian English' | 'International English';

export interface LessonOccurrence {
  lessonId: string;
  lessonTitle: string;
  snippet: string;
  timestamp: number;
  speaker?: string;
  accent?: string;
}

export interface VocabularyStats {
  meaningKnown: boolean;
  pronunciationGood: boolean;
  listeningRecognised: boolean;
  dictationAccurate: boolean;
  speakingPracticed: boolean;
  timesEncountered: number;
  timesMissedListening: number;
  timesMissedDictation: number;
  lastTested?: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  cefr: CEFRLevel;
  topic: string;
  exampleSentence: string;
  stats: VocabularyStats;
  lessonOccurrences?: LessonOccurrence[];
}

export interface TranscriptLine {
  id: string;
  startTime: number; // in seconds
  endTime: number; // in seconds
  speaker?: string;
  text: string;
}

export interface WordHuntOption {
  word: string;
  inAudio: boolean;
  isTarget: boolean;
  timestampSeek?: number;
  snippet?: string;
}

export type LessonStatus = 
  | 'NEW_SOURCE'
  | 'ANALYSING'
  | 'NEEDS_CONTENT_REVIEW'
  | 'NEEDS_QUESTION_REVIEW'
  | 'READY_TO_PUBLISH'
  | 'PUBLISHED'
  | 'REJECTED';

export interface TrustedSource {
  id: string;
  name: string; // e.g. "BBC Learning English"
  domain: string; // e.g. "bbc.co.uk"
  channelName?: string;
  contentType: 'youtube' | 'podcast' | 'web_audio';
  websiteUrl: string;
  enabled: boolean;
  approvedLessonsCount: number;
  description: string;
  logo: string;
}

export interface SourceVerificationResult {
  verified: boolean;
  statusMessage: string;
  sourceName?: string;
  sourceDomain?: string;
  sourceUrl: string;
  originalTitle?: string;
  contentType: 'youtube' | 'podcast' | 'web_audio';
  duration?: string;
  publishedDate?: string;
  officialSource: boolean;
  embedAvailable: boolean;
  transcriptAvailable: boolean;
  error?: string;
}

export interface ComprehensionQuestion {
  id: string;
  type: 'main_idea' | 'specific_info' | 'true_false' | 'inference' | 'speaker_intention' | 'vocab_in_context';
  typeLabel: string;
  question: string;
  options: [string, string, string, string] | string[]; // A, B, C, D
  correctOptionIndex: number; // 0, 1, 2, 3
  startTime: number;
  endTime: number;
  evidenceTranscript: string;
  explanation: string;
  approved?: boolean;
}

export interface DictationItem {
  id: string;
  sentence: string;
  startTime: number;
  endTime: number;
  targetWord: string;
  hint?: string;
}

export interface ShadowingItem {
  id: string;
  sentence: string;
  startTime: number;
  endTime: number;
  targetWord: string;
  personalizedPrompt: string;
}

export interface ListeningLesson {
  id: string;
  title: string;
  topic: string;
  cefr: CEFRLevel;
  sourceType: 'youtube' | 'podcast' | 'upload' | 'animation' | 'web_audio';
  
  // Mandatory Trusted Source properties
  sourceName: string;
  sourceDomain: string;
  sourceUrl: string;
  originalTitle: string;
  contentType: 'youtube' | 'podcast' | 'web_audio';
  publishedDate?: string;
  officialSource: boolean;
  embedAvailable: boolean;
  transcriptAvailable: boolean;

  // Two-Level Approval & Workflow Status
  status: LessonStatus;
  contentApproved: boolean;
  questionsApproved: boolean;
  teacherApprovedAt?: string;
  teacherNotes?: string;
  sensitiveContentChecked?: boolean;

  // Content Analysis Extras
  connectedSpeechFeatures?: string[];
  usefulExpressions?: string[];

  // Playback & Curriculum
  youtubeId?: string;
  audioUrl?: string; // or local blob URL
  duration: string; // e.g. "3:20"
  durationSeconds: number;
  accent: Accent;
  coverImage: string;
  learningObjective: string;
  targetWords: string[];
  speakers?: string;
  transcript: TranscriptLine[];
  fullTranscriptText: string;
  keyIdeas: string[];
  shadowingEnabled: boolean;
  wordHunt: {
    prompt: string;
    options: WordHuntOption[];
  };
  questions: ComprehensionQuestion[];
  dictations: DictationItem[];
  shadowingSentences: ShadowingItem[];
}

export type LessonStage = 'listen' | 'word_hunt' | 'understand' | 'dictation' | 'shadowing' | 'review';

export interface LessonSessionState {
  currentStage: LessonStage;
  // Word hunt state
  selectedHuntWords: string[];
  huntSubmitted: boolean;
  huntMissedWords: string[];
  huntRecognisedWords: string[];

  // Understand questions state: record questionId -> { attempts: number; selectedOptionIndex: number; isCorrect: boolean }
  questionAnswers: Record<string, {
    attempts: number;
    selectedOptionIndex: number | null;
    isCorrect: boolean;
    revealed: boolean;
  }>;

  // Dictation state: record dictationId -> { userInput: string; checked: boolean; isAccurate: boolean }
  dictationAnswers: Record<string, {
    userInput: string;
    checked: boolean;
    isAccurate: boolean;
    attempts: number;
  }>;

  // Shadowing state
  shadowingProgress: Record<string, {
    level1Done: boolean;
    level2Done: boolean;
    level3Done: boolean;
    recordingBlobUrl?: string;
    recognizedSpeech?: string;
    feedback?: {
      wordsMatched: string;
      targetVocabStatus: 'Correct' | 'Needs practice';
      pronunciationStatus: 'Clear' | 'Needs practice';
      fluencyStatus: 'Good' | 'Steady' | 'Hesitant';
      taskCompletion: 'Completed' | 'Partial';
    };
  }>;

  completedAt?: string;
}
