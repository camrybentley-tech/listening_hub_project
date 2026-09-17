import React, { useState } from 'react';
import { VocabularyItem, ListeningLesson } from '../types';
import { audioService } from '../utils/audioService';
import { Volume2, Search, Filter, Headphones, CheckCircle2, XCircle, Minus, Sparkles } from 'lucide-react';

interface Props {
  vocabulary: VocabularyItem[];
  lessons: ListeningLesson[];
  onSelectWordForContext: (word: VocabularyItem) => void;
  onUpdateVocabulary: (updated: VocabularyItem[]) => void;
  onNavigateToLesson: (lessonId: string) => void;
}

export const VocabularyView: React.FC<Props> = ({
  vocabulary = [],
  lessons = [],
  onSelectWordForContext,
  onUpdateVocabulary,
  onNavigateToLesson
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedCefr, setSelectedCefr] = useState('All');

  const topics = ['All', ...Array.from(new Set((vocabulary || []).map(v => v.topic)))];
  const cefrLevels = ['All', 'A2', 'B1', 'B2', 'C1'];

  const filteredVocabulary = (vocabulary || []).filter(item => {
    const matchSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchTopic = selectedTopic === 'All' || item.topic === selectedTopic;
    const matchCefr = selectedCefr === 'All' || item.cefr === selectedCefr;
    return matchSearch && matchTopic && matchCefr;
  });

  const handleSpeak = (word: string) => {
    audioService.speakText(word, 'British English', 0.95);
  };

  const handleToggleMeaning = (id: string) => {
    const updated = vocabulary.map(v => {
      if (v.id === id) {
        return {
          ...v,
          stats: {
            ...v.stats,
            meaningKnown: !v.stats.meaningKnown
          }
        };
      }
      return v;
    });
    onUpdateVocabulary(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(158, 105, 255, 0.08) 0%, rgba(225, 77, 252, 0.05) 50%, rgba(37, 192, 225, 0.08) 100%)'
        }}
        className="border border-purple-100 rounded-3xl p-6 sm:p-8"
      >
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-100 text-[#7C5CFC] text-xs font-extrabold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Shared Vocabulary Knowledge Base
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Target Vocabulary & Listening Connections
          </h1>
          <p className="mt-2 text-base text-slate-600 leading-relaxed">
            Every word here directly connects to authentic audio and video clips in the Listening Lab.
            Words you struggle to recognise in listening are automatically flagged in <strong>My Words</strong> for spaced review.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search word or definition..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] focus:border-transparent text-sm bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
            >
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">CEFR:</span>
            <select
              value={selectedCefr}
              onChange={(e) => setSelectedCefr(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
            >
              {cefrLevels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVocabulary.map(item => {
          // Check in which lessons this word appears
          const relatedLessons = (lessons || []).filter(l =>
            (l.targetWords || []).map(w => w.toLowerCase()).includes(item.word.toLowerCase()) ||
            (l.fullTranscriptText || '').toLowerCase().includes(item.word.toLowerCase())
          );

          const { stats } = item;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Word header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{item.word}</h3>
                      <button
                        onClick={() => handleSpeak(item.word)}
                        className="p-1.5 rounded-lg text-[#7C5CFC] hover:bg-purple-50 transition-colors"
                        title="Pronounce word"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono font-semibold text-[#7C5CFC]">{item.phonetic}</span>
                      <span>•</span>
                      <span className="italic">{item.partOfSpeech}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-purple-50 text-[#7C5CFC] border border-purple-200">
                    {item.cefr}
                  </span>
                </div>

                {/* Definition */}
                <p className="text-sm text-slate-700 mt-2 mb-3 leading-snug">
                  {item.definition}
                </p>

                {/* Example sentence */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600 mb-4">
                  <span className="font-semibold text-slate-500 block mb-1">Example:</span>
                  &ldquo;{item.exampleSentence}&rdquo;
                </div>

                {/* Multi-Dimensional Competency Matrix */}
                <div className="space-y-1.5 mb-4">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Learning Dimensions
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div
                      onClick={() => handleToggleMeaning(item.id)}
                      className="cursor-pointer flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100/60"
                      title="Click to toggle meaning"
                    >
                      <span className="text-slate-600">Meaning:</span>
                      {stats.meaningKnown ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Known
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-400">
                          <Minus className="w-3.5 h-3.5" /> Learning
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-600">Listening:</span>
                      {stats.listeningRecognised ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Recognised
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                          <XCircle className="w-3.5 h-3.5" /> Missed ({stats.timesMissedListening})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-600">Dictation:</span>
                      {stats.dictationAccurate ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accurate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                          <XCircle className="w-3.5 h-3.5" /> Needs Practice
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-600">Speaking:</span>
                      {stats.speakingPracticed ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Shadowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <Minus className="w-3.5 h-3.5" /> Not yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => onSelectWordForContext(item)}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-[#7C5CFC] font-extrabold text-xs transition-colors flex items-center justify-center gap-2 border border-purple-200"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Listen In Context ({relatedLessons.length} lessons)
                </button>

                {relatedLessons.length > 0 && (
                  <div className="text-[11px] text-slate-500 truncate">
                    Heard in: {relatedLessons.map(l => (
                      <button
                        key={l.id}
                        onClick={() => onNavigateToLesson(l.id)}
                        className="underline hover:text-blue-600 mr-1.5"
                      >
                        {l.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
