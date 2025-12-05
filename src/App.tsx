import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Layout } from './components/Layout';
import { StudyGuide } from './components/StudyGuide';
import { subjects } from './data/subjects';
import { CheckCircle2, User as UserIcon, BookOpen } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { ShortcutsHelp } from './components/ShortcutsHelp';
import { WhatsNewModal } from './components/WhatsNewModal';
import { SignInModal } from './components/SignInModal';
import { ProfileModal } from './components/ProfileModal';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useProgress } from './hooks/useProgress';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InstallPrompt } from './components/InstallPrompt';
import ComputerNetworks from './pages/ComputerNetworks';
import FormalLanguagesMCQ from './pages/FormalLanguagesMCQ';
import AdminUsers from './pages/AdminUsers';
import Home from './pages/Home';
import { QueryClientProvider } from '@tanstack/react-query';
import queryClient from './lib/queryClient';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  // Get current user first
  const { user } = useAuth();

  // What's New modal - version-based
  const CURRENT_VERSION = 'v4.0.0'; // FLA Update

  const [currentSubjectId, setCurrentSubjectId] = useState(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    // Force FLA for users who haven't seen this update yet
    if (lastSeenVersion !== CURRENT_VERSION) {
      return 'formal-languages';
    }
    return localStorage.getItem('current-subject') || 'formal-languages';
  });

  const [showWhatsNew, setShowWhatsNew] = useState(() => {
    const lastSeenVersion = localStorage.getItem('lastSeenVersion');
    return lastSeenVersion !== CURRENT_VERSION;
  });

  const currentSubject = useMemo(() =>
    subjects.find(s => s.id === currentSubjectId) || subjects[0],
    [currentSubjectId]
  );

  // Progress management with sync
  const { checkedItems, toggleItem, resetProgress } = useProgress(user, currentSubjectId);

  type Theme = 'emerald' | 'dark' | 'blue' | 'neon-dark' | 'nature-green' | 'modern-gradient' | 'retro-vintage' | 'gold-black';

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'emerald';
  });

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

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

  // Keyboard shortcuts (Global)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.key !== 'Escape') return;

      switch (e.key) {
        case 't':
        case 'T':
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          setTheme(prev => {
            const themes: Theme[] = ['emerald', 'dark', 'blue', 'neon-dark', 'nature-green', 'modern-gradient', 'retro-vintage', 'gold-black'];
            const currentIndex = themes.indexOf(prev);
            return themes[(currentIndex + 1) % themes.length];
          });
          break;
        case '?':
          e.preventDefault();
          setShowShortcutsHelp(true);
          break;
        case 'Escape':
          setShowShortcutsHelp(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Calculate total stats (based on original content)
  const totalItems = currentSubject.content.reduce((acc, unit) =>
    acc + unit.sections.reduce((sAcc, sec) => sAcc + sec.items.length, 0), 0
  );

  const completedItems = checkedItems.size;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const {
    nickname,
    tagline,
    updateNickname,
    updateTagline,
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

  if (window.location.pathname === '/formal-languages-mcq') {
    return (
      <>
        <Toaster position="bottom-right" />
        <ErrorBoundary>
          <FormalLanguagesMCQ theme={theme} onThemeChange={setTheme} />
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

  // Study Guide route
  if (window.location.pathname === '/study-guide') {
    return (
      <>
        <SpeedInsights />
        <Toaster position="bottom-right" />
        <Layout
          currentTheme={theme}
          onThemeChange={setTheme}
          onShowShortcuts={() => setShowShortcutsHelp(true)}
          progressPercentage={progressPercentage}
          currentSubjectTitle="FLA Study Guide"
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
          extraNav={
            <Link
              to="/"
              className="px-4 py-2 rounded-lg transition-all font-bold shadow-[0_0_10px_rgba(var(--color-primary),0.2)] hover:shadow-[0_0_15px_rgba(var(--color-primary),0.4)] flex items-center gap-2 bg-purple-500 text-white border border-purple-400"
            >
              <CheckCircle2 size={16} />
              Back to Tracker
            </Link>
          }
        >
          <StudyGuide />
        </Layout>
        <ShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
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
      </>
    );
  }

  return (
    <>
      <SpeedInsights />
      {/* Development Banner */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-200 px-4 py-2 text-xs text-center font-medium backdrop-blur-sm fixed top-0 left-0 right-0 z-[100]">
        🚧 Website is currently under development. You may encounter some bugs.
      </div>
      <div className="mt-8"></div> {/* Spacer for fixed banner */}

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
        extraNav={
          currentSubjectId === 'formal-languages' && (
            <Link
              to="/study-guide"
              target="_blank"
              className="group relative px-4 py-2 rounded-lg font-bold flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border border-purple-400 overflow-hidden
                animate-[float_3s_ease-in-out_infinite] hover:scale-105 hover:rotate-1 transition-all duration-300
                shadow-[0_4px_15px_rgba(168,85,247,0.4)] hover:shadow-[0_6px_25px_rgba(168,85,247,0.6)]
                before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity hover:before:opacity-20
                after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:translate-x-[-200%] hover:after:translate-x-[200%] after:transition-transform after:duration-700"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <BookOpen size={16} className="animate-pulse" />
                Study Guide
              </span>
              {/* Sparkle effects */}
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping" />
              <span className="absolute top-1/2 -left-1 w-1.5 h-1.5 bg-pink-300 rounded-full animate-[ping_2s_ease-in-out_infinite_0.5s]" />
              <span className="absolute -bottom-1 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-[ping_3s_ease-in-out_infinite_1s]" />
            </Link>
          )
        }
      >
        <ErrorBoundary>
          <Home
            currentSubjectId={currentSubjectId}
            setCurrentSubjectId={setCurrentSubjectId}
            onShowSignIn={() => setShowSignInModal(true)}
            checkedItems={checkedItems}
            toggleItem={toggleItem}
            resetProgress={resetProgress}
            progressPercentage={progressPercentage}
            totalItems={totalItems}
            completedItems={completedItems}
          />
        </ErrorBoundary>
      </Layout>
    </>
  );
}

export default App;
