import React, { useState, useEffect } from 'react';
import { AppTab, ListeningLesson, VocabularyItem } from './types';
import { INITIAL_LESSONS, INITIAL_VOCABULARY } from './data/initialData';
import { Navbar } from './components/Navbar';
import { VocabularyView } from './components/VocabularyView';
import { ListeningLabHome } from './components/ListeningLabHome';
import { MyWordsView } from './components/MyWordsView';
import { LessonActiveView } from './components/LessonActiveView';
import { TeacherCuratedHub } from './components/TeacherCuratedHub';
import { TeacherAddSourceModal } from './components/TeacherAddSourceModal';
import { ListenInContextModal } from './components/ListenInContextModal';
import { downloadStandaloneHtmlFile } from './utils/exportSingleFileHtml';

export const App: React.FC = () => {
  // Global State with LocalStorage persistence for 100% offline usage
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(() => {
    const saved = localStorage.getItem('elt_listening_vocabulary');
    if (!saved) return INITIAL_VOCABULARY;
    try {
      const parsed: VocabularyItem[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(v => v.id));
      const missingInitial = INITIAL_VOCABULARY.filter(v => !existingIds.has(v.id));
      return [...parsed, ...missingInitial];
    } catch {
      return INITIAL_VOCABULARY;
    }
  });

  const [lessons, setLessons] = useState<ListeningLesson[]>(() => {
    const saved = localStorage.getItem('elt_listening_lessons');
    if (!saved) return INITIAL_LESSONS;
    try {
      const parsed: ListeningLesson[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(l => l.id));
      const missingInitial = INITIAL_LESSONS.filter(l => !existingIds.has(l.id));
      return [...parsed, ...missingInitial];
    } catch {
      return INITIAL_LESSONS;
    }
  });

  const [activeTab, setActiveTab] = useState<AppTab>('listening_lab');
  const [activeLesson, setActiveLesson] = useState<ListeningLesson | null>(null);

  // Role: 'teacher' has curation & approval control; 'student' only sees PUBLISHED lessons
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('teacher');

  // Modals
  const [isCuratedHubOpen, setIsCuratedHubOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [contextModalWord, setContextModalWord] = useState<VocabularyItem | null>(null);

  // Filter lessons based on role: students MUST NEVER see unapproved lessons
  const visibleLessons = userRole === 'student'
    ? lessons.filter(l => l.status === 'PUBLISHED')
    : lessons;

  const pendingReviewCount = lessons.filter(l => l.status !== 'PUBLISHED').length;

  // Save to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('elt_listening_vocabulary', JSON.stringify(vocabulary));
  }, [vocabulary]);

  useEffect(() => {
    localStorage.setItem('elt_listening_lessons', JSON.stringify(lessons));
  }, [lessons]);

  // Handler for starting a lesson
  const handleStartLesson = (lessonOrId: ListeningLesson | string) => {
    if (typeof lessonOrId === 'string') {
      const found = lessons.find(l => l.id === lessonOrId);
      if (found) setActiveLesson(found);
    } else {
      setActiveLesson(lessonOrId);
    }
  };

  // Handler for saving a new lesson from Teacher Studio
  const handleSaveTeacherLesson = (newLesson: ListeningLesson) => {
    setLessons(prev => [newLesson, ...prev]);
    // Automatically match new lesson target words with vocabulary database
    const updatedVocab = vocabulary.map(v => {
      const match = newLesson.targetWords.some(
        tw => tw.toLowerCase() === v.word.toLowerCase()
      );
      const existingOccurrences = v.lessonOccurrences || [];
      if (match && !existingOccurrences.some(o => o.lessonId === newLesson.id)) {
        return {
          ...v,
          lessonOccurrences: [
            ...existingOccurrences,
            {
              lessonId: newLesson.id,
              lessonTitle: newLesson.title,
              snippet: newLesson.transcript[0]?.text || '...in regular conversation...',
              timestamp: newLesson.transcript[0]?.startTime || 0,
              speaker: newLesson.transcript[0]?.speaker || 'Speaker',
              accent: newLesson.accent
            }
          ]
        };
      }
      return v;
    });

    setVocabulary(updatedVocab);
    setActiveTab('listening_lab');
  };

  const handleUpdateLessonFromHub = (updatedLesson: ListeningLesson) => {
    setLessons(prev => prev.map(l => l.id === updatedLesson.id ? updatedLesson : l));
  };

  const handleDeleteLessonFromHub = (lessonId: string) => {
    setLessons(prev => prev.filter(l => l.id !== lessonId));
  };

  // Handler to download single-file offline HTML
  const handleExportSingleFile = () => {
    downloadStandaloneHtmlFile(vocabulary, lessons);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setActiveLesson(null);
        }}
        onOpenTeacherModal={() => setIsCuratedHubOpen(true)}
        onOpenCuratedHub={() => setIsCuratedHubOpen(true)}
        onOpenAddSource={() => setIsCuratedHubOpen(true)}
        onExportOfflineHtml={handleExportSingleFile}
        userRole={userRole}
        onToggleRole={() => setUserRole(r => r === 'teacher' ? 'student' : 'teacher')}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main Body */}
      <main className="flex-1 pb-16">
        {activeLesson ? (
          /* Active 6-Stage Student Listening Lesson Player */
          <LessonActiveView
            lesson={activeLesson}
            vocabulary={vocabulary}
            onBackToLab={() => setActiveLesson(null)}
            onUpdateVocabulary={setVocabulary}
            onSelectWordForContext={(w) => setContextModalWord(w)}
          />
        ) : (
          <>
            {/* TAB 1: VOCABULARY */}
            {activeTab === 'vocabulary' && (
              <VocabularyView
                vocabulary={vocabulary}
                lessons={lessons}
                onSelectWordForContext={(w) => setContextModalWord(w)}
                onUpdateVocabulary={setVocabulary}
                onNavigateToLesson={(lessonId) => {
                  const l = lessons.find(x => x.id === lessonId);
                  if (l) setActiveLesson(l);
                }}
              />
            )}

            {/* TAB 2: LISTENING LAB (HOME) */}
            {activeTab === 'listening_lab' && (
              <ListeningLabHome
                lessons={visibleLessons}
                vocabulary={vocabulary}
                onStartLesson={(lessonId) => {
                  const l = lessons.find(x => x.id === lessonId);
                  if (l) setActiveLesson(l);
                }}
                onSelectWordForContext={(w) => setContextModalWord(w)}
                onOpenTeacherModal={() => setIsCuratedHubOpen(true)}
                userRole={userRole}
                onOpenCuratedHub={() => setIsCuratedHubOpen(true)}
                onToggleRole={() => setUserRole(r => r === 'teacher' ? 'student' : 'teacher')}
              />
            )}

            {/* TAB 3: MY WORDS */}
            {activeTab === 'my_words' && (
              <MyWordsView
                vocabulary={vocabulary}
                lessons={lessons}
                onSelectWordForContext={(w) => setContextModalWord(w)}
                onUpdateVocabulary={setVocabulary}
                onStartLesson={(lessonId) => {
                  const l = lessons.find(x => x.id === lessonId);
                  if (l) setActiveLesson(l);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Teacher Curated Listening Hub Modal - Complete 2-Step Approval Studio */}
      {isCuratedHubOpen && (
        <TeacherCuratedHub
          isOpen={isCuratedHubOpen}
          onClose={() => setIsCuratedHubOpen(false)}
          lessons={lessons}
          vocabulary={vocabulary}
          onAddLesson={handleSaveTeacherLesson}
          onUpdateLesson={handleUpdateLessonFromHub}
          onDeleteLesson={handleDeleteLessonFromHub}
        />
      )}

      {/* Legacy Modal (kept for backward compatibility if triggered) */}
      <TeacherAddSourceModal
        existingVocabulary={vocabulary}
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        onSaveLesson={handleSaveTeacherLesson}
      />

      {/* Listen In Context Modal */}
      {contextModalWord && (
        <ListenInContextModal
          word={contextModalWord}
          isOpen={Boolean(contextModalWord)}
          onClose={() => setContextModalWord(null)}
          onStartLessonById={(lessonId) => {
            const l = lessons.find(x => x.id === lessonId);
            if (l) {
              setContextModalWord(null);
              setActiveLesson(l);
            }
          }}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            ELT Listening Module &middot; Integrated with Vocabulary Knowledge Base
          </span>
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span>Pedagogical Flow: Listen &rarr; Recognise &rarr; Understand &rarr; Dictation &rarr; Shadowing</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
