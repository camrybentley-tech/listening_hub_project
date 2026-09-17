import React, { useState } from 'react';
import { ListeningLesson, VocabularyItem } from '../types';
import { 
  Play, 
  Youtube, 
  Radio, 
  Clock, 
  Globe2, 
  Sparkles, 
  Search, 
  BookMarked, 
  Film,
  GraduationCap,
  Headphones,
  Compass,
  Volume2,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Check,
  FileCheck
} from 'lucide-react';

interface Props {
  lessons: ListeningLesson[];
  vocabulary: VocabularyItem[];
  onStartLesson: (lessonId: string) => void;
  onSelectWordForContext: (word: VocabularyItem) => void;
  onOpenTeacherModal?: () => void;
  userRole?: 'student' | 'teacher';
  onOpenCuratedHub?: () => void;
  onToggleRole?: () => void;
}

const TOPIC_PRESETS = [
  'All',
  'Family Life',
  'Family Values',
  'Household Chores',
  'Parents and Children',
  'Responsibility',
  'Gratitude',
  'Healthy Lifestyle',
  'School Life',
  'Environment',
  'Friendship & Empathy',
  'Determination & Growth',
  'Communication & Society',
  'Science & Dreams',
  'Technology'
];

interface TopicPalette {
  activeStyle: React.CSSProperties;
  inactive: string;
  badgeActive: string;
  badgeInactive: string;
  tag: string;
  cardStrip: string;
}

