import React, { useState } from 'react';
import { VocabularyItem, ListeningLesson } from '../types';
import { audioService } from '../utils/audioService';
import {
  Star,
  AlertTriangle,
  Volume2,
  Headphones,
  CheckCircle2,
  XCircle,
  Minus,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface Props {
  vocabulary: VocabularyItem[];
  lessons: ListeningLesson[];
  onSelectWordForContext: (word: VocabularyItem) => void;
  onUpdateVocabulary: (updated: VocabularyItem[]) => void;
  onStartLesson: (lessonId: string) => void;
}

export const MyWordsView: React.FC<Props> = ({
  vocabulary = [],
  lessons = [],
  onSelectWordForContext,
  onUpdateVocabulary,
  onStartLesson
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'keep_missing' | 'mastered'>('keep_missing');
  const [searchWord, setSearchWord] = useState('');

  // Words student repeatedly misses in listening or dictation
  const wordsKeepMissing = (vocabulary || []).filter(
    v => (!v.stats?.listeningRecognised || (v.stats?.timesMissedListening || 0) > 0 || !v.stats?.dictationAccurate)
  );

  const masteredWords = (vocabulary || []).filter(
    v => v.stats?.meaningKnown && v.stats?.listeningRecognised && v.stats?.dictationAccurate && v.stats?.pronunciationGood
  );

  const displayWords = (
    filterMode === 'keep_missing'
      ? wordsKeepMissing
      : filterMode === 'mastered'
      ? masteredWords
      : (vocabulary || [])
  ).filter(v => (v.word || '').toLowerCase().includes(searchWord.toLowerCase()) || (v.definition || '').toLowerCase().includes(searchWord.toLowerCase()));

  const handleSpeak = (word: string) => {
    audioService.speakText(word, 'British English', 1.0);
  };

  const handleResetWordStats = (wordId: string) => {
    const updated = vocabulary.map(v => {
      if (v.id === wordId) {
        return {
          ...v,
          stats: {
            ...v.stats,
            listeningRecognised: true,
            timesMissedListening: 0
          }
        };
      }
      return v;
    });
    onUpdateVocabulary(updated);
    audioService.playSoundEffect('success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner with Smart Personalisation */}
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-blue-500/5 border border-amber-200/80 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3 border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              Personalised Multi-Dimensional Vocabulary Review
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Words & Listening Recognition Tracker
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              We monitor 5 distinct dimensions: <strong>Meaning</strong>, <strong>Pronunciation</strong>, <strong>Listening Recognition</strong>, <strong>Dictation</strong>, and <strong>Speaking</strong>.
              Words missed during listening activities are automatically prioritized for audio retraining.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex-1 md:flex-initial text-center min-w-[130px]">
              <div className="text-2xl font-black text-amber-600">{wordsKeepMissing.length}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Need Listening Practice</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex-1 md:flex-initial text-center min-w-[130px]">
              <div className="text-2xl font-black text-emerald-600">{masteredWords.length}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Fully Mastered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations Section */}
      {wordsKeepMissing.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Smart Audio Retraining Recommendations
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wordsKeepMissing.slice(0, 2).map(item => {
              // Find lessons with this word
              const relevantLesson = (lessons || []).find(l =>
                (l.targetWords || []).map(w => w.toLowerCase()).includes(item.word.toLowerCase()) ||
                (l.fullTranscriptText || '').toLowerCase().includes(item.word.toLowerCase())
              );

              return (
                <div
                  key={item.id}
                  className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-slate-900 text-base">{item.word}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-semibold">
                        Missed in listening: {item.stats.timesMissedListening}x
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      You know &ldquo;{item.word}&rdquo; on paper, but you often miss it when listening in natural speech.
                      Practise this word in authentic context audio clips.
                    </p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectWordForContext(item)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      Listen In 3 Context Clips
                    </button>

                    {relevantLesson && (
                      <button
                        onClick={() => onStartLesson(relevantLesson.id)}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1"
                      >
                        Re-listen lesson
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterMode('keep_missing')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              filterMode === 'keep_missing'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            WORDS I KEEP MISSING ({wordsKeepMissing.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            style={filterMode === 'all' ? {
              background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(124, 92, 252, 0.3)'
            } : undefined}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              filterMode === 'all'
                ? ''
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ALL SAVED ({vocabulary.length})
          </button>
          <button
            onClick={() => setFilterMode('mastered')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all whitespace-nowrap ${
              filterMode === 'mastered'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            MASTERED ({masteredWords.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved words..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
          />
        </div>
      </div>

      {/* Words Table / Cards */}
      <div className="space-y-4">
        {displayWords.map(item => {
          const { stats } = item;
          const isMissing = !stats.listeningRecognised || stats.timesMissedListening > 0 || !stats.dictationAccurate;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all bg-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                isMissing ? 'border-amber-200/90 shadow-xs' : 'border-slate-200'
              }`}
            >
              {/* Word & Definition */}
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{item.word}</h3>
                  <span className="font-mono text-xs text-slate-500">{item.phonetic}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">{item.cefr}</span>
                  <button
                    onClick={() => handleSpeak(item.word)}
                    className="p-1 rounded-md text-blue-600 hover:bg-blue-50"
                    title="Pronounce"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{item.definition}</p>
                <div className="text-[11px] text-slate-500 italic">
                  Topic: {item.topic}
                </div>
              </div>

              {/* Multi-Dimensional Competency Badges */}
              <div className="grid grid-cols-5 gap-2 w-full lg:w-auto">
                {/* Meaning */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[72px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Meaning</span>
                  {stats.meaningKnown ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-[10px] font-semibold text-slate-700 mt-1">
                    {stats.meaningKnown ? 'Known' : 'Learning'}
                  </span>
                </div>

                {/* Pronunciation */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[72px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Pronun.</span>
                  {stats.pronunciationGood ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-[10px] font-semibold text-slate-700 mt-1">
                    {stats.pronunciationGood ? 'Clear' : 'Review'}
                  </span>
                </div>

                {/* Listening Recognition */}
                <div
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border min-w-[72px] ${
                    stats.listeningRecognised
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold mb-1">Listening</span>
                  {stats.listeningRecognised ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="text-[10px] font-bold mt-1">
                    {stats.listeningRecognised ? '✓ Heard' : `✗ Missed (${stats.timesMissedListening})`}
                  </span>
                </div>

                {/* Dictation */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[72px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Dictation</span>
                  {stats.dictationAccurate ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-amber-500" />
                  )}
                  <span className="text-[10px] font-semibold text-slate-700 mt-1">
                    {stats.dictationAccurate ? 'Accurate' : 'Weak'}
                  </span>
                </div>

                {/* Speaking */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-[72px]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Speaking</span>
                  {stats.speakingPracticed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Minus className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-[10px] font-semibold text-slate-700 mt-1">
                    {stats.speakingPracticed ? 'Shadowed' : '—'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  onClick={() => onSelectWordForContext(item)}
                  className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-blue-200"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Listen in Context
                </button>

                {!stats.listeningRecognised && (
                  <button
                    onClick={() => handleResetWordStats(item.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 text-xs font-semibold transition-colors"
                    title="Mark as recognised / Reset miss counter"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {displayWords.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-base font-bold text-slate-800">No words found in this view</p>
            <p className="text-xs text-slate-500 mt-1">
              {filterMode === 'keep_missing'
                ? 'Great job! You have no words flagged as missed in listening.'
                : 'Try adjusting your search query.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
