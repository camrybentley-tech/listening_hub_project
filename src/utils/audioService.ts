// Offline-ready ELT Audio Service with Web Audio, Web Speech Synthesis, and Speech Recognition
export interface AudioPlayState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  rate: number;
}

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private isSpeechActive: boolean = false;
  private speechStartTime: number = 0;
  private speechEstimatedDuration: number = 0;
  private timerInterval: number | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    if (typeof window !== 'undefined') {
      this.audioEl = new Audio();
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
      }
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext!;
  }

  // Play subtle feedback chime (positive chime or gentle notification)
  public playSoundEffect(type: 'success' | 'miss' | 'click' | 'chime') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'miss') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }

  // Speak a word or sentence using accent-appropriate Web Speech voice
  public speakText(
    text: string,
    accent: string = 'British English',
    rate: number = 1.0,
    onProgress?: (charIndex: number, currentWord: string) => void,
    onEnd?: () => void
  ): { cancel: () => void } {
    if (!this.synth) {
      if (onEnd) onEnd();
      return { cancel: () => {} };
    }

    this.stopAll();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.7, Math.min(1.3, rate));
    utterance.pitch = 1.0;

    // Resolve voice based on accent
    const voices = this.synth.getVoices();
    let targetLang = 'en-GB';
    if (accent.toLowerCase().includes('american') || accent.toLowerCase().includes('us')) {
      targetLang = 'en-US';
    } else if (accent.toLowerCase().includes('australian') || accent.toLowerCase().includes('au')) {
      targetLang = 'en-AU';
    }

    const matchedVoice = voices.find(v => v.lang.replace('_', '-').startsWith(targetLang)) ||
                         voices.find(v => v.lang.startsWith('en')) ||
                         voices[0];

    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
    utterance.lang = targetLang;

    utterance.onboundary = (event) => {
      if (event.name === 'word' && onProgress) {
        const word = text.slice(event.charIndex, event.charIndex + (event.charLength || 6));
        onProgress(event.charIndex, word);
      }
    };

    utterance.onend = () => {
      this.isSpeechActive = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeechActive = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.isSpeechActive = true;
    this.synth.speak(utterance);

    return {
      cancel: () => {
        this.synth?.cancel();
        this.isSpeechActive = false;
        this.currentUtterance = null;
      }
    };
  }

  public stopAll() {
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.audioEl) {
      this.audioEl.pause();
    }
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isSpeechActive = false;
    this.currentUtterance = null;
  }
}

export const audioService = new AudioService();

// Sentence Comparison & Word-by-Word Diff Algorithm for Dictation
export interface DiffToken {
  type: 'correct' | 'incorrect' | 'missing' | 'extra';
  word: string;
  expectedWord?: string;
}

export function computeWordDiff(studentInput: string, modelSentence: string): {
  tokens: DiffToken[];
  accuracyScore: number;
  isAccurate: boolean;
  matchedCount: number;
  totalModelWords: number;
} {
  const clean = (str: string) => str.replace(/[.,/#!$%^&*;:{}=\-_`~()?"']/g, '').trim().toLowerCase();

  const modelWords = modelSentence.trim().split(/\s+/).filter(Boolean);
  const studentWords = studentInput.trim().split(/\s+/).filter(Boolean);

  const cleanModel = modelWords.map(clean);
  const cleanStudent = studentWords.map(clean);

  const tokens: DiffToken[] = [];
  let sIdx = 0;
  let mIdx = 0;
  let matches = 0;

  while (mIdx < modelWords.length || sIdx < studentWords.length) {
    if (mIdx < modelWords.length && sIdx < studentWords.length) {
      if (cleanModel[mIdx] === cleanStudent[sIdx]) {
        tokens.push({
          type: 'correct',
          word: studentWords[sIdx],
          expectedWord: modelWords[mIdx]
        });
        matches++;
        mIdx++;
        sIdx++;
      } else {
        // Look ahead to check if student skipped a word or inserted an extra word
        const nextMatchInStudent = cleanStudent.indexOf(cleanModel[mIdx], sIdx);
        const nextMatchInModel = cleanModel.indexOf(cleanStudent[sIdx], mIdx);

        if (nextMatchInStudent !== -1 && (nextMatchInModel === -1 || nextMatchInStudent - sIdx <= nextMatchInModel - mIdx)) {
          // Extra word in student's response
          tokens.push({
            type: 'extra',
            word: studentWords[sIdx]
          });
          sIdx++;
        } else if (nextMatchInModel !== -1) {
          // Missing word from model
          tokens.push({
            type: 'missing',
            word: `[${modelWords[mIdx]}]`,
            expectedWord: modelWords[mIdx]
          });
          mIdx++;
        } else {
          // Mismatched / substituted word
          tokens.push({
            type: 'incorrect',
            word: studentWords[sIdx],
            expectedWord: modelWords[mIdx]
          });
          mIdx++;
          sIdx++;
        }
      }
    } else if (mIdx < modelWords.length) {
      // Remaining model words are missing
      tokens.push({
        type: 'missing',
        word: `[${modelWords[mIdx]}]`,
        expectedWord: modelWords[mIdx]
      });
      mIdx++;
    } else {
      // Remaining student words are extra
      tokens.push({
        type: 'extra',
        word: studentWords[sIdx]
      });
      sIdx++;
    }
  }

  const totalModelWords = modelWords.length;
  const accuracyScore = totalModelWords > 0 ? Math.round((matches / totalModelWords) * 100) : 0;
  const isAccurate = accuracyScore >= 90;

  return {
    tokens,
    accuracyScore,
    isAccurate,
    matchedCount: matches,
    totalModelWords
  };
}
