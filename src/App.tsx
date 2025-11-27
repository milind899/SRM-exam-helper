import { useState, useEffect, useMemo } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { Layout } from './components/Layout';
import { ProgressBar } from './components/ProgressBar';
import { UnitSection } from './components/UnitSection';
import { ResourcesSection } from './components/ResourcesSection';
import { subjects } from './data/subjects';
import { RotateCcw, Search, Filter, Github, Focus, Timer, ChevronDown, Trophy, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { Toaster } from 'react-hot-toast';

import { CountdownTimer } from './components/CountdownTimer';
import { ShortcutsHelp } from './components/ShortcutsHelp';
import { WhatsNewModal } from './components/WhatsNewModal';
import { SignInModal } from './components/SignInModal';
import { ProfileModal } from './components/ProfileModal';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useProgress } from './hooks/useProgress';
import { useAuth } from './contexts/AuthContext';
import { StickyLeaderboard } from './components/StickyLeaderboard';
import { SignInBanner } from './components/SignInBanner';
import { User as UserIcon } from 'lucide-react';
import { InstallPrompt } from './components/InstallPrompt';
import ComputerNetworks from './pages/ComputerNetworks';
import AdminUsers from './pages/AdminUsers';
import ChallengePage from './pages/ChallengePage';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  // Get current user first
  const { user } = useAuth();

  const [currentSubjectId, setCurrentSubjectId] = useState(() => {
    return localStorage.getItem('current-subject') || 'computer-networks';
  });

  const currentSubject = useMemo(() =>
    subjects.find(s => s.id === currentSubjectId) || subjects[0],
    [currentSubjectId]
  );

  // Progress management with sync
  const { checkedItems, toggleItem, resetProgress } = useProgress(user, currentSubjectId);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'repeated' | 'incomplete'>('all');

  const [theme, setTheme] = useState<'emerald' | 'dark' | 'blue'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'emerald' | 'dark' | 'blue') || 'emerald';
  });

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
  const [focusMode, setFocusMode] = useState(false);
  const [focusedUnitIndex, setFocusedUnitIndex] = useState(0);

  // What's New modal - version-based
  const CURRENT_VERSION = 'v3.0.0'; // CN + Auth features
  const [showWhatsNew, setShowWhatsNew] = useState(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    return lastSeenVersion !== CURRENT_VERSION;
  });

  // Sign In modal
  const [showSignInModal, setShowSignInModal] = useState(false);

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleCloseWhatsNew = () => {
    setShowWhatsNew(false);
    localStorage.setItem('lastSeenVersion', CURRENT_VERSION);
  };

  useEffect(() => {
    localStorage.setItem('current-subject', currentSubjectId);
  }, [currentSubjectId]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement && e.key !== 'Escape') return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
          break;
        case 'r':
        case 'R':
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          resetProgress();
          break;
        case 't':
        case 'T':
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          setTheme(prev => prev === 'emerald' ? 'dark' : prev === 'dark' ? 'blue' : 'emerald');
          break;
        case 'e': setExpandAll(prev => prev === undefined ? false : !prev); break;
        case 'c': setExpandAll(false); break;
        case 'f': setFocusMode(prev => !prev); break;
        case 'E':
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          setExpandAll(true);
          break;
        case 'C':
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          setExpandAll(false);
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp(true);
          break;
        case 'Escape':
          setShowShortcutsHelp(false);
          if (e.target instanceof HTMLInputElement) {
            e.target.blur();
            setSearchQuery('');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [resetProgress]);

  const handleToggleItem = (id: string) => {
    if (!checkedItems.has(id)) {
      // Confetti celebration! 🎉
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#6ee7b7']
      });
    }
    toggleItem(id);
  };

  // Filter content
  const filteredContent = useMemo(() => {
    if (!searchQuery && filter === 'all') return currentSubject.content;

    return currentSubject.content.map(unit => {
      const filteredSections = unit.sections.map(section => {
        const filteredItems = section.items.filter(item => {
          // Search filter
          const matchesSearch = !searchQuery ||
            item.text.toLowerCase().includes(searchQuery.toLowerCase());

          // Type filter
          const matchesFilter =
            filter === 'all' ||
            (filter === 'repeated' && item.isRepeated) ||
            (filter === 'incomplete' && !checkedItems.has(item.id));

          return matchesSearch && matchesFilter;
        });

        return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
      }).filter(Boolean) as typeof unit.sections;

      return filteredSections.length > 0 ? { ...unit, sections: filteredSections } : null;
    }).filter(Boolean) as typeof currentSubject.content;
  }, [searchQuery, filter, checkedItems, currentSubject]);

  // Calculate total stats (based on original content)
  const totalItems = currentSubject.content.reduce((acc, unit) =>
    acc + unit.sections.reduce((sAcc, sec) => sAcc + sec.items.length, 0), 0
  );

  const completedItems = checkedItems.size;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const {
    leaderboard,
    loading: leaderboardLoading,
    nickname,
    tagline,
    updateNickname,
    updateTagline,
    error: leaderboardError
  } = useLeaderboard(progressPercentage, completedItems, totalItems);

  // Simple routing
  if (window.location.pathname === '/computer-networks') {
    return (
      <>
        <Toaster position="bottom-right" />
        <ErrorBoundary>
          <ComputerNetworks theme={theme} onThemeChange={setTheme} />
        </ErrorBoundary>
      </>
    );
  }

  if (window.location.pathname === '/admin/users') {
    return (
      <>
        <Toaster position="bottom-right" />
        <AdminUsers />
      </>
    );
  }

  if (window.location.pathname.startsWith('/challenge/')) {
    return (
      <>
        <Toaster position="bottom-right" />
        <ChallengePage />
      </>
    );
  }

  return (
    <>
      <ShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
      <WhatsNewModal isOpen={showWhatsNew} onClose={handleCloseWhatsNew} />
      <SignInModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        nickname={nickname}
        tagline={tagline}
        onUpdateNickname={updateNickname}
        onUpdateTagline={updateTagline}
        progressPercentage={progressPercentage}
      />
      <InstallPrompt />
      <Layout
        currentTheme={theme}
        onThemeChange={setTheme}
        onShowShortcuts={() => setShowShortcutsHelp(true)}
        progressPercentage={progressPercentage}
        currentSubjectTitle={currentSubject.shortTitle}
        headerActions={
          user ? (
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border border-primary/20 text-primary rounded-lg transition-all font-medium text-sm"
              title="Profile"
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-5 h-5 rounded-full border border-primary/30" />
              ) : (
                <UserIcon size={16} />
              )}
              <span className="hidden sm:inline">Profile</span>
            </button>
          ) : (
            <button
              onClick={() => setShowSignInModal(true)}
              className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all font-medium text-sm shadow-lg shadow-primary/20"
            >
              Sign In
            </button>
          )
        }
      >
        <SignInBanner onSignIn={() => setShowSignInModal(true)} />

        {/* New MCQ Banner */}
        <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 flex items-start gap-4 relative animate-fade-in">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-100 mb-1">New: Computer Networks MCQ Practice!</h3>
            <p className="text-sm text-blue-200/70 leading-relaxed">
              You can now practice unit-wise MCQs directly on the website.
              <br />
              <span className="text-blue-300 font-medium">Note:</span> Taking the <strong>Test Mode</strong> and completing the syllabus will directly affect your ranking on the Leaderboard.
            </p>
          </div>
        </div>

        <CountdownTimer targetDate={currentSubject.examDate} />

        {/* Subject Switcher */}
        <div className="mb-6 flex justify-center gap-4 items-center flex-wrap">
          <div className="relative inline-block text-left">
            <select
              value={currentSubjectId}
              onChange={(e) => setCurrentSubjectId(e.target.value)}
              className="appearance-none bg-surface border border-white/10 text-text-main py-2 pl-4 pr-10 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer shadow-lg"
            >
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>

        {/* CN MCQ Banner */}
        {currentSubjectId === 'computer-networks' && (
          <div className="mb-6">
            <button
              onClick={() => window.location.href = '/computer-networks'}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 hover:border-blue-500/50 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
                    <Trophy size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-blue-100">Computer Networks MCQ</h3>
                    <p className="text-sm text-blue-200/70">Practice unit-wise questions or take a full mock test</p>
                  </div>
                </div>
                <div className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-500 text-white font-medium text-sm group-hover:scale-105 transition-transform text-center">
                  Start Practice →
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Enhanced Search and Filter Card */}
        <div className="bg-gradient-to-br from-surface via-surface to-surface/50 border border-white/10 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/50 border border-primary/20 rounded-xl pl-12 pr-4 py-3 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-text-muted shadow-inner"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setFilter('all')}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border shadow-lg",
                  filter === 'all'
                    ? "bg-gradient-to-r from-primary to-accent text-white border-primary/30 shadow-primary/30"
                    : "bg-surface text-text-muted border-white/10 hover:bg-white/5 hover:border-primary/20"
                )}
              >
                All Topics
              </button>
              <button
                onClick={() => setFilter('repeated')}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border shadow-lg",
                  filter === 'repeated'
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500/30 shadow-amber-500/30"
                    : "bg-surface text-text-muted border-white/10 hover:bg-white/5 hover:border-amber-500/20"
                )}
              >
                ⭐ Repeated
              </button>
              <button
                onClick={() => setFilter('incomplete')}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border shadow-lg",
                  filter === 'incomplete'
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-500/30 shadow-red-500/30"
                    : "bg-surface text-text-muted border-white/10 hover:bg-white/5 hover:border-red-500/20"
                )}
              >
                📌 Incomplete
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Card */}
        <div className="bg-gradient-to-br from-primary/5 via-surface to-accent/5 border border-primary/20 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-text-main">Your Progress ({currentSubject.shortTitle})</h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-muted">Overall:</span>
              <span className="font-bold text-2xl text-primary">
                {Math.round((completedItems / totalItems) * 100)}%
              </span>
            </div>
          </div>
          <ProgressBar total={totalItems} completed={completedItems} />
          <div className="flex items-center justify-between mt-3 text-xs text-text-muted">
            <span>✅ {completedItems} completed</span>
            <span>📝 {totalItems - completedItems} remaining</span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 gap-3">
          <button
            onClick={resetProgress}
            className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <RotateCcw size={14} />
            Reset Progress
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/pomodoro.html', '_blank')}
              className="flex items-center gap-2 text-xs font-medium bg-gradient-to-r from-red-500/10 to-orange-500/10 hover:from-red-500/20 hover:to-orange-500/20 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-lg transition-all"
              title="Open Pomodoro Timer (F key)"
            >
              <Timer size={14} />
              Pomodoro Timer
            </button>

            <button
              onClick={() => setFocusMode(!focusMode)}
              className={clsx(
                "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all",
                focusMode
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main border border-white/10"
              )}
              title="Focus Mode (F key)"
            >
              <Focus size={14} />
              {focusMode ? 'Exit Focus' : 'Focus Mode'}
            </button>
          </div>
        </div>

        {focusMode ? (
          <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-surface z-50 overflow-auto">
            {/* Minimal Header */}
            <div className="max-w-5xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                    <Focus className="text-primary" size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-text-main">Focus Mode</h1>
                    <p className="text-sm text-text-muted">Unit {focusedUnitIndex + 1} of {currentSubject.content.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFocusedUnitIndex(prev => Math.max(0, prev - 1))}
                    disabled={focusedUnitIndex === 0}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-surface hover:bg-surface/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
                  >
                    ← Previous Unit
                  </button>
                  <button
                    onClick={() => setFocusedUnitIndex(prev => Math.min(currentSubject.content.length - 1, prev + 1))}
                    disabled={focusedUnitIndex === currentSubject.content.length - 1}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-surface hover:bg-surface/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
                  >
                    Next Unit →
                  </button>
                  <button
                    onClick={() => setFocusMode(false)}
                    className="px-4 py-2 text-sm font-medium rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all"
                  >
                    Exit Focus
                  </button>
                </div>
              </div>

              {/* Centered Content */}
              <div className="max-w-4xl mx-auto">
                <UnitSection
                  unit={filteredContent[focusedUnitIndex] || currentSubject.content[focusedUnitIndex]}
                  checkedItems={checkedItems}
                  onToggleItem={handleToggleItem}
                  forceExpanded={true}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-primary rounded-full"></div>
              <h2 className="text-xl font-bold text-text-main">{currentSubject.title}</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                Active
              </span>
            </div>

            {filteredContent.length > 0 ? (
              filteredContent.map(unit => (
                <UnitSection
                  key={unit.id}
                  unit={unit}
                  checkedItems={checkedItems}
                  onToggleItem={handleToggleItem}
                  forceExpanded={expandAll}
                />
              ))
            ) : (
              <div className="text-center py-12 text-text-muted">
                <Filter size={48} className="mx-auto mb-4 opacity-20" />
                <p>No topics found matching your criteria.</p>
              </div>
            )}
          </div>
        )}

        {!focusMode && (
          <>
            {/* More Subjects & Contribution Section */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border border-text-main/5 bg-surface/50 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-text-main mb-2">More Subjects</h3>
                <p className="text-text-muted text-sm mb-4">
                  We are working on adding more subjects like DSA, OS, and FLA. Stay tuned!
                </p>
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit border border-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Coming Soon
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-text-main/5 bg-surface/50 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-text-main mb-2">Contribute</h3>
                <p className="text-text-muted text-sm mb-4">
                  Help us improve! Found an error or want to add content?
                  <br />
                  <span className="text-xs opacity-70 italic">(Repo is currently private, will be public soon)</span>
                </p>
                <button
                  disabled
                  className="inline-flex items-center gap-2 text-sm font-medium text-text-muted bg-surface/50 px-4 py-2 rounded-lg border border-white/5 cursor-not-allowed opacity-70"
                >
                  <Github size={16} />
                  Repository (Coming Soon)
                </button>
              </div>
            </div>

            <ResourcesSection currentSubjectId={currentSubjectId} />
          </>
        )}
      </Layout>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(var(--color-surface), 0.95)',
            color: 'rgb(var(--color-text-main))',
            border: '1px solid rgba(var(--color-primary), 0.2)',
            backdropFilter: 'blur(10px)',
          },
          success: {
            iconTheme: {
              primary: 'rgb(var(--color-primary))',
              secondary: 'rgb(var(--color-surface))',
            },
          },
        }}
      />
      <Analytics />
      <StickyLeaderboard
        entries={leaderboard}
        currentUserId={user?.id}
        currentUserNickname={nickname}
        onUpdateNickname={updateNickname}
        loading={leaderboardLoading}
        error={leaderboardError}
      />
    </>
  );
}

export default App;
