import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, RotateCcw, Timer, Focus, BookOpen, AlertCircle, Trophy, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { BentoGrid, BentoItem } from '../components/BentoGrid';
import { ProgressBar } from '../components/ProgressBar';
import { UnitSection } from '../components/UnitSection';
import { CountdownTimer } from '../components/CountdownTimer';
import { SignInBanner } from '../components/SignInBanner';
import { subjects } from '../data/subjects';

interface HomeProps {
    currentSubjectId: string;
    setCurrentSubjectId: (id: string) => void;
    onShowSignIn: () => void;
    checkedItems: Set<string>;
    toggleItem: (id: string) => void;
    resetProgress: () => void;
    progressPercentage: number;
    totalItems: number;
    completedItems: number;
}

const Home: React.FC<HomeProps> = ({
    currentSubjectId,
    setCurrentSubjectId,
    onShowSignIn,
    checkedItems,
    toggleItem,
    resetProgress,
    totalItems,
    completedItems
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'repeated' | 'incomplete'>('all');
    const [focusMode, setFocusMode] = useState(false);
    const [focusedUnitIndex, setFocusedUnitIndex] = useState(0);
    const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

    const currentSubject = useMemo(() =>
        subjects.find(s => s.id === currentSubjectId) || subjects[0],
        [currentSubjectId]
    );

    // Keyboard shortcuts for Home
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement && e.key !== 'Escape') return;
            switch (e.key) {
                case '/':
                    e.preventDefault();
                    document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
                    break;
                case 'r':
                case 'R':
                    e.preventDefault();
                    resetProgress();
                    break;
                case 'e': setExpandAll(prev => prev === undefined ? false : !prev); break;
                case 'c': setExpandAll(false); break;
                case 'f': setFocusMode(prev => !prev); break;
                case 'E':
                    e.preventDefault();
                    setExpandAll(true);
                    break;
                case 'C':
                    e.preventDefault();
                    setExpandAll(false);
                    break;
                case 'Escape':
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
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 },
                colors: ['#10b981', '#34d399', '#6ee7b7']
            });
        }
        toggleItem(id);
    };

    const filteredContent = useMemo(() => {
        if (!searchQuery && filter === 'all') return currentSubject.content;
        return currentSubject.content.map(unit => {
            const filteredSections = unit.sections.map(section => {
                const filteredItems = section.items.filter(item => {
                    const matchesSearch = !searchQuery || item.text.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesFilter = filter === 'all' ||
                        (filter === 'repeated' && item.isRepeated) ||
                        (filter === 'incomplete' && !checkedItems.has(item.id));
                    return matchesSearch && matchesFilter;
                });
                return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
            }).filter(Boolean) as typeof unit.sections;
            return filteredSections.length > 0 ? { ...unit, sections: filteredSections } : null;
        }).filter(Boolean) as typeof currentSubject.content;
    }, [searchQuery, filter, checkedItems, currentSubject]);

    if (focusMode) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-surface z-50 overflow-auto">
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
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <SignInBanner onSignIn={onShowSignIn} />

            {/* Top Row: Subject & Stats */}
            <BentoGrid>
                {/* Subject Selector & Info */}
                <BentoItem colSpan={2} className="relative overflow-visible">
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-text-main">Dashboard</h2>
                                <div className="relative">
                                    <select
                                        value={currentSubjectId}
                                        onChange={(e) => setCurrentSubjectId(e.target.value)}
                                        className="appearance-none bg-zinc-900/50 border border-white/10 text-text-main py-2 pl-4 pr-10 rounded-xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                                    >
                                        {subjects.map(subject => (
                                            <option key={subject.id} value={subject.id}>
                                                {subject.title}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                                </div>
                            </div>
                            <p className="text-text-muted text-sm">
                                Tracking progress for <span className="text-primary font-bold">{currentSubject.title}</span>.
                                Keep up the momentum!
                            </p>
                        </div>

                        {/* Quick Stats or Message */}
                        <div className="mt-4 flex gap-2">
                            {currentSubjectId === 'formal-languages' && (
                                <div className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20 flex items-center gap-2">
                                    <AlertCircle size={12} />
                                    New Subject
                                </div>
                            )}
                        </div>
                    </div>
                </BentoItem>

                {/* Countdown */}
                <BentoItem colSpan={1} noPadding>
                    <div className="h-full flex flex-col justify-center p-6">
                        <h3 className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wider">Exam In</h3>
                        <CountdownTimer targetDate={currentSubject.examDate} />
                    </div>
                </BentoItem>

                {/* Progress */}
                <BentoItem colSpan={1}>
                    <div className="flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start">
                            <h3 className="font-bold text-lg text-text-main">Progress</h3>
                            <span className="text-2xl font-bold text-primary">{Math.round((completedItems / totalItems) * 100)}%</span>
                        </div>
                        <ProgressBar total={totalItems} completed={completedItems} />
                        <div className="flex justify-between text-xs text-text-muted mt-2">
                            <span>{completedItems} done</span>
                            <span>{totalItems - completedItems} left</span>
                        </div>
                    </div>
                </BentoItem>
            </BentoGrid>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Column: Tracker */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Search & Filter Bar */}
                    <div className="bg-surface/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sticky top-20 z-30 shadow-xl">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search topics..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-background/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={clsx("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border", filter === 'all' ? "bg-primary/20 text-primary border-primary/30" : "bg-zinc-900/50 text-text-muted border-white/10 hover:bg-white/5")}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilter('repeated')}
                                    className={clsx("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border", filter === 'repeated' ? "bg-amber-500/20 text-amber-500 border-amber-500/30" : "bg-zinc-900/50 text-text-muted border-white/10 hover:bg-white/5")}
                                >
                                    Repeated
                                </button>
                                <button
                                    onClick={() => setFilter('incomplete')}
                                    className={clsx("px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border", filter === 'incomplete' ? "bg-rose-500/20 text-rose-500 border-rose-500/30" : "bg-zinc-900/50 text-text-muted border-white/10 hover:bg-white/5")}
                                >
                                    Incomplete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Units List */}
                    <div className="space-y-4">
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
                            <div className="text-center py-20 text-text-muted bg-surface/30 rounded-3xl border border-white/5 border-dashed">
                                <Filter size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No topics found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <BentoItem title="Quick Actions">
                        <div className="grid grid-cols-1 gap-2">
                            <button
                                onClick={() => setFocusMode(true)}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-white/5 border border-white/5 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                                    <Focus size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-text-main">Focus Mode</div>
                                    <div className="text-xs text-text-muted">Distraction free</div>
                                </div>
                            </button>
                            <button
                                onClick={() => window.open('/pomodoro.html', '_blank')}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-white/5 border border-white/5 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-colors">
                                    <Timer size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-text-main">Pomodoro</div>
                                    <div className="text-xs text-text-muted">Stay productive</div>
                                </div>
                            </button>
                            <button
                                onClick={resetProgress}
                                className="flex items-center gap-3 p-3 rounded-xl bg-surface hover:bg-white/5 border border-white/5 transition-all text-left group"
                            >
                                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors">
                                    <RotateCcw size={18} />
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-text-main">Reset</div>
                                    <div className="text-xs text-text-muted">Clear progress</div>
                                </div>
                            </button>
                        </div>
                    </BentoItem>

                    {/* Dynamic Banners */}
                    {currentSubjectId === 'formal-languages' && (
                        <>
                            <BentoItem className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20" noPadding>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                            <BookOpen size={20} />
                                        </div>
                                        <h3 className="font-bold text-purple-100">Study Guide</h3>
                                    </div>
                                    <p className="text-xs text-purple-200/70 mb-4">Comprehensive notes and roadmaps for FLA.</p>
                                    <Link
                                        to="/study-guide"
                                        target="_blank"
                                        className="block w-full py-2 text-center rounded-lg bg-purple-500 text-white font-bold text-sm hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20"
                                    >
                                        Open Guide
                                    </Link>
                                </div>
                            </BentoItem>

                            <BentoItem className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20" noPadding>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                                            <Trophy size={20} />
                                        </div>
                                        <h3 className="font-bold text-emerald-100">MCQ Practice</h3>
                                    </div>
                                    <p className="text-xs text-emerald-200/70 mb-4">80+ questions to test your knowledge.</p>
                                    <Link
                                        to="/formal-languages-mcq"
                                        className="block w-full py-2 text-center rounded-lg bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                                    >
                                        Start Quiz
                                    </Link>
                                </div>
                            </BentoItem>
                        </>
                    )}

                    {currentSubjectId === 'computer-networks' && (
                        <BentoItem className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20" noPadding>
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <Trophy size={20} />
                                    </div>
                                    <h3 className="font-bold text-blue-100">CN MCQ</h3>
                                </div>
                                <p className="text-xs text-blue-200/70 mb-4">Practice unit-wise questions.</p>
                                <Link
                                    to="/computer-networks"
                                    className="block w-full py-2 text-center rounded-lg bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    Start Practice
                                </Link>
                            </div>
                        </BentoItem>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
