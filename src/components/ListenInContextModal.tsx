import React, { useState } from 'react';
import { VocabularyItem, ListeningLesson } from '../types';
import { audioService } from '../utils/audioService';
import { Play, Pause, Volume2, X, ExternalLink, Bookmark } from 'lucide-react';

interface Props {
  wordItem: VocabularyItem | null;
  lessons: ListeningLesson[];
  onClose: () => void;
  onOpenLesson?: (lessonId: string) => void;
}

export const ListenInContextModal: React.FC<Props> = ({
  wordItem,
  lessons,
  onClose,
  onOpenLesson
}) => {
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);

  if (!wordItem) return null;

  // Find occurrences of this word across all lesson transcripts
  const occurrences: Array<{
    id: string;
    lessonId: string;
    lessonTitle: string;
    topic: string;
    cefr: string;
    accent: string;
    speaker?: string;
    sentence: string;
    startTime: number;
    endTime: number;
  }> = [];

  const lowerWord = wordItem.word.toLowerCase();

  lessons.forEach(lesson => {
    lesson.transcript.forEach(line => {
      if (line.text.toLowerCase().includes(lowerWord)) {
        occurrences.push({
          id: `${lesson.id}-${line.id}`,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          topic: lesson.topic,
          cefr: lesson.cefr,
          accent: lesson.accent,
          speaker: line.speaker,
          sentence: line.text,
          startTime: line.startTime,
          endTime: line.endTime
        });
      }
    });
  });

  // If no transcript line has it, fall back to lesson example or definition
  if (occurrences.length === 0) {
    occurrences.push({
      id: 'default-ex',
      lessonId: '',
      lessonTitle: wordItem.topic,
      topic: wordItem.topic,
      cefr: wordItem.cefr,
      accent: 'British English',
      sentence: wordItem.exampleSentence,
      startTime: 0,
      endTime: 5
    });
  }

  const handlePlayClip = (clipId: string, sentence: string, accent: string) => {
    if (playingClipId === clipId) {
      audioService.stopAll();
      setPlayingClipId(null);
      return;
    }

    setPlayingClipId(clipId);
    audioService.speakText(sentence, accent, 1.0, undefined, () => {
      setPlayingClipId(null);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-[#7C5CFC] flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{wordItem.word}</h3>
                <span className="text-sm font-mono text-[#7C5CFC] font-semibold">{wordItem.phonetic}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-semibold">{wordItem.cefr}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{wordItem.partOfSpeech} · {wordItem.definition}</p>
            </div>
          </div>
          <button
            onClick={() => {
              audioService.stopAll();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-purple-50/70 rounded-xl p-4 border border-purple-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7C5CFC] mb-1">
              Listen To This Word In Context
            </h4>
            <p className="text-sm text-purple-950">
              Hear how native speakers pronounce and stress &ldquo;<span className="font-bold text-[#7C5CFC]">{wordItem.word}</span>&rdquo; in authentic listening lessons.
            </p>
          </div>

          <div className="space-y-3">
            {occurrences.map((occ, index) => {
              const isPlaying = playingClipId === occ.id;
              // Highlight the target word in the sentence
              const parts = occ.sentence.split(new RegExp(`(${wordItem.word})`, 'gi'));

              return (
                <div
                  key={occ.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPlaying
                      ? 'border-purple-400 bg-purple-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-purple-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Example {index + 1}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-600">{occ.topic}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {occ.accent}
                      </span>
                    </div>
                    {occ.lessonId && onOpenLesson && (
                      <button
                        onClick={() => {
                          audioService.stopAll();
                          onClose();
                          onOpenLesson(occ.lessonId);
                        }}
                        className="text-xs font-semibold text-[#7C5CFC] hover:text-[#9E69FF] flex items-center gap-1"
                      >
                        Go to lesson
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <p className="text-base text-slate-800 leading-relaxed font-normal mb-3">
                    &ldquo;
                    {parts.map((part, i) =>
                      part.toLowerCase() === lowerWord ? (
                        <span key={i} className="font-bold text-[#7C5CFC] underline decoration-purple-300 decoration-2 underline-offset-2">
                          {part}
                        </span>
                      ) : (
                        part
                      )
                    )}
                    &rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      {occ.speaker ? `Speaker: ${occ.speaker}` : occ.lessonTitle}
                    </span>
                    <button
                      onClick={() => handlePlayClip(occ.id, occ.sentence, occ.accent)}
                      style={!isPlaying ? {
                        background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)',
                        boxShadow: '0 2px 6px rgba(124, 92, 252, 0.3)'
                      } : undefined}
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all text-white ${
                        isPlaying
                          ? 'bg-amber-600 shadow-xs'
                          : ''
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          Pause Clip
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Play Audio Clip
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Bookmark className="w-4 h-4 text-[#7C5CFC]" />
            <span>Word stored in My Words database</span>
          </div>
          <button
            onClick={() => {
              audioService.stopAll();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
