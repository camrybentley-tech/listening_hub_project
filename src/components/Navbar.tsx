import React, { useState } from 'react';
import { 
  Headphones, 
  BookOpen, 
  Star, 
  PlusCircle, 
  Download, 
  Sparkles, 
  Shield, 
  LogOut, 
  Flame, 
  Zap, 
  Award,
  Bot,
  X,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface Props {
  activeTab: 'vocabulary' | 'listening_lab' | 'my_words';
  onTabChange?: (tab: 'vocabulary' | 'listening_lab' | 'my_words') => void;
  onSelectTab?: (tab: 'vocabulary' | 'listening_lab' | 'my_words') => void;
  onOpenTeacherModal?: () => void;
  onOpenAddSource?: () => void;
  onOpenCuratedHub?: () => void;
  onExportOfflineHtml?: () => void;
  onExportStandaloneHtml?: () => void;
  missedWordsCount?: number;
  totalWordsCount?: number;
  userRole?: 'student' | 'teacher';
  onToggleRole?: () => void;
  pendingReviewCount?: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onSelectTab,
  onOpenTeacherModal,
  onOpenAddSource,
  onOpenCuratedHub,
  onExportOfflineHtml,
  onExportStandaloneHtml,
  missedWordsCount = 0,
  totalWordsCount = 20,
  userRole = 'teacher',
  onToggleRole,
  pendingReviewCount = 0
}) => {
  const [showAiModal, setShowAiModal] = useState(false);

  const handleTabClick = (tab: 'vocabulary' | 'listening_lab' | 'my_words') => {
    if (onTabChange) onTabChange(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const handleAddSource = () => {
    if (onOpenCuratedHub) {
      onOpenCuratedHub();
    } else if (onOpenTeacherModal) {
      onOpenTeacherModal();
    } else if (onOpenAddSource) {
      onOpenAddSource();
    }
  };

  const handleExportHtml = () => {
    if (onExportOfflineHtml) onExportOfflineHtml();
    if (onExportStandaloneHtml) onExportStandaloneHtml();
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER - EXACT PURPLE -> MAGENTA -> CYAN GRADIENT (90-110px) */}
      {/* ========================================================================= */}
      <div 
        className="w-full relative overflow-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-white flex items-center justify-between min-h-[90px] lg:min-h-[105px]"
        style={{
          background: 'linear-gradient(90deg, #9E69FF 0%, #B564FF 22%, #E14DFC 48%, #A4A0EC 76%, #25C0E1 100%)'
        }}
      >
        {/* Subtle decorative glow overlay */}
        <div className="absolute inset-0 bg-white/[0.04] pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-1/4 w-72 h-72 rounded-full bg-cyan-300/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4">
          {/* Left: App Icon & Titles */}
          <div className="flex items-center gap-3.5">
            {/* App Icon Capsule */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#38bdf8] p-0.5 shadow-lg shadow-purple-900/30 flex items-center justify-center relative shrink-0">
              <div className="w-full h-full rounded-[14px] bg-gradient-to-br from-[#4338ca] to-[#2563eb] flex items-center justify-center relative overflow-hidden">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute top-1.5 right-1.5 animate-pulse" />
                <BookOpen className="w-6 h-6 text-white drop-shadow-xs" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-xs">
                  Học Từ Vựng Global Success
                </h1>
                <span 
                  className="text-xs font-bold px-2.5 py-0.5 rounded-full text-white shadow-xs backdrop-blur-md"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.22)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Lớp 10
                </span>
              </div>
              <p className="text-xs sm:text-sm text-white/85 mt-0.5 font-medium tracking-normal">
                Giáo viên: Nguyễn Trương Quỳnh Trang • THPT
              </p>
            </div>
          </div>

          {/* Right: Gamified Status Badges, AI Assistant & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap">
            {/* Streak Badge */}
            <div 
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-xs backdrop-blur-md transition-transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
              title="Daily Active Streak"
            >
              <Flame className="w-4 h-4 text-orange-300 fill-orange-300" />
              <span>30 ngày</span>
            </div>

            {/* XP Badge */}
            <div 
              className="px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-xs backdrop-blur-md transition-transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
              title="Total Experience Points"
            >
              <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span>9999 XP</span>
            </div>

            {/* Level Badge */}
            <div 
              className="hidden sm:flex px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold text-white items-center gap-1.5 shadow-xs backdrop-blur-md transition-transform hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.16)'
              }}
              title="Current Mastery Level"
            >
              <Award className="w-4 h-4 text-emerald-300" />
              <span>Lv.99</span>
            </div>

            {/* AI Assistant Button */}
            <button
              onClick={() => setShowAiModal(true)}
              className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
              style={{
                backgroundColor: '#5545EE',
                boxShadow: '0 4px 14px rgba(85, 69, 238, 0.4)'
              }}
              title="Mở Trợ lý AI học từ vựng"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full animate-ping"
                style={{ backgroundColor: '#42E8A1' }}
              />
              <span 
                className="w-2.5 h-2.5 rounded-full -ml-5"
                style={{ backgroundColor: '#42E8A1' }}
              />
              <span>Trợ lý AI</span>
            </button>

            {/* Student vs Teacher Mode Switcher Pill */}
            <button
              onClick={onToggleRole}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs backdrop-blur-md active:scale-95"
              style={{
                backgroundColor: userRole === 'teacher' ? 'rgba(255, 255, 255, 0.28)' : 'rgba(0, 0, 0, 0.25)',
                border: userRole === 'teacher' ? '1px solid rgba(255, 255, 255, 0.45)' : '1px solid rgba(255, 255, 255, 0.2)'
              }}
              title="Chuyển chế độ xem: Học sinh (chỉ bài đã duyệt) vs Giáo viên (quản lý, duyệt nội dung)"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${userRole === 'teacher' ? 'text-emerald-300' : 'text-cyan-200'}`} />
              <span className="hidden sm:inline">
                {userRole === 'teacher' ? 'Chế độ Giáo viên' : 'Chế độ Học sinh'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
                {userRole === 'teacher' ? 'Biên tập' : 'Đã duyệt'}
              </span>
            </button>

            {/* Profile Capsule */}
            <div 
              className="flex items-center gap-2.5 pl-1.5 pr-3.5 py-1 rounded-full text-white backdrop-blur-md transition-all shadow-xs"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.18)'
              }}
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                style={{ backgroundColor: '#1E293B' }}
              >
                <Shield className="w-4 h-4" style={{ color: userRole === 'teacher' ? '#FACC15' : '#38BDF8' }} />
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold tracking-tight text-white leading-tight">
                  {userRole === 'teacher' ? 'Nguyễn Trương Qu...' : 'Học sinh Lớp 10'}
                </div>
                <div className="text-[10px] text-white/75 leading-tight">
                  {userRole === 'teacher' ? 'Giáo viên / Thẩm định' : 'Chế độ người học'}
                </div>
              </div>
            </div>

            {/* Logout / Exit icon button */}
            <button
              onClick={() => alert('Đã hoàn tất phiên làm việc hiện tại của giáo viên.')}
              className="p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors"
              title="Đăng xuất / Kết thúc phiên"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUB-NAVIGATION BAR - Clean White Background (#FFFFFF) */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-slate-200/90 py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Main Learning Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-2xl bg-[#F6F7FC] border border-slate-200/80">
            <button
              onClick={() => handleTabClick('listening_lab')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'listening_lab'
                  ? 'text-white shadow-md'
                  : 'bg-transparent text-slate-600 hover:text-[#7C5CFC] hover:bg-slate-100'
              }`}
              style={
                activeTab === 'listening_lab'
                  ? {
                      background: 'linear-gradient(90deg, #7C5CFC, #B85BFA)',
                      boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)'
                    }
                  : undefined
              }
            >
              <Headphones className="w-4 h-4" />
              <span>LISTENING LAB</span>
            </button>

            <button
              onClick={() => handleTabClick('vocabulary')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'vocabulary'
                  ? 'text-white shadow-md'
                  : 'bg-transparent text-slate-600 hover:text-[#7C5CFC] hover:bg-slate-100'
              }`}
              style={
                activeTab === 'vocabulary'
                  ? {
                      background: 'linear-gradient(90deg, #7C5CFC, #B85BFA)',
                      boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)'
                    }
                  : undefined
              }
            >
              <BookOpen className="w-4 h-4" />
              <span>VOCABULARY</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === 'vocabulary' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalWordsCount}
              </span>
            </button>

            <button
              onClick={() => handleTabClick('my_words')}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'my_words'
                  ? 'text-white shadow-md'
                  : 'bg-transparent text-slate-600 hover:text-[#7C5CFC] hover:bg-slate-100'
              }`}
              style={
                activeTab === 'my_words'
                  ? {
                      background: 'linear-gradient(90deg, #7C5CFC, #B85BFA)',
                      boxShadow: '0 4px 14px rgba(124, 92, 252, 0.3)'
                    }
                  : undefined
              }
            >
              <Star className="w-4 h-4 fill-current text-amber-400" />
              <span>MY WORDS</span>
              {missedWordsCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold animate-bounce">
                  {missedWordsCount}
                </span>
              )}
            </button>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {userRole === 'teacher' && (
              <button
                onClick={handleAddSource}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-white text-xs sm:text-sm font-extrabold transition-all shadow-md hover:shadow-lg active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                }}
                title="Mở Hub Quản lý Nguồn Nghe Chuẩn & Kiểm Duyệt 2 Bước"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-100" />
                <span className="hidden sm:inline">STUDIO DUYỆT TƯ LIỆU</span>
                <span className="sm:hidden">Duyệt bài</span>
                {pendingReviewCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black animate-pulse">
                    {pendingReviewCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={handleAddSource}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)',
                boxShadow: '0 4px 12px rgba(124, 92, 252, 0.3)'
              }}
              title="Thêm nguồn video YouTube hoặc podcast mới cho bài học"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">THÊM NGUỒN NGHE</span>
              <span className="sm:hidden">Thêm</span>
            </button>

            <button
              onClick={handleExportHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#6D3EEB] hover:bg-[#F3EEFF] text-xs sm:text-sm font-bold transition-all border border-[#DDD6FE] shadow-2xs hover:shadow-xs active:scale-95"
              title="Xuất file HTML tự vận hành 100% offline không cần mạng"
            >
              <Download className="w-4 h-4 text-[#7C5CFC]" />
              <span className="hidden md:inline">Offline HTML</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal Dialog */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-200 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: '#5545EE' }}
                >
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Trợ lý AI Global Success 10
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Online
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Đồng hành luyện nghe & mở rộng vốn từ</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-[#F3EEFF] border border-[#DDD6FE]">
                <p className="font-bold text-[#6D3EEB] mb-1">💡 Lời khuyên nghe hiểu tuần này:</p>
                <p>
                  Khi nghe các video về <em>Family Life</em> hoặc <em>Healthy Lifestyle</em>, hãy tập trung vào các từ nối 
                  như <em>&ldquo;however&rdquo;</em>, <em>&ldquo;moreover&rdquo;</em> và cách người bản xứ nối âm (connected speech) 
                  ở các cụm từ như <em>&ldquo;pick it up&rdquo;</em> hoặc <em>&ldquo;put on&rdquo;</em>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#E8FAFD] border border-cyan-200">
                <p className="font-bold text-cyan-800 mb-1">🎯 Mục tiêu tuần:</p>
                <p>
                  Hoàn thành 3 bài nghe Word Hunt và thực hiện ít nhất 2 bài Shadowing Level 2 để kích hoạt vùng cơ phát âm tự nhiên.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-5 py-2.5 rounded-xl text-white font-bold text-xs"
                style={{ background: 'linear-gradient(135deg, #7C5CFC, #B84EF5)' }}
              >
                Đã hiểu, tiếp tục học!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

