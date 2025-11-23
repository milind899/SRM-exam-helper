import { useState, useEffect, useMemo } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { Layout } from './components/Layout';
import { ProgressBar } from './components/ProgressBar';
import { UnitSection } from './components/UnitSection';
import { ResourcesSection } from './components/ResourcesSection';
import { examContent } from './data/examContent';
import { RotateCcw, Search, Filter, Github } from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';

import { CountdownTimer } from './components/CountdownTimer';
import { ShortcutsHelp } from './components/ShortcutsHelp';

function App() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('discrete-math-progress');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'repeated' | 'incomplete'>('all');

  const [theme, setTheme] = useState<'emerald' | 'dark' | 'blue'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'emerald' | 'dark' | 'blue') || 'emerald';
  });

  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

  useEffect(() => {
    localStorage.setItem('discrete-math-progress', JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems]);

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
          handleReset();
          break;
        case 't':
        case 'T':
          if (e.target instanceof HTMLInputElement) return;
          e.preventDefault();
          setTheme(prev => prev === 'emerald' ? 'dark' : prev === 'dark' ? 'blue' : 'emerald');
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
  }, []);

  const handleToggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        // Confetti celebration! 🎉
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      }
      return next;
    });
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      setCheckedItems(new Set());
    }
  };

  // Filter content
  const filteredContent = useMemo(() => {
    if (!searchQuery && filter === 'all') return examContent;

    return examContent.map(unit => {
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
    }).filter(Boolean) as typeof examContent;
  }, [searchQuery, filter, checkedItems]);

  // Calculate total stats (based on original content)
  const totalItems = examContent.reduce((acc, unit) =>
    acc + unit.sections.reduce((sAcc, sec) => sAcc + sec.items.length, 0), 0
  );

  const completedItems = checkedItems.size;

  return (
    <>
      <ShortcutsHelp isOpen={showShortcutsHelp} onClose={() => setShowShortcutsHelp(false)} />
      <Layout
        currentTheme={theme}
        onThemeChange={setTheme}
        onShowShortcuts={() => setShowShortcutsHelp(true)}
      >
        <CountdownTimer />

        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/50 border border-text-main/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-main focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-text-muted"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                filter === 'all'
                  ? "bg-primary/20 text-primary border-primary/20"
                  : "bg-surface/50 text-text-muted border-text-main/5 hover:bg-text-main/5"
              )}
            >
              All Topics
            </button>
            <button
              onClick={() => setFilter('repeated')}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                filter === 'repeated'
                  ? "bg-amber-500/20 text-amber-500 border-amber-500/20"
                  : "bg-surface/50 text-text-muted border-text-main/5 hover:bg-text-main/5"
              )}
            >
              Repeated Only
            </button>
            <button
              onClick={() => setFilter('incomplete')}
              className={clsx(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                filter === 'incomplete'
                  ? "bg-red-500/20 text-red-500 border-red-500/20"
                  : "bg-surface/50 text-text-muted border-text-main/5 hover:bg-text-main/5"
              )}
            >
              Incomplete
            </button>
          </div>
        </div>

        <ProgressBar total={totalItems} completed={completedItems} />

        <div className="flex justify-end mb-4">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-xs font-medium text-text-muted hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            <RotateCcw size={14} />
            Reset Progress
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-primary rounded-full"></div>
            <h2 className="text-xl font-bold text-text-main">Discrete Mathematics</h2>
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
              />
            ))
          ) : (
            <div className="text-center py-12 text-text-muted">
              <Filter size={48} className="mx-auto mb-4 opacity-20" />
              <p>No topics found matching your criteria.</p>
            </div>
          )}
        </div>

        {/* More Subjects & Contribution Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-text-main/5 bg-surface/50 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-text-main mb-2">More Subjects</h3>
            <p className="text-text-muted text-sm mb-4">
              We are working on adding more subjects like DSA, OS, and CN. Stay tuned!
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
              Help us improve! Found an error or want to add content? Contribute on GitHub.
            </p>
            <a
              href="https://github.com/milind899/SRM-exam-helper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-main bg-text-main/5 hover:bg-text-main/10 px-4 py-2 rounded-lg transition-all border border-text-main/5 hover:border-text-main/10"
            >
              <Github size={16} />
              View Repository
            </a>
          </div>
        </div>

        <ResourcesSection />
      </Layout>
      <Analytics />
    </>
  );
}

export default App;
