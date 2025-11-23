import { useState, useEffect, useMemo } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { Layout } from './components/Layout';
import { ProgressBar } from './components/ProgressBar';
import { UnitSection } from './components/UnitSection';
import { ResourcesSection } from './components/ResourcesSection';
import { examContent } from './data/examContent';
import { RotateCcw, Search, Filter } from 'lucide-react';
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

      <ResourcesSection />
      <Analytics />
    </Layout>
  );
}

export default App;