const TOPIC_STYLES: Record<string, TopicPalette> = {
  All: {
    activeStyle: {
      background: 'linear-gradient(135deg, #7C5CFC 0%, #B85BFA 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #5838cc, 0 6px 14px rgba(124, 92, 252, 0.35)'
    },
    inactive: 'bg-purple-50 text-[#6D3EEB] border border-purple-200 hover:bg-purple-100 hover:border-purple-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-purple-200/90 text-[#5838cc] font-extrabold',
    tag: 'bg-[#F3EEFF] text-[#6D3EEB] border-[#DDD6FE]',
    cardStrip: 'linear-gradient(90deg, #7C5CFC, #B85BFA, #25C0E1)'
  },
  'Family Life': {
    activeStyle: {
      background: 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #be185d, 0 6px 14px rgba(236, 72, 153, 0.35)'
    },
    inactive: 'bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 hover:border-pink-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-pink-200/90 text-pink-800 font-extrabold',
    tag: 'bg-pink-50 text-pink-700 border-pink-200',
    cardStrip: 'linear-gradient(90deg, #EC4899, #F43F5E)'
  },
  'Family Values': {
    activeStyle: {
      background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #6d28d9, 0 6px 14px rgba(139, 92, 246, 0.35)'
    },
    inactive: 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 hover:border-violet-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-violet-200/90 text-violet-800 font-extrabold',
    tag: 'bg-violet-50 text-violet-700 border-violet-200',
    cardStrip: 'linear-gradient(90deg, #8B5CF6, #A855F7)'
  },
  'Household Chores': {
    activeStyle: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #b45309, 0 6px 14px rgba(245, 158, 11, 0.35)'
    },
    inactive: 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-amber-200/90 text-amber-950 font-extrabold',
    tag: 'bg-amber-50 text-amber-800 border-amber-200',
    cardStrip: 'linear-gradient(90deg, #F59E0B, #EA580C)'
  },
  'Parents and Children': {
    activeStyle: {
      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #4338ca, 0 6px 14px rgba(99, 102, 241, 0.35)'
    },
    inactive: 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-indigo-200/90 text-indigo-900 font-extrabold',
    tag: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    cardStrip: 'linear-gradient(90deg, #6366F1, #8B5CF6)'
  },
  'Responsibility': {
    activeStyle: {
      background: 'linear-gradient(135deg, #10B981 0%, #06B6D4 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #047857, 0 6px 14px rgba(16, 185, 129, 0.35)'
    },
    inactive: 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-emerald-200/90 text-emerald-950 font-extrabold',
    tag: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    cardStrip: 'linear-gradient(90deg, #10B981, #06B6D4)'
  },
  'Gratitude': {
    activeStyle: {
      background: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #be123c, 0 6px 14px rgba(244, 63, 94, 0.35)'
    },
    inactive: 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 hover:border-rose-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-rose-200/90 text-rose-900 font-extrabold',
    tag: 'bg-rose-50 text-rose-700 border-rose-200',
    cardStrip: 'linear-gradient(90deg, #F43F5E, #FB7185)'
  },
  'Healthy Lifestyle': {
    activeStyle: {
      background: 'linear-gradient(135deg, #06B6D4 0%, #0284C7 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #0e7490, 0 6px 14px rgba(6, 182, 212, 0.35)'
    },
    inactive: 'bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 hover:border-cyan-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-cyan-200/90 text-cyan-950 font-extrabold',
    tag: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    cardStrip: 'linear-gradient(90deg, #06B6D4, #0284C7)'
  },
  'School Life': {
    activeStyle: {
      background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #1d4ed8, 0 6px 14px rgba(59, 130, 246, 0.35)'
    },
    inactive: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-blue-200/90 text-blue-900 font-extrabold',
    tag: 'bg-blue-50 text-blue-700 border-blue-200',
    cardStrip: 'linear-gradient(90deg, #3B82F6, #6366F1)'
  },
  'Environment': {
    activeStyle: {
      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #047857, 0 6px 14px rgba(5, 150, 105, 0.35)'
    },
    inactive: 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 hover:border-teal-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-teal-200/90 text-teal-950 font-extrabold',
    tag: 'bg-teal-50 text-teal-800 border-teal-200',
    cardStrip: 'linear-gradient(90deg, #059669, #10B981)'
  },
  'Friendship & Empathy': {
    activeStyle: {
      background: 'linear-gradient(135deg, #D946EF 0%, #A855F7 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #a21caf, 0 6px 14px rgba(217, 70, 239, 0.35)'
    },
    inactive: 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 hover:bg-fuchsia-100 hover:border-fuchsia-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-fuchsia-200/90 text-fuchsia-950 font-extrabold',
    tag: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    cardStrip: 'linear-gradient(90deg, #D946EF, #A855F7)'
  },
  'Determination & Growth': {
    activeStyle: {
      background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #c2410c, 0 6px 14px rgba(249, 115, 22, 0.35)'
    },
    inactive: 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-orange-200/90 text-orange-950 font-extrabold',
    tag: 'bg-[#FFF7E6] text-orange-900 border-[#F97316]/40',
    cardStrip: 'linear-gradient(90deg, #F97316, #EF4444)'
  },
  'Communication & Society': {
    activeStyle: {
      background: 'linear-gradient(135deg, #0284C7 0%, #6366F1 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #0369a1, 0 6px 14px rgba(2, 132, 199, 0.35)'
    },
    inactive: 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 hover:border-sky-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-sky-200/90 text-sky-950 font-extrabold',
    tag: 'bg-sky-50 text-sky-800 border-sky-200',
    cardStrip: 'linear-gradient(90deg, #0284C7, #6366F1)'
  },
  'Science & Dreams': {
    activeStyle: {
      background: 'linear-gradient(135deg, #7C5CFC 0%, #C084FC 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #5838cc, 0 6px 14px rgba(124, 92, 252, 0.35)'
    },
    inactive: 'bg-purple-50 text-[#7C5CFC] border border-purple-200 hover:bg-purple-100 hover:border-purple-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-purple-200/90 text-[#5838cc] font-extrabold',
    tag: 'bg-purple-50 text-purple-800 border-purple-200',
    cardStrip: 'linear-gradient(90deg, #7C5CFC, #C084FC)'
  },
  'Technology': {
    activeStyle: {
      background: 'linear-gradient(135deg, #2563EB 0%, #06B6D4 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #1d4ed8, 0 6px 14px rgba(37, 99, 235, 0.35)'
    },
    inactive: 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-blue-200/90 text-blue-900 font-extrabold',
    tag: 'bg-blue-50 text-blue-700 border-blue-200',
    cardStrip: 'linear-gradient(90deg, #2563EB, #06B6D4)'
  }
};

