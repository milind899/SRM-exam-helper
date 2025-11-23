import { useState, useEffect, useMemo } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { Layout } from './components/Layout';
import { ProgressBar } from './components/ProgressBar';
import { UnitSection } from './components/UnitSection';
import { ResourcesSection } from './components/ResourcesSection';
import { examContent } from './data/examContent';
import { RotateCcw, Search, Filter, Github } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('discrete-math-progress');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'repeated' | 'incomplete'>('all');

  useEffect(() => {
    localStorage.setItem('discrete-math-progress', JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems]);

  const handleToggleItem = (id: string) => {
    setCheckedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
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

    return examContent.map(unit => ({
      ...unit,
      sections: unit.sections.map(section => ({
        ...section,
        items: section.items.filter(item => {
          const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesFilter =
            filter === 'all' ? true :
              filter === 'repeated' ? item.isRepeated :
                filter === 'incomplete' ? !checkedItems.has(item.id) : true;

          return matchesSearch && matchesFilter;
        })
      })).filter(section => section.items.length > 0)
    })).filter(unit => unit.sections.length > 0);
  }, [searchQuery, filter, checkedItems]);

  // Calculate total stats (based on original content)
  const totalItems = examContent.reduce((acc, unit) =>
    acc + unit.sections.reduce((sAcc, sec) => sAcc + sec.items.length, 0), 0
  );

  const completedItems = checkedItems.size;

  return (
    <Layout>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
              filter === 'all'
                ? "bg-primary/20 text-primary border-primary/20"
                : "bg-surface/50 text-slate-400 border-white/5 hover:bg-white/5"
            )}
          >
            All Topics
          </button>
          <button
            onClick={() => setFilter('repeated')}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
              filter === 'repeated'
                ? "bg-amber-500/20 text-amber-400 border-amber-500/20"
                : "bg-surface/50 text-slate-400 border-white/5 hover:bg-white/5"
            )}
          >
            Repeated Only
          </button>
          <button
            onClick={() => setFilter('incomplete')}
            className={clsx(
              "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
              filter === 'incomplete'
                ? "bg-red-500/20 text-red-400 border-red-500/20"
                : "bg-surface/50 text-slate-400 border-white/5 hover:bg-white/5"
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
          className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          <RotateCcw size={14} />
          Reset Progress
        </button>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-xl font-bold text-slate-100">Discrete Mathematics</h2>
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
          <div className="text-center py-12 text-slate-500">
            <Filter size={48} className="mx-auto mb-4 opacity-20" />
            <p>No topics found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* More Subjects & Contribution Section */}
      <div className="mt-12 grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-white/5 bg-surface/50 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-slate-100 mb-2">More Subjects</h3>
          <p className="text-slate-400 text-sm mb-4">
            We are working on adding more subjects like DSA, OS, and CN. Stay tuned!
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full w-fit border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Coming Soon
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-surface/50 to-primary/5 backdrop-blur-sm hover:border-primary/30 transition-colors group">
          <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-primary transition-colors">Contribute</h3>
          <p className="text-slate-400 text-sm mb-4">
            Want to help fellow students? Contribute to the repository by adding questions or fixing errors.
          </p>
          <a
            href="https://github.com/milind899/SRM-exam-helper"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-200 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-all border border-white/5 hover:border-white/10"
          >
            <Github size={16} />
            View Repository
          </a>
        </div>
      </div>

      <ResourcesSection />
      <Analytics />
    </Layout>
  );
}

export default App;
