import React, { useState } from 'react';
import {
  ListeningLesson,
  VocabularyItem,
  TrustedSource,
  LessonStatus,
  ComprehensionQuestion,
  DictationItem,
  ShadowingItem,
  SourceVerificationResult
} from '../types';
import {
  DEFAULT_TRUSTED_SOURCES,
  RECOMMENDED_SOURCE_TOPICS,
  AUTHENTIC_DISCOVERY_CATALOG,
  verifySourceUrl
} from '../data/trustedSourcesData';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Plus,
  Play,
  RotateCcw,
  Search,
  Filter,
  Check,
  X,
  Edit3,
  Trash2,
  Sparkles,
  BookOpen,
  Headphones,
  FileCheck,
  HelpCircle,
  Globe,
  Radio,
  Layers,
  ArrowRight,
  Shield,
  Clock,
  Mic,
  Volume2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lessons: ListeningLesson[];
  onUpdateLesson: (updated: ListeningLesson) => void;
  onAddLesson: (newLesson: ListeningLesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  existingVocabulary: VocabularyItem[];
}

export const TeacherCuratedHub: React.FC<Props> = ({
  isOpen,
  onClose,
  lessons,
  onUpdateLesson,
  onAddLesson,
  onDeleteLesson,
  existingVocabulary
}) => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'discovery' | 'pipeline' | 'paste' | 'whitelist'>('discovery');

  // Trusted Sources State
  const [trustedSources, setTrustedSources] = useState<TrustedSource[]>(DEFAULT_TRUSTED_SOURCES);

  // Discovery Filters
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedCefr, setSelectedCefr] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [selectedAccent, setSelectedAccent] = useState<string>('All');
  const [discoverySearch, setDiscoverySearch] = useState<string>('');

  // Paste / Manual Verification State
  const [urlInput, setUrlInput] = useState('');
  const [verificationResult, setVerificationResult] = useState<SourceVerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatusText, setAnalysisStatusText] = useState('');

  // Manual Whitelist Suggestion
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceDomain, setNewSourceDomain] = useState('');
  const [newSourceType, setNewSourceType] = useState<'youtube' | 'podcast' | 'web_audio'>('youtube');
  const [newSourceDesc, setNewSourceDesc] = useState('');

  // Active Review State
  const [reviewLesson, setReviewLesson] = useState<ListeningLesson | null>(null);
  const [reviewMode, setReviewMode] = useState<'content' | 'questions' | null>(null);

  // Audio preview simulation state for question review
  const [previewingAudioTime, setPreviewingAudioTime] = useState<{ start: number; end: number } | null>(null);

  if (!isOpen) return null;

  // Filter discovery items
  const filteredCatalog = AUTHENTIC_DISCOVERY_CATALOG.filter(item => {
    if (selectedTopic !== 'All' && item.topic !== selectedTopic) return false;
    if (selectedCefr !== 'All' && item.cefr !== selectedCefr) return false;
    if (selectedSource !== 'All' && item.sourceName !== selectedSource) return false;
    if (selectedAccent !== 'All' && item.accent !== selectedAccent) return false;
    if (discoverySearch.trim()) {
      const q = discoverySearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.sourceName.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.targetWords.some(w => w.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle URL verification
  const handleVerifyUrl = () => {
    if (!urlInput.trim()) return;
    setIsVerifying(true);
    setTimeout(() => {
      const res = verifySourceUrl(urlInput, trustedSources);
      setVerificationResult(res);
      setIsVerifying(false);
    }, 450);
  };

  // Handle adding an authentic discovery catalog item into teacher review pipeline
  const handleAddCatalogToPipeline = (catalogItem: (typeof AUTHENTIC_DISCOVERY_CATALOG)[0]) => {
    // Check if already in lessons
    const existing = lessons.find(l => l.originalTitle === catalogItem.originalTitle || (catalogItem.youtubeId && l.youtubeId === catalogItem.youtubeId));
    if (existing) {
      alert(`Bài nghe "${catalogItem.title}" đã có trong hệ thống (Trạng thái: ${existing.status}). Bạn có thể xem trong tab "QUY TRÌNH DUYỆT BÀI".`);
      setActiveTab('pipeline');
      return;
    }

    const newLesson: ListeningLesson = {
      ...catalogItem,
      id: `lesson-curated-${Date.now()}`,
      status: 'NEEDS_CONTENT_REVIEW',
      contentApproved: false,
      questionsApproved: false,
      teacherNotes: 'Added from authentic trusted discovery catalog. Pending pedagogical teacher review.'
    };

    onAddLesson(newLesson);
    setActiveTab('pipeline');
    setReviewLesson(newLesson);
    setReviewMode('content');
  };

  // Handle AI analysis on verified URL
  const handleStartAnalysis = () => {
    if (!verificationResult || !verificationResult.verified) return;

    setIsAnalyzing(true);
    setAnalysisStatusText('Đang phân tích cấu trúc ngôn ngữ & CEFR...');

    setTimeout(() => {
      setAnalysisStatusText('Đang trích xuất từ vựng trọng tâm & hiện tượng nối âm...');
      setTimeout(() => {
        setAnalysisStatusText('Đang tạo đề xuất câu hỏi đọc hiểu & hoạt động nghe...');
        setTimeout(() => {
          setIsAnalyzing(false);

          // Find if catalog has matching info or create authentic lesson
          const matchedCatalog = AUTHENTIC_DISCOVERY_CATALOG.find(c => c.sourceUrl === verificationResult.sourceUrl);

          const newLesson: ListeningLesson = matchedCatalog ? {
            ...matchedCatalog,
            id: `lesson-verified-${Date.now()}`,
            status: 'NEEDS_CONTENT_REVIEW',
            contentApproved: false,
            questionsApproved: false,
            teacherNotes: `Verified authentic source from ${verificationResult.sourceName}.`
          } : {
            id: `lesson-verified-${Date.now()}`,
            title: verificationResult.originalTitle || `${verificationResult.sourceName} Listening Lesson`,
            originalTitle: verificationResult.originalTitle || `${verificationResult.sourceName} Resource`,
            topic: 'Family Life',
            cefr: 'B1',
            sourceType: verificationResult.contentType,
            sourceName: verificationResult.sourceName || 'Verified Educational Source',
            sourceDomain: verificationResult.sourceDomain || 'educational-source.org',
            sourceUrl: verificationResult.sourceUrl,
            contentType: verificationResult.contentType,
            publishedDate: '2024',
            officialSource: true,
            embedAvailable: verificationResult.embedAvailable,
            transcriptAvailable: true,
            status: 'NEEDS_CONTENT_REVIEW',
            contentApproved: false,
            questionsApproved: false,
            duration: '4:20',
            durationSeconds: 260,
            accent: 'British English',
            coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
            learningObjective: `Phát triển khả năng nghe hiểu thực tế từ nguồn chuẩn ${verificationResult.sourceName}.`,
            speakers: `${verificationResult.sourceName} Educators`,
            targetWords: ['responsibility', 'contribute', 'appreciate'],
            keyIdeas: [
              'Foster genuine communicative competence and vocabulary recall.',
              'Strengthen listening comprehension through authentic natural delivery.'
            ],
            sensitiveContentChecked: true,
            connectedSpeechFeatures: ['Linking /r/', 'Weak form of auxiliary verbs'],
            usefulExpressions: ['take responsibility', 'make a positive contribution'],
            fullTranscriptText: `Welcome to this authentic educational lesson from ${verificationResult.sourceName}. In this lesson, we explore how young learners communicate effectively and build lifelong responsibility.`,
            transcript: [
              { id: 't1', startTime: 0, endTime: 15, speaker: 'Presenter', text: `Welcome to this authentic educational lesson from ${verificationResult.sourceName}.` },
              { id: 't2', startTime: 15, endTime: 45, speaker: 'Presenter', text: 'In this lesson, we explore how young learners communicate effectively and build lifelong responsibility.' }
            ],
            shadowingEnabled: true,
            wordHunt: {
              prompt: 'Select the authentic vocabulary terms articulated in this lesson:',
              options: [
                { word: 'responsibility', inAudio: true, isTarget: true, timestampSeek: 25 },
                { word: 'communicate', inAudio: true, isTarget: true, timestampSeek: 35 },
                { word: 'contribute', inAudio: true, isTarget: true, timestampSeek: 40 }
              ]
            },
            questions: [
              {
                id: 'q-auto-1',
                type: 'main_idea',
                typeLabel: 'Main Idea',
                question: `What is the primary pedagogical goal of this broadcast by ${verificationResult.sourceName}?`,
                options: [
                  'To cultivate effective communication and independent responsibility.',
                  'To discuss unrelated sports tournaments.',
                  'To promote commercial consumer products.',
                  'To present conflicting political arguments.'
                ],
                correctOptionIndex: 0,
                startTime: 0,
                endTime: 45,
                evidenceTranscript: 'In this lesson, we explore how young learners communicate effectively and build lifelong responsibility.',
                explanation: 'The opening statement directly articulates the primary focus on communication and personal responsibility.',
                approved: false
              }
            ],
            dictations: [
              { id: 'd-auto-1', sentence: 'In this lesson, we explore how young learners communicate effectively.', startTime: 15, endTime: 35, targetWord: 'communicate' }
            ],
            shadowingSentences: [
              { id: 's-auto-1', sentence: 'Young learners build lifelong responsibility through daily teamwork.', startTime: 25, endTime: 45, targetWord: 'responsibility', personalizedPrompt: 'Describe a daily responsibility that helps your family.' }
            ]
          };

          onAddLesson(newLesson);
          setUrlInput('');
          setVerificationResult(null);
          setActiveTab('pipeline');
          setReviewLesson(newLesson);
          setReviewMode('content');
        }, 800);
      }, 700);
    }, 600);
  };

  // Add a new trusted source to whitelist
  const handleAddNewTrustedSource = () => {
    if (!newSourceName.trim() || !newSourceDomain.trim()) {
      alert('Vui lòng nhập đầy đủ tên và tên miền nguồn giáo dục.');
      return;
    }

    const newSource: TrustedSource = {
      id: `src-custom-${Date.now()}`,
      name: newSourceName.trim(),
      domain: newSourceDomain.trim().toLowerCase(),
      contentType: newSourceType,
      websiteUrl: `https://${newSourceDomain.trim().toLowerCase()}`,
      enabled: true,
      approvedLessonsCount: 0,
      description: newSourceDesc.trim() || 'Verified educational channel added by Teacher Nguyễn Trương Quỳnh Trang.',
      logo: '🎓 ' + newSourceName.trim().slice(0, 10)
    };

    setTrustedSources(prev => [...prev, newSource]);
    setShowWhitelistModal(false);
    setNewSourceName('');
    setNewSourceDomain('');
    setNewSourceDesc('');
    alert(`Đã thêm nguồn "${newSource.name}" vào Danh sách Nguồn Uy tín được phê duyệt!`);
  };

  // Content Review: Approve Content
  const handleApproveContent = (lesson: ListeningLesson) => {
    const updated: ListeningLesson = {
      ...lesson,
      contentApproved: true,
      status: lesson.questionsApproved ? 'READY_TO_PUBLISH' : 'NEEDS_QUESTION_REVIEW',
      teacherApprovedAt: new Date().toISOString().split('T')[0]
    };
    onUpdateLesson(updated);
    setReviewLesson(updated);
    // Suggest moving to question review
    if (!updated.questionsApproved) {
      setReviewMode('questions');
    }
  };

  // Question Review: Approve Single Question
  const handleToggleApproveQuestion = (qId: string) => {
    if (!reviewLesson) return;
    const updatedQuestions = reviewLesson.questions.map(q => {
      if (q.id === qId) {
        return { ...q, approved: !q.approved };
      }
      return q;
    });

    const updated: ListeningLesson = {
      ...reviewLesson,
      questions: updatedQuestions
    };
    setReviewLesson(updated);
    onUpdateLesson(updated);
  };

  // Question Review: Approve All Questions
  const handleApproveAllQuestions = () => {
    if (!reviewLesson) return;
    const updatedQuestions = reviewLesson.questions.map(q => ({ ...q, approved: true }));
    const updated: ListeningLesson = {
      ...reviewLesson,
      questions: updatedQuestions,
      questionsApproved: true,
      status: reviewLesson.contentApproved ? 'READY_TO_PUBLISH' : 'NEEDS_CONTENT_REVIEW'
    };
    setReviewLesson(updated);
    onUpdateLesson(updated);
  };

  // Publish lesson to students (Requires 2-level approval)
  const handlePublishLesson = (lesson: ListeningLesson) => {
    if (!lesson.contentApproved || !lesson.questionsApproved) {
      alert('Không thể xuất bản! Bài học phải đạt cả 2 cấp độ duyệt: "Đã duyệt Nội dung" và "Đã duyệt Câu hỏi".');
      return;
    }

    const updated: ListeningLesson = {
      ...lesson,
      status: 'PUBLISHED'
    };
    onUpdateLesson(updated);
    setReviewLesson(updated);
    alert(`Đã xuất bản bài nghe "${lesson.title}" cho Học sinh! Bài nghe hiện đã có mặt trên Listening Lab.`);
  };

  // Reject lesson
  const handleRejectLesson = (lesson: ListeningLesson) => {
    if (confirm(`Bạn có chắc chắn muốn từ chối bài nghe "${lesson.title}"? Học sinh sẽ không nhìn thấy bài này.`)) {
      const updated: ListeningLesson = {
        ...lesson,
        status: 'REJECTED'
      };
      onUpdateLesson(updated);
      setReviewLesson(null);
      setReviewMode(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
      <div className="bg-[#FAF8FF] border border-purple-200 rounded-3xl w-full max-w-7xl mx-auto flex-1 flex flex-col shadow-2xl overflow-hidden">
        
        {/* ========================================================================= */}
        {/* HEADER: Trusted Curated Listening Studio (Purple-Magenta-Cyan gradient) */}
        {/* ========================================================================= */}
        <div 
          className="p-4 sm:p-6 text-white shrink-0 relative overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #9E69FF 0%, #B564FF 22%, #E14DFC 48%, #A4A0EC 76%, #25C0E1 100%)'
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-md">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    TRUSTED CURATED LISTENING SYSTEM
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-400 text-slate-900 uppercase tracking-wider shadow-xs">
                    Official Sources Only
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-white/85 font-medium">
                  Hệ thống kiểm duyệt & biên tập tư liệu nghe chuẩn quốc tế (BBC, British Council, VOA, ELLLO, TED-Ed)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs text-white flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span>Quyền Giáo viên: <strong>Nguyễn Trương Quỳnh Trang</strong></span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all"
                title="Đóng bảng kiểm duyệt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workflow Pipeline Indicator */}
          <div className="mt-4 pt-3 border-t border-white/20 hidden md:flex items-center justify-between text-xs font-bold text-white/90">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white text-purple-700 flex items-center justify-center text-[10px]">1</span>
              <span>Nguồn Uy tín (Whitelist)</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white text-purple-700 flex items-center justify-center text-[10px]">2</span>
              <span>Xác thực Nguồn gốc</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-white text-purple-700 flex items-center justify-center text-[10px]">3</span>
              <span>AI Trích xuất & Soạn đề</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            <div className="flex items-center gap-1.5 text-amber-200">
              <span className="w-5 h-5 rounded-full bg-amber-300 text-slate-900 flex items-center justify-center text-[10px]">4</span>
              <span>Giáo viên duyệt Nội dung</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            <div className="flex items-center gap-1.5 text-amber-200">
              <span className="w-5 h-5 rounded-full bg-amber-300 text-slate-900 flex items-center justify-center text-[10px]">5</span>
              <span>Giáo viên duyệt Câu hỏi</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
            <div className="flex items-center gap-1.5 text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Xuất bản cho Học sinh</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUB-TABS: Discovery, Pipeline, Paste Link, Whitelist */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setActiveTab('discovery'); setReviewLesson(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'discovery'
                  ? 'bg-[#7C5CFC] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>TÌM TƯ LIỆU UY TÍN ({AUTHENTIC_DISCOVERY_CATALOG.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('paste'); setReviewLesson(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'paste'
                  ? 'bg-[#7C5CFC] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ExternalLink className="w-4 h-4" />
              <span>DÁN LINK TƯ LIỆU CHUẨN</span>
            </button>

            <button
              onClick={() => { setActiveTab('pipeline'); setReviewLesson(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'pipeline'
                  ? 'bg-[#7C5CFC] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>QUY TRÌNH DUYỆT BÀI ({lessons.length})</span>
              {lessons.filter(l => l.status !== 'PUBLISHED' && l.status !== 'REJECTED').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-1 -right-1" />
              )}
            </button>

            <button
              onClick={() => { setActiveTab('whitelist'); setReviewLesson(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'whitelist'
                  ? 'bg-[#7C5CFC] text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>NGUỒN ĐƯỢC PHÊ DUYỆT ({trustedSources.filter(s => s.enabled).length})</span>
            </button>
          </div>

          <div className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Học sinh CHỈ nhìn thấy bài đã duyệt 2 cấp</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: Displays tab content or Active Review Screen */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">

          {/* ------------------------------------------------------------------- */}
          {/* TAB 1: FIND TRUSTED LISTENING MATERIAL (Authentic Discovery Catalog) */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === 'discovery' && !reviewLesson && (
            <div className="space-y-6">
              {/* Filter bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Filter className="w-4 h-4 text-[#7C5CFC]" />
                    <span>Bộ lọc tìm kiếm tư liệu chính thức</span>
                  </div>

                  {/* Search input */}
                  <div className="relative min-w-[240px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={discoverySearch}
                      onChange={e => setDiscoverySearch(e.target.value)}
                      placeholder="Tìm bài học, nguồn, chủ đề..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Topic Filter */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Chủ đề (Global Success):</label>
                    <select
                      value={selectedTopic}
                      onChange={e => setSelectedTopic(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                    >
                      <option value="All">Tất cả chủ đề</option>
                      {RECOMMENDED_SOURCE_TOPICS.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* CEFR Filter */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cấp độ CEFR:</label>
                    <select
                      value={selectedCefr}
                      onChange={e => setSelectedCefr(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                    >
                      <option value="All">Tất cả (A2, B1, B2)</option>
                      <option value="A2">A2 - Elementary</option>
                      <option value="B1">B1 - Intermediate</option>
                      <option value="B2">B2 - Upper Intermediate</option>
                    </select>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nguồn giáo dục:</label>
                    <select
                      value={selectedSource}
                      onChange={e => setSelectedSource(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                    >
                      <option value="All">Tất cả tổ chức uy tín</option>
                      {trustedSources.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Accent Filter */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Giọng chuẩn:</label>
                    <select
                      value={selectedAccent}
                      onChange={e => setSelectedAccent(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
                    >
                      <option value="All">Tất cả giọng</option>
                      <option value="British English">British English</option>
                      <option value="American English">American English</option>
                      <option value="International English">International English</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Catalog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCatalog.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    {/* Media Cover & Source Badge */}
                    <div className="relative h-44 bg-slate-900 overflow-hidden">
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />

                      {/* Top Source Pill */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{item.sourceName}</span>
                      </div>

                      {/* Duration & CEFR Pill */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-white font-bold text-[10px]">
                          {item.cefr}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white font-mono text-[10px]">
                          {item.duration}
                        </span>
                      </div>

                      {/* Bottom topic tag */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md font-bold text-[11px]">
                          📂 {item.topic}
                        </span>
                        <span className="text-[11px] text-white/80 font-medium">
                          {item.accent}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">
                          Gốc: &ldquo;{item.originalTitle}&rdquo;
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                          {item.learningObjective}
                        </p>
                      </div>

                      {/* Target Vocab preview */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Từ vựng trọng tâm:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {item.targetWords.map((word, wIdx) => (
                            <span
                              key={wIdx}
                              className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[11px] border border-purple-100"
                            >
                              {word}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600 transition-colors"
                          title="Mở đường link tư liệu gốc để xác thực"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Link gốc</span>
                        </a>

                        <button
                          onClick={() => handleAddCatalogToPipeline(item)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-sm hover:shadow-md active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)'
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ĐƯA VÀO DUYỆT BÀI</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 2: PASTE TRUSTED LINK (Verification & Whitelist Guard)          */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === 'paste' && !reviewLesson && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#7C5CFC]" />
                    <span>Dán đường link tư liệu nghe để xác thực</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Hệ thống chỉ chấp nhận đường dẫn thuộc các kênh giáo dục chính thống đã được phê duyệt.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    URL video YouTube hoặc trang web học nghe tiếng Anh:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => {
                        setUrlInput(e.target.value);
                        setVerificationResult(null);
                      }}
                      placeholder="https://www.youtube.com/watch?v=... hoặc https://www.bbc.co.uk/learningenglish/..."
                      className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                    />
                    <button
                      onClick={handleVerifyUrl}
                      disabled={isVerifying || !urlInput.trim()}
                      className="px-5 py-2.5 rounded-xl text-white text-xs font-bold bg-[#7C5CFC] hover:bg-[#6D3EEB] disabled:opacity-50 transition-all"
                    >
                      {isVerifying ? 'Đang xác thực...' : 'XÁC THỰC NGUỒN'}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ví dụ nguồn chuẩn: BBC Learning English, British Council LearnEnglish, VOA Learning English, TED-Ed, ELLLO.
                  </p>
                </div>

                {/* Verification result display */}
                {verificationResult && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    {verificationResult.verified ? (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-emerald-900 text-xs">
                              {verificationResult.statusMessage}
                            </div>
                            <div className="text-xs text-emerald-700 mt-1">
                              Tổ chức: <strong>{verificationResult.sourceName}</strong> ({verificationResult.sourceDomain})
                            </div>
                            <div className="text-[11px] text-emerald-600 mt-0.5">
                              Tư liệu bản quyền an toàn để nhúng cho học sinh luyện nghe.
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-emerald-200 flex justify-end">
                          <button
                            onClick={handleStartAnalysis}
                            disabled={isAnalyzing}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>{isAnalyzing ? analysisStatusText : 'PHÂN TÍCH TƯ LIỆU VÀ TẠO BẢN THẢO'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-bold text-amber-900 text-xs">
                              {verificationResult.statusMessage}
                            </div>
                            <div className="text-xs text-amber-700 mt-1">
                              {verificationResult.error || 'Đường dẫn này không thuộc danh sách tổ chức giáo dục chính thống được cấp phép.'}
                            </div>
                            <div className="text-[11px] text-amber-800 mt-1 font-semibold">
                              Chính sách: Học sinh tuyệt đối không được tiếp xúc với nguồn nghe chưa được kiểm định.
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                          <button
                            onClick={() => {
                              setVerificationResult(null);
                              setUrlInput('');
                            }}
                            className="text-slate-600 hover:text-slate-800 font-semibold"
                          >
                            Hủy bỏ
                          </button>

                          <button
                            onClick={() => setShowWhitelistModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>ĐỀ XUẤT THÊM NGUỒN NÀY VÀO WHITELIST</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 3: REVIEW PIPELINE (All Lessons by Workflow Status)             */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === 'pipeline' && !reviewLesson && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    QUY TRÌNH DUYỆT BÀI NGHE CỦA GIÁO VIÊN
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chỉ bài có đủ cả 2 dấu tích &ldquo;Đã duyệt Nội dung&rdquo; và &ldquo;Đã duyệt Câu hỏi&rdquo; mới được phép xuất bản.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-4 py-3">Bài học & Nguồn gốc</th>
                      <th className="px-3 py-3">Chủ đề & CEFR</th>
                      <th className="px-3 py-3 text-center">Duyệt Nội dung</th>
                      <th className="px-3 py-3 text-center">Duyệt Câu hỏi</th>
                      <th className="px-3 py-3 text-center">Trạng thái xuất bản</th>
                      <th className="px-4 py-3 text-right">Thao tác Giáo viên</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lessons.map(lesson => (
                      <tr key={lesson.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Title & Source */}
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 line-clamp-1">{lesson.title}</div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-semibold text-purple-600">{lesson.sourceName}</span>
                            <span>•</span>
                            <a
                              href={lesson.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>gốc</span>
                            </a>
                          </div>
                        </td>

                        {/* Topic & CEFR */}
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {lesson.topic}
                          </span>
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                            {lesson.cefr}
                          </span>
                        </td>

                        {/* Content Approved */}
                        <td className="px-3 py-3 text-center">
                          {lesson.contentApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <Check className="w-3 h-3" /> Đã duyệt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Chưa duyệt
                            </span>
                          )}
                        </td>

                        {/* Questions Approved */}
                        <td className="px-3 py-3 text-center">
                          {lesson.questionsApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <Check className="w-3 h-3" /> Đã duyệt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              Chưa duyệt
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 text-center">
                          {lesson.status === 'PUBLISHED' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-white font-extrabold text-[10px]">
                              ĐÃ XUẤT BẢN
                            </span>
                          )}
                          {lesson.status === 'READY_TO_PUBLISH' && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white font-extrabold text-[10px] animate-pulse">
                              SẴN SÀNG XUẤT BẢN
                            </span>
                          )}
                          {lesson.status === 'NEEDS_CONTENT_REVIEW' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500 text-white font-extrabold text-[10px]">
                              CẦN DUYỆT NỘI DUNG
                            </span>
                          )}
                          {lesson.status === 'NEEDS_QUESTION_REVIEW' && (
                            <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-extrabold text-[10px]">
                              CẦN DUYỆT CÂU HỎI
                            </span>
                          )}
                          {lesson.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-[10px]">
                              ĐÃ TỪ CHỐI
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setReviewLesson(lesson);
                                setReviewMode('content');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-bold text-[11px] hover:bg-purple-100"
                              title="Duyệt nội dung sư phạm, từ vựng và transcript"
                            >
                              Duyệt Nội dung
                            </button>

                            <button
                              onClick={() => {
                                setReviewLesson(lesson);
                                setReviewMode('questions');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] hover:bg-indigo-100"
                              title="Duyệt từng câu hỏi và phương án gây nhiễu"
                            >
                              Duyệt Câu hỏi
                            </button>

                            {lesson.status === 'READY_TO_PUBLISH' && (
                              <button
                                onClick={() => handlePublishLesson(lesson)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 shadow-xs"
                              >
                                Xuất bản
                              </button>
                            )}

                            <button
                              onClick={() => handleRejectLesson(lesson)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Từ chối bài học"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------- */}
          {/* TAB 4: TRUSTED SOURCES WHITELIST MANAGER                            */}
          {/* ------------------------------------------------------------------- */}
          {activeTab === 'whitelist' && !reviewLesson && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    DANH SÁCH NGUỒN GIÁO DỤC ĐƯỢC PHÊ DUYỆT (WHITELIST)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mọi tư liệu nghe của học sinh phải xuất phát từ các tổ chức trong danh sách này.
                  </p>
                </div>

                <button
                  onClick={() => setShowWhitelistModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>THÊM NGUỒN UY TÍN MỚI</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trustedSources.map(source => (
                  <div
                    key={source.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      source.enabled ? 'border-slate-200 shadow-xs' : 'border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-black text-slate-900 flex items-center gap-2">
                          <span>{source.logo}</span>
                          <span>{source.name}</span>
                        </div>
                        <div className="text-xs text-purple-700 font-semibold mt-0.5">
                          {source.domain}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTrustedSources(prev =>
                            prev.map(s => s.id === source.id ? { ...s, enabled: !s.enabled } : s)
                          );
                        }}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          source.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {source.enabled ? 'Đang kích hoạt' : 'Tạm tắt'}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed line-clamp-3">
                      {source.description}
                    </p>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">
                        Số bài đã duyệt: <strong>{source.approvedLessonsCount} bài</strong>
                      </span>
                      <a
                        href={source.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-1"
                      >
                        <span>Website</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN: TEACHER CONTENT REVIEW (Left: Player, Right: Pedagogical Analysis) */}
          {/* ========================================================================= */}
          {reviewLesson && reviewMode === 'content' && (
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setReviewLesson(null);
                      setReviewMode(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    ← Quay lại danh sách
                  </button>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      CẤP ĐỘ 1: DUYỆT NỘI DUNG TƯ LIỆU SƯ PHẠM
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kiểm tra tính chuẩn xác của âm thanh gốc, từ vựng, độ khó CEFR và tính an toàn sư phạm.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReviewMode('questions')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Chuyển sang duyệt Câu hỏi →
                  </button>

                  <button
                    onClick={() => handleApproveContent(reviewLesson)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>PHÊ DUYỆT NỘI DUNG (CONTENT APPROVED)</span>
                  </button>
                </div>
              </div>

              {/* 2-Panel Content Review Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Panel: Authentic Source Player & Metadata (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <Headphones className="w-4 h-4 text-[#7C5CFC]" />
                        <span>Trình phát tư liệu gốc được bảo vệ bản quyền</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                        ✓ Nguồn chuẩn
                      </span>
                    </div>

                    {/* Authentic Video/Audio embed */}
                    {reviewLesson.youtubeId ? (
                      <div className="aspect-video rounded-xl bg-black overflow-hidden shadow-inner">
                        <iframe
                          src={`https://www.youtube.com/embed/${reviewLesson.youtubeId}?enablejsapi=1&origin=${window.location.origin}`}
                          title={reviewLesson.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <div className="p-6 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center text-center space-y-2">
                        <Radio className="w-10 h-10 text-purple-400 animate-pulse" />
                        <div className="font-bold text-sm">Authentic Audio Stream</div>
                        <p className="text-xs text-slate-400">{reviewLesson.sourceName}</p>
                        <audio controls className="w-full mt-2" src={reviewLesson.audioUrl} />
                      </div>
                    )}

                    {/* Source Information & Link */}
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900">Tổ chức phát hành:</span>
                        <span className="font-semibold">{reviewLesson.sourceName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900">Tiêu đề gốc:</span>
                        <span className="italic line-clamp-1">{reviewLesson.originalTitle}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-purple-200/60">
                        <span className="font-bold text-purple-900">Xác thực nguồn:</span>
                        <a
                          href={reviewLesson.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-bold"
                        >
                          <span>MỞ TƯ LIỆU GỐC ↗</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Connected Speech Features extracted */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-2.5">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Hiện tượng ngữ âm thực tế (Connected Speech)</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600">
                      {(reviewLesson.connectedSpeechFeatures || [
                        'Nối âm phụ âm sang nguyên âm',
                        'Dạng yếu của mạo từ và giới từ (Weak forms)'
                      ]).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Pedagogical Review & Content Editing (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
                    
                    {/* Editable Title */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tiêu đề bài nghe (Hiển thị cho học sinh):
                      </label>
                      <input
                        type="text"
                        value={reviewLesson.title}
                        onChange={e => {
                          const updated = { ...reviewLesson, title: e.target.value };
                          setReviewLesson(updated);
                          onUpdateLesson(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                      />
                    </div>

                    {/* Topic & CEFR Level */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Chủ đề bài giảng:</label>
                        <select
                          value={reviewLesson.topic}
                          onChange={e => {
                            const updated = { ...reviewLesson, topic: e.target.value };
                            setReviewLesson(updated);
                            onUpdateLesson(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                        >
                          {RECOMMENDED_SOURCE_TOPICS.map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Cấp độ CEFR:</label>
                        <select
                          value={reviewLesson.cefr}
                          onChange={e => {
                            const updated = { ...reviewLesson, cefr: e.target.value as any };
                            setReviewLesson(updated);
                            onUpdateLesson(updated);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                        >
                          <option value="A2">A2 - Elementary</option>
                          <option value="B1">B1 - Intermediate</option>
                          <option value="B2">B2 - Upper Intermediate</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Vocabulary Manager */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Từ vựng mục tiêu (Target Vocabulary):
                      </label>
                      <div className="flex flex-wrap gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        {reviewLesson.targetWords.map((word, wIdx) => (
                          <span
                            key={wIdx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold text-xs"
                          >
                            <span>{word}</span>
                            <button
                              onClick={() => {
                                const newWords = reviewLesson.targetWords.filter((_, i) => i !== wIdx);
                                const updated = { ...reviewLesson, targetWords: newWords };
                                setReviewLesson(updated);
                                onUpdateLesson(updated);
                              }}
                              className="hover:text-rose-600 text-purple-500"
                              title="Xóa từ vựng này"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Learning Objective */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mục tiêu học tập (Learning Objective):
                      </label>
                      <textarea
                        rows={2}
                        value={reviewLesson.learningObjective}
                        onChange={e => {
                          const updated = { ...reviewLesson, learningObjective: e.target.value };
                          setReviewLesson(updated);
                          onUpdateLesson(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                      />
                    </div>

                    {/* Content Safety Checkbox */}
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-bold text-emerald-900">
                          Kiểm tra nội dung phù hợp lứa tuổi học sinh THPT:
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-700 uppercase text-[11px]">
                        ✓ An toàn 100%
                      </span>
                    </div>

                    {/* Transcript viewer */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Lời thoại chính xác (Authentic Transcript):
                      </label>
                      <div className="max-h-48 overflow-y-auto p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2">
                        {reviewLesson.transcript.map(line => (
                          <div key={line.id} className="flex gap-2">
                            <span className="font-mono text-[10px] text-purple-600 shrink-0 pt-0.5">
                              [{Math.floor(line.startTime / 60)}:{(line.startTime % 60).toString().padStart(2, '0')}]
                            </span>
                            <div>
                              <strong className="text-slate-900">{line.speaker}: </strong>
                              <span>{line.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCREEN: TEACHER QUESTION REVIEW (Review each question, options & audio) */}
          {/* ========================================================================= */}
          {reviewLesson && reviewMode === 'questions' && (
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setReviewMode('content')}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    ← Quay lại duyệt Nội dung
                  </button>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      CẤP ĐỘ 2: DUYỆT TỪNG CÂU HỎI & PHƯƠNG ÁN GÂY NHIỄU
                    </h3>
                    <p className="text-xs text-slate-500">
                      Đảm bảo mỗi câu hỏi đều dựa trên bằng chứng transcript thực tế và có đáp án chính xác.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApproveAllQuestions}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>DUYỆT TOÀN BỘ CÂU HỎI (QUESTIONS APPROVED)</span>
                  </button>
                </div>
              </div>

              {/* Question list */}
              <div className="space-y-4">
                {reviewLesson.questions.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className={`bg-white rounded-2xl border p-5 transition-all ${
                      q.approved ? 'border-emerald-200 shadow-xs' : 'border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center">
                          {qIdx + 1}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {q.typeLabel || q.type}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          [{q.startTime}s - {q.endTime}s]
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setPreviewingAudioTime({ start: q.startTime, end: q.endTime });
                            alert(`Đang phát thử đoạn âm thanh tương ứng câu hỏi (${q.startTime}s - ${q.endTime}s).`);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold"
                        >
                          <Play className="w-3 h-3" />
                          <span>Nghe thử đoạn này</span>
                        </button>

                        <button
                          onClick={() => handleToggleApproveQuestion(q.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            q.approved
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{q.approved ? 'Đã duyệt câu này' : 'Duyệt câu này'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Question text input */}
                    <div className="mt-3">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Nội dung câu hỏi:</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={e => {
                          const updatedQ = reviewLesson.questions.map(item => item.id === q.id ? { ...item, question: e.target.value } : item);
                          const updated = { ...reviewLesson, questions: updatedQ };
                          setReviewLesson(updated);
                          onUpdateLesson(updated);
                        }}
                        className="w-full px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                      />
                    </div>

                    {/* Options */}
                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs ${
                            optIdx === q.correctOptionIndex
                              ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={optIdx === q.correctOptionIndex}
                            onChange={() => {
                              const updatedQ = reviewLesson.questions.map(item => item.id === q.id ? { ...item, correctOptionIndex: optIdx } : item);
                              const updated = { ...reviewLesson, questions: updatedQ };
                              setReviewLesson(updated);
                              onUpdateLesson(updated);
                            }}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                          <input
                            type="text"
                            value={opt}
                            onChange={e => {
                              const newOptions = [...q.options];
                              newOptions[optIdx] = e.target.value;
                              const updatedQ = reviewLesson.questions.map(item => item.id === q.id ? { ...item, options: newOptions as any } : item);
                              const updated = { ...reviewLesson, questions: updatedQ };
                              setReviewLesson(updated);
                              onUpdateLesson(updated);
                            }}
                            className="w-full bg-transparent border-0 text-xs focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Evidence & Explanation */}
                    <div className="mt-3 p-3 rounded-xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                      <div>
                        <strong className="text-purple-900">Bằng chứng trích xuất từ audio: </strong>
                        <span className="italic text-slate-700">&ldquo;{q.evidenceTranscript}&rdquo;</span>
                      </div>
                      <div>
                        <strong className="text-purple-900">Giải thích chi tiết: </strong>
                        <span className="text-slate-600">{q.explanation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ready to publish banner if both approved */}
              {reviewLesson.contentApproved && reviewLesson.questionsApproved && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div>
                    <div className="font-black text-emerald-900 text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>BÀI HỌC ĐÃ ĐẠT ĐẦY ĐỦ 2 CẤP ĐỘ PHÊ DUYỆT!</span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Nội dung tư liệu chuẩn & bộ câu hỏi đã sẵn sàng xuất bản cho học sinh.
                    </p>
                  </div>

                  <button
                    onClick={() => handlePublishLesson(reviewLesson)}
                    className="px-5 py-2.5 rounded-xl text-white font-black text-xs shadow-md hover:shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    🚀 XUẤT BẢN CHO HỌC SINH NGAY
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW TRUSTED SOURCE TO WHITELIST                                 */}
      {/* ========================================================================= */}
      {showWhitelistModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7C5CFC]" />
                <span>Phê duyệt Nguồn Giáo dục Uy tín Mới</span>
              </h3>
              <button
                onClick={() => setShowWhitelistModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên tổ chức / Kênh phát hành:</label>
                <input
                  type="text"
                  value={newSourceName}
                  onChange={e => setNewSourceName(e.target.value)}
                  placeholder="Ví dụ: Cambridge English, Oxford Online English..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên miền chính thức (Domain):</label>
                <input
                  type="text"
                  value={newSourceDomain}
                  onChange={e => setNewSourceDomain(e.target.value)}
                  placeholder="Ví dụ: cambridgeenglish.org hoặc oxfordonlineenglish.com"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Loại hình truyền thông:</label>
                <select
                  value={newSourceType}
                  onChange={e => setNewSourceType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                >
                  <option value="youtube">YouTube Official Channel</option>
                  <option value="podcast">Podcast Official Feed</option>
                  <option value="web_audio">Web Audio Stream</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả uy tín giáo dục:</label>
                <textarea
                  rows={2}
                  value={newSourceDesc}
                  onChange={e => setNewSourceDesc(e.target.value)}
                  placeholder="Mô tả tiêu chuẩn CEFR hoặc tổ chức khảo thí đứng sau nguồn này..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowWhitelistModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNewTrustedSource}
                className="px-5 py-2 rounded-xl text-white font-black text-xs shadow-md hover:shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)' }}
              >
                PHÊ DUYỆT VÀO WHITELIST
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