const getTopicStyle = (topic: string): TopicPalette => {
  return TOPIC_STYLES[topic] || {
    activeStyle: {
      background: 'linear-gradient(135deg, #7C5CFC 0%, #B85BFA 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #5838cc, 0 6px 14px rgba(124, 92, 252, 0.35)'
    },
    inactive: 'bg-purple-50 text-[#6D3EEB] border border-purple-200 hover:bg-purple-100 hover:border-purple-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white',
    badgeInactive: 'bg-purple-200/90 text-[#5838cc] font-extrabold',
    tag: 'bg-[#F3EEFF] text-[#6D3EEB] border-[#DDD6FE]',
    cardStrip: 'linear-gradient(90deg, #7C5CFC, #25C0E1)'
  };
};

const LEVEL_STYLES: Record<string, { 
  label: string; 
  activeStyle: React.CSSProperties; 
  inactive: string; 
  badgeActive: string; 
  badgeInactive: string; 
}> = {
  All: {
    label: 'All Levels',
    activeStyle: {
      background: 'linear-gradient(135deg, #7C5CFC 0%, #B85BFA 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #5838cc, 0 6px 14px rgba(124, 92, 252, 0.35)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)'
    },
    inactive: 'bg-purple-50 text-[#6D3EEB] border border-purple-200/90 hover:bg-purple-100 hover:border-purple-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-purple-200/90 text-[#5838cc] font-extrabold'
  },
  A2: {
    label: 'CEFR A2',
    activeStyle: {
      background: 'linear-gradient(135deg, #0284c7 0%, #25C0E1 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #0369a1, 0 6px 14px rgba(37, 192, 225, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)'
    },
    inactive: 'bg-sky-50 text-sky-700 border border-sky-200/90 hover:bg-sky-100 hover:border-sky-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-sky-200/90 text-sky-900 font-extrabold'
  },
  B1: {
    label: 'CEFR B1',
    activeStyle: {
      background: 'linear-gradient(135deg, #A855F7 0%, #E14DFC 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #7e22ce, 0 6px 14px rgba(225, 77, 252, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)'
    },
    inactive: 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/90 hover:bg-fuchsia-100 hover:border-fuchsia-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-fuchsia-200/90 text-fuchsia-900 font-extrabold'
  },
  B2: {
    label: 'CEFR B2',
    activeStyle: {
      background: 'linear-gradient(135deg, #6366F1 0%, #7C5CFC 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #4338ca, 0 6px 14px rgba(99, 102, 241, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)'
    },
    inactive: 'bg-indigo-50 text-indigo-700 border border-indigo-200/90 hover:bg-indigo-100 hover:border-indigo-300 shadow-2xs',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-indigo-200/90 text-indigo-900 font-extrabold'
  }
};

const SOURCE_STYLES = {
  All: {
    label: 'All Formats',
    activeStyle: {
      background: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #0f172a, 0 6px 14px rgba(15, 23, 42, 0.35)',
      borderTop: '1px solid rgba(255, 255, 255, 0.3)'
    },
    inactive: 'bg-slate-100 text-slate-700 border border-slate-300/80 hover:bg-slate-200 shadow-2xs',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-slate-200 text-slate-800 font-extrabold'
  },
  youtube: {
    label: 'YouTube',
    activeStyle: {
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #b91c1c, 0 6px 14px rgba(239, 68, 68, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)'
    },
    inactive: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300 shadow-2xs',
    iconActive: 'text-white',
    iconInactive: 'text-red-500',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-red-200/90 text-red-900 font-extrabold'
  },
  podcast: {
    label: 'Podcasts',
    activeStyle: {
      background: 'linear-gradient(135deg, #7C5CFC 0%, #9E69FF 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #5838cc, 0 6px 14px rgba(124, 92, 252, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)'
    },
    inactive: 'bg-purple-50 text-[#7C5CFC] border border-purple-200 hover:bg-purple-100 hover:border-purple-300 shadow-2xs',
    iconActive: 'text-white',
    iconInactive: 'text-[#7C5CFC]',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-purple-200/90 text-[#5838cc] font-extrabold'
  },
  animation: {
    label: 'Short Films',
    activeStyle: {
      background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)',
      color: '#ffffff',
      boxShadow: '0 3px 0 #c2410c, 0 6px 14px rgba(245, 158, 11, 0.4)',
      borderTop: '1px solid rgba(255, 255, 255, 0.4)'
    },
    inactive: 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 shadow-2xs',
    iconActive: 'text-white',
    iconInactive: 'text-amber-500',
    badgeActive: 'bg-white/25 text-white font-extrabold',
    badgeInactive: 'bg-amber-200/90 text-amber-950 font-extrabold'
  }
};

