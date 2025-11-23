import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ProgressBar } from './components/ProgressBar';
import { UnitSection } from './components/UnitSection';
import { ResourcesSection } from './components/ResourcesSection';
import { examContent } from './data/examContent';
import { RotateCcw } from 'lucide-react';

function App() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('discrete-math-progress');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

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

  // Calculate total stats
  const totalItems = examContent.reduce((acc, unit) =>
    acc + unit.sections.reduce((sAcc, sec) => sAcc + sec.items.length, 0), 0
  );

  const completedItems = checkedItems.size;

  return (
    <Layout>
      <div className="flex justify-end mb-4">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
        >
          <RotateCcw size={14} />
          Reset Progress
        </button>
      </div>

      <ProgressBar total={totalItems} completed={completedItems} />

      <div className="space-y-6">
        {examContent.map(unit => (
          <UnitSection
            key={unit.id}
            unit={unit}
            checkedItems={checkedItems}
            onToggleItem={handleToggleItem}
          />
        ))}
      </div>

      <ResourcesSection />
    </Layout>
  );
}

export default App;