export const ListeningLabHome: React.FC<Props> = ({
  lessons = [],
  vocabulary = [],
  onStartLesson,
  onSelectWordForContext,
  onOpenTeacherModal,
  userRole = 'student',
  onOpenCuratedHub,
  onToggleRole
}) => {
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedCefr, setSelectedCefr] = useState('All');
  const [selectedSourceType, setSelectedSourceType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const learnedWordSet = new Set(
    (vocabulary || [])
      .filter(v => v?.stats?.meaningKnown)
      .map(v => v.word.toLowerCase())
  );

  const filteredLessons = (lessons || []).filter(lesson => {
    const matchTopic = selectedTopic === 'All' || lesson.topic.toLowerCase() === selectedTopic.toLowerCase();
    const matchCefr = selectedCefr === 'All' || lesson.cefr === selectedCefr;
    const matchSourceType = selectedSourceType === 'All' || lesson.sourceType === selectedSourceType;
    const matchQuery =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.learningObjective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lesson.targetWords || []).some(w => w.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchTopic && matchCefr && matchSourceType && matchQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
      {/* ========================================================================= */}
      {/* HERO BANNER - VIVID GRADIENT: PURPLE -> MAGENTA -> CYAN */}
      {/* ========================================================================= */}
      <div 
        className="relative rounded-3xl overflow-hidden shadow-xl text-white p-6 sm:p-9"
        style={{
          background: 'linear-gradient(135deg, #7C5CFC 0%, #9E69FF 22%, #B564FF 45%, #E14DFC 70%, #25C0E1 100%)'
        }}
      >
        {/* Specular gloss top light highlight */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />

        {/* Ambient Radial Highlights */}
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-cyan-300/25 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-24 w-80 h-80 rounded-full bg-purple-400/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-indigo-500/35 blur-3xl pointer-events-none" />

        {/* Subtle Perspective Texture */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)`,
            backgroundSize: '36px 36px'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-3xl">
            <div 
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-xs backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.28)'
              }}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span>Authentic ELT Audio & Video Stream</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xs">
              Authentic <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-200">Listening Library</span>
            </h1>

            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed max-w-2xl font-normal drop-shadow-xs">
              Chuyển từ &ldquo;biết từ trên trang giấy&rdquo; sang &ldquo;nhận diện, hiểu trọn vẹn, chép chính tả và phát âm đuổi (shadowing)&rdquo; theo giọng nói tự nhiên của người bản xứ.
            </p>

            {/* 6-Stage Learning Sequence Badges with exact accent tints */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {[
                { step: '1', title: 'Listen', accent: '#7C5CFC', tint: '#F3EEFF' },
                { step: '2', title: 'Word Hunt', accent: '#25C0E1', tint: '#E8FAFD' },
                { step: '3', title: 'Understand', accent: '#B85CF6', tint: '#FCEEFF' },
                { step: '4', title: 'Dictation', accent: '#F59E0B', tint: '#FFFBEB' },
                { step: '5', title: 'Shadowing', accent: '#6366F1', tint: '#EEF2FF' },
                { step: '6', title: 'Review My Words', accent: '#22C55E', tint: '#F0FDF4', isFinal: true }
              ].map((item, idx, arr) => (
                <React.Fragment key={item.step}>
                  <div 
                    className="px-3 py-1.5 rounded-full backdrop-blur-md shadow-xs flex items-center gap-1.5 transition-transform hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.16)',
                      border: '1px solid rgba(255, 255, 255, 0.24)',
                      color: '#ffffff'
                    }}
                  >
                    <span 
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white"
                      style={{ backgroundColor: item.accent }}
                    >
                      {item.step}
                    </span>
                    <span className="font-bold">{item.title}</span>
                  </div>
                  {idx < arr.length - 1 && (
                    <span className="text-white/60 text-xs font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Metrics Capsule */}
          <div 
            className="hidden lg:flex flex-col justify-between p-5 rounded-3xl backdrop-blur-xl shadow-lg w-72 shrink-0 text-white"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Studio Metrics
              </span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300" />
              </span>
            </div>

            <div className="py-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-medium">Curated Lessons</span>
                <span className="font-extrabold font-mono text-white text-sm">{lessons.length} Units</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-medium">Target Vocabulary</span>
                <span className="font-extrabold font-mono text-cyan-200 text-sm">{vocabulary.length} Words</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80 font-medium">Pedagogy</span>
                <span className="font-extrabold font-mono text-emerald-200 text-sm">6-Stage Mastery</span>
              </div>
            </div>

            {/* Sound Equalizer Bars */}
            <div className="pt-2 border-t border-white/15 flex items-center justify-between gap-1 h-6">
              {[40, 75, 55, 90, 60, 85, 45, 95, 70, 50, 80, 65, 90, 70].map((height, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-cyan-300 to-white rounded-full transition-all duration-300"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TEACHER CURATED PIPELINE MANAGEMENT WIDGET (ONLY IN TEACHER MODE) */}
      {/* ========================================================================= */}
      {userRole === 'teacher' && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-2 border-emerald-300/80 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  HỆ THỐNG KIỂM DUYỆT TƯ LIỆU UY TÍN
                </span>
                <span className="text-xs text-emerald-800 font-bold">Quy trình 2 bước bắt buộc</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Pipeline kiểm định tư liệu: Nguồn Chuẩn → Thẩm định → Phân tích → Sinh nháp → Giáo viên duyệt nội dung → Giáo viên duyệt câu hỏi → Phát hành
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                Học sinh chỉ thấy những bài học đã được giáo viên phê duyệt hoàn chỉnh cả nội dung lẫn câu hỏi trắc nghiệm/shadowing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-200 text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-slate-600 font-medium">Chờ duyệt ND:</span>
                <span className="font-extrabold text-amber-700 font-mono">{lessons.filter(l => l.status === 'NEEDS_CONTENT_REVIEW').length}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-200 text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-slate-600 font-medium">Chờ duyệt câu hỏi:</span>
                <span className="font-extrabold text-purple-700 font-mono">{lessons.filter(l => l.status === 'NEEDS_QUESTION_REVIEW').length}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-200 text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-slate-600 font-medium">Sẵn sàng phát hành:</span>
                <span className="font-extrabold text-blue-700 font-mono">{lessons.filter(l => l.status === 'READY_TO_PUBLISH').length}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-200 text-xs shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Đã phát hành:</span>
                <span className="font-extrabold text-emerald-700 font-mono">{lessons.filter(l => l.status === 'PUBLISHED').length}</span>
              </div>

              <button
                onClick={onOpenCuratedHub || onOpenTeacherModal}
                className="px-4 py-2 rounded-xl text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                }}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>MỞ STUDIO DUYỆT TƯ LIỆU</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTHENTIC WHITELIST SOURCE ASSURANCE BAR */}
      {/* ========================================================================= */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0 text-[#7C5CFC]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800">100% Tư liệu nghe thực tế từ các nguồn giáo dục uy tín:</span>
            <span className="text-slate-500 ml-1">Không dùng âm thanh hay hội thoại AI giả lập. Đảm bảo ngữ âm, ngữ điệu tự nhiên của người bản xứ.</span>
          </div>
        </div>

        {/* Whitelist Partner Pills */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {[
            { name: 'BBC Learning English', domain: 'bbc.co.uk' },
            { name: 'British Council', domain: 'britishcouncil.org' },
            { name: 'VOA Learning English', domain: 'voanews.com' },
            { name: 'ELLLO', domain: 'elllo.org' },
            { name: 'TED-Ed', domain: 'ed.ted.com' }
          ].map(src => (
            <span 
              key={src.name}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-700 text-[11px] flex items-center gap-1 hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
              title={`Nguồn đã kiểm định: ${src.domain}`}
            >
              <Check className="w-3 h-3 text-emerald-600" />
              {src.name}
            </span>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FILTER BAR: CEFR LEVEL & SOURCE WITH REFINED PILLS */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* CEFR Level Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <GraduationCap className="w-4 h-4 text-[#7C5CFC]" />
              Level:
            </span>
            {(['All', 'A2', 'B1', 'B2'] as const).map(level => {
              const count = level === 'All' 
                ? lessons.length 
                : lessons.filter(l => l.cefr === level).length;
              const style = LEVEL_STYLES[level];
              const isSelected = selectedCefr === level;

              return (
                <button
                  key={level}
                  onClick={() => setSelectedCefr(level)}
                  style={isSelected ? style.activeStyle : undefined}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 transform active:scale-95 ${
                    isSelected ? '' : style.inactive
                  }`}
                >
                  <span>{style.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    isSelected ? style.badgeActive : style.badgeInactive
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Source Type Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mr-1">
              <Headphones className="w-4 h-4 text-[#7C5CFC]" />
              Source:
            </span>
            <button
              onClick={() => setSelectedSourceType('All')}
              style={selectedSourceType === 'All' ? SOURCE_STYLES.All.activeStyle : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 transform active:scale-95 ${
                selectedSourceType === 'All'
                  ? ''
                  : SOURCE_STYLES.All.inactive
              }`}
            >
              <span>{SOURCE_STYLES.All.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                selectedSourceType === 'All' ? SOURCE_STYLES.All.badgeActive : SOURCE_STYLES.All.badgeInactive
              }`}>
                {lessons.length}
              </span>
            </button>

            <button
              onClick={() => setSelectedSourceType('youtube')}
              style={selectedSourceType === 'youtube' ? SOURCE_STYLES.youtube.activeStyle : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 transform active:scale-95 ${
                selectedSourceType === 'youtube'
                  ? ''
                  : SOURCE_STYLES.youtube.inactive
              }`}
            >
              <Youtube className={`w-3.5 h-3.5 ${selectedSourceType === 'youtube' ? SOURCE_STYLES.youtube.iconActive : SOURCE_STYLES.youtube.iconInactive}`} />
              <span>{SOURCE_STYLES.youtube.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                selectedSourceType === 'youtube' ? SOURCE_STYLES.youtube.badgeActive : SOURCE_STYLES.youtube.badgeInactive
              }`}>
                {lessons.filter(l => l.sourceType === 'youtube').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedSourceType('podcast')}
              style={selectedSourceType === 'podcast' ? SOURCE_STYLES.podcast.activeStyle : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 transform active:scale-95 ${
                selectedSourceType === 'podcast'
                  ? ''
                  : SOURCE_STYLES.podcast.inactive
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${selectedSourceType === 'podcast' ? SOURCE_STYLES.podcast.iconActive : SOURCE_STYLES.podcast.iconInactive}`} />
              <span>{SOURCE_STYLES.podcast.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                selectedSourceType === 'podcast' ? SOURCE_STYLES.podcast.badgeActive : SOURCE_STYLES.podcast.badgeInactive
              }`}>
                {lessons.filter(l => l.sourceType === 'podcast').length}
              </span>
            </button>

            <button
              onClick={() => setSelectedSourceType('animation')}
              style={selectedSourceType === 'animation' ? SOURCE_STYLES.animation.activeStyle : undefined}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 transform active:scale-95 ${
                selectedSourceType === 'animation'
                  ? ''
                  : SOURCE_STYLES.animation.inactive
              }`}
            >
              <Film className={`w-3.5 h-3.5 ${selectedSourceType === 'animation' ? SOURCE_STYLES.animation.iconActive : SOURCE_STYLES.animation.iconInactive}`} />
              <span>{SOURCE_STYLES.animation.label}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                selectedSourceType === 'animation' ? SOURCE_STYLES.animation.badgeActive : SOURCE_STYLES.animation.badgeInactive
              }`}>
                {lessons.filter(l => l.sourceType === 'animation').length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Curated Topics Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#B85BFA]" />
            Curated Topics
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            Showing <span className="text-[#7C5CFC] font-bold">{filteredLessons.length}</span> {filteredLessons.length === 1 ? 'lesson' : 'lessons'}
            {selectedCefr !== 'All' && ` • Level ${selectedCefr}`}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none py-1">
          {TOPIC_PRESETS.map(topic => {
            const isSelected = selectedTopic === topic;
            const style = getTopicStyle(topic);
            const count = topic === 'All'
              ? lessons.length
              : lessons.filter(l => l.topic.toLowerCase() === topic.toLowerCase()).length;

            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                style={isSelected ? style.activeStyle : undefined}
                className={`px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 transform active:scale-95 ${
                  isSelected ? '' : style.inactive
                }`}
              >
                <span>{topic}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                    isSelected ? style.badgeActive : style.badgeInactive
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by lesson title, target word (e.g. responsibility, chores), or objective..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#DDD6FE]/80 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC] bg-white text-sm shadow-2xs text-[#1E293B] placeholder:text-slate-400"
        />
      </div>

      {/* ========================================================================= */}
      {/* LESSONS GRID - WHITE CARDS WITH THIN TOP GRADIENT STRIP & 3D BUTTONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map(lesson => {
          const targetInLearned = (lesson.targetWords || []).filter(w =>
            learnedWordSet.has(w.toLowerCase())
          );
          const topicStyle = getTopicStyle(lesson.topic);

          return (
            <div
              key={lesson.id}
              className="bg-white rounded-[22px] border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[#7C5CFC]/15 hover:border-[#DDD6FE] transition-all flex flex-col justify-between group relative"
            >
              {/* Thin Colored Top Gradient Strip */}
              <div 
                className="h-1.5 w-full shrink-0"
                style={{ background: topicStyle.cardStrip }}
              />

              <div>
                {/* Cover Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={lesson.coverImage}
                    alt={lesson.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/80 via-transparent to-black/20" />

                  {/* Top Source & Level Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        lesson.sourceType === 'animation'
                          ? 'bg-amber-600/90 text-white'
                          : lesson.sourceType === 'youtube'
                          ? 'bg-red-600/90 text-white'
                          : 'bg-[#7C5CFC]/90 text-white'
                      }`}
                    >
                      {lesson.sourceType === 'animation' ? (
                        <Film className="w-3.5 h-3.5" />
                      ) : lesson.sourceType === 'youtube' ? (
                        <Youtube className="w-3.5 h-3.5" />
                      ) : (
                        <Radio className="w-3.5 h-3.5" />
                      )}
                      {lesson.sourceType === 'animation'
                        ? 'Animation'
                        : lesson.sourceType === 'youtube'
                        ? 'YouTube'
                        : 'Podcast'}
                    </span>

                    <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-xs text-white"
                      style={{
                        background: lesson.cefr === 'A2'
                          ? 'linear-gradient(90deg, #0284c7, #25C0E1)'
                          : lesson.cefr === 'B1'
                          ? 'linear-gradient(90deg, #B564FF, #E14DFC)'
                          : 'linear-gradient(90deg, #6366F1, #7C5CFC)'
                      }}
                    >
                      CEFR {lesson.cefr}
                    </span>
                  </div>

                  {/* Bottom Duration & Accent Overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white font-medium">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-white/90" />
                      <span>{lesson.duration}</span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs">
                      <Globe2 className="w-3 h-3 text-cyan-200" />
                      <span>{lesson.accent}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-3.5">
                  {/* Verified Source & Status Bar */}
                  <div className="flex items-center justify-between gap-2 text-xs pb-1 border-b border-slate-100">
                    <a
                      href={lesson.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-[#7C5CFC] transition-colors group/src"
                      title={`Mở nguồn gốc tư liệu tại ${lesson.sourceDomain || lesson.sourceName}`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="truncate max-w-[130px] sm:max-w-[160px]">{lesson.sourceName || 'Verified Source'}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover/src:text-[#7C5CFC]" />
                    </a>

                    {/* Approval Status Badge */}
                    {lesson.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã duyệt 2 bước
                      </span>
                    ) : lesson.status === 'READY_TO_PUBLISH' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        🚀 Sẵn sàng phát hành
                      </span>
                    ) : lesson.status === 'NEEDS_QUESTION_REVIEW' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        ✏️ Chờ duyệt câu hỏi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        ⚠️ Chờ duyệt nội dung
                      </span>
                    )}
                  </div>

                  {/* Topic tag */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${topicStyle.tag}`}>
                      {lesson.topic}
                    </span>
                    {targetInLearned.length > 0 && (
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        {targetInLearned.length} learned words
                      </span>
                    )}
                  </div>

                  {/* Lesson Title */}
                  <h3 className="text-lg font-bold text-[#1E293B] tracking-tight leading-snug group-hover:text-[#7C5CFC] transition-colors">
                    {lesson.title}
                  </h3>

                  {/* Learning Objective */}
                  <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                    {lesson.learningObjective}
                  </p>

                  {/* Target Vocabulary Chips */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Target Vocabulary:</span>
                      <span className="text-[#7C5CFC] font-semibold">({lesson.targetWords.length} words)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {lesson.targetWords.map(word => {
                        const isLearned = learnedWordSet.has(word.toLowerCase());
                        const vocabItem = vocabulary.find(v => v.word.toLowerCase() === word.toLowerCase());

                        return (
                          <button
                            key={word}
                            onClick={() => vocabItem && onSelectWordForContext(vocabItem)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                              isLearned
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-[#F3EEFF] hover:text-[#6D3EEB]'
                            }`}
                            title={isLearned ? 'In your vocabulary database! Click to listen in context' : 'Target word. Click to view context'}
                          >
                            <span>{word}</span>
                            {isLearned && <BookMarked className="w-3 h-3 text-emerald-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Start Listening or Review */}
              <div className="p-5 sm:p-6 pt-0 space-y-2">
                {userRole === 'teacher' && lesson.status !== 'PUBLISHED' && (
                  <button
                    onClick={onOpenCuratedHub || onOpenTeacherModal}
                    className="w-full py-2.5 px-3 rounded-xl text-white font-extrabold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>PHÊ DUYỆT TƯ LIỆU NÀY</span>
                    <span>→</span>
                  </button>
                )}

                <button
                  onClick={() => onStartLesson(lesson.id)}
                  className="w-full py-3 px-4 rounded-2xl text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #7C5CFC 0%, #9E69FF 40%, #B84EF5 100%)',
                    boxShadow: '0 6px 0 #5838cc, 0 10px 20px rgba(124, 92, 252, 0.4)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.35)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 7px 0 #5838cc, 0 14px 25px rgba(124, 92, 252, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 0 #5838cc, 0 10px 20px rgba(124, 92, 252, 0.4)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 0 #5838cc, 0 4px 10px rgba(124, 92, 252, 0.3)';
                    e.currentTarget.style.transform = 'translateY(4px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 0 #5838cc, 0 10px 20px rgba(124, 92, 252, 0.4)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }}
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </span>
                  <span>{lesson.status !== 'PUBLISHED' ? 'XEM THỬ BÀI HỌC' : 'START LISTENING'}</span>
                  <span className="text-white/60 group-hover/btn:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          <p className="text-base text-slate-600">No lessons match your current filters.</p>
          <button
            onClick={() => {
              setSelectedTopic('All');
              setSearchQuery('');
            }}
            className="mt-3 text-sm font-bold text-[#7C5CFC] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

