import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Youtube, CheckCircle2, ExternalLink } from 'lucide-react';
import { deebaRoadmap, anitaRoadmap } from '../data/flaStudyGuide';
import clsx from 'clsx';

export const StudyGuide: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'deeba' | 'anita'>('deeba');
    const activeRoadmap = activeTab === 'deeba' ? deebaRoadmap : anitaRoadmap;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-flex items-center gap-3">
                    <BookOpen className="text-primary" />
                    FLA Study Roadmap
                </h2>
                <p className="text-text-muted max-w-2xl mx-auto">
                    A complete video-by-video guide to master Formal Languages & Automata.
                    Follow the roadmap mapped exactly to the YouTube playlists.
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex justify-center">
                <div className="bg-surface/50 backdrop-blur-sm p-1.5 rounded-xl border border-white/10 inline-flex">
                    <button
                        onClick={() => setActiveTab('deeba')}
                        className={clsx(
                            "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2",
                            activeTab === 'deeba'
                                ? "bg-primary text-white shadow-lg shadow-primary/25"
                                : "text-text-muted hover:text-text-main hover:bg-white/5"
                        )}
                    >
                        <Youtube size={16} />
                        Deeba Kannan
                    </button>
                    <button
                        onClick={() => setActiveTab('anita')}
                        className={clsx(
                            "px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2",
                            activeTab === 'anita'
                                ? "bg-accent text-white shadow-lg shadow-accent/25"
                                : "text-text-muted hover:text-text-main hover:bg-white/5"
                        )}
                    >
                        <Youtube size={16} />
                        Anita R
                    </button>
                </div>
            </div>

            {/* Playlist Link Banner */}
            <motion.a
                href={activeRoadmap.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={activeRoadmap.author}
                className="block group"
            >
                <div className="bg-gradient-to-r from-red-600/10 to-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between hover:border-red-500/40 transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-red-600/20 text-red-500 group-hover:scale-110 transition-transform">
                            <Youtube size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-100 group-hover:text-red-400 transition-colors">
                                Watch {activeRoadmap.author}'s Full Playlist
                            </h3>
                            <p className="text-sm text-red-200/60">
                                {activeRoadmap.description}
                            </p>
                        </div>
                    </div>
                    <ExternalLink className="text-red-500/50 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                </div>
            </motion.a>

            {/* Units Grid */}
            <div className="grid gap-8">
                <AnimatePresence mode="wait">
                    {activeRoadmap.units.map((unit, index) => (
                        <motion.div
                            key={`${activeTab}-${unit.title}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-surface/30 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-300"
                        >
                            {/* Unit Header */}
                            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-primary/5 to-transparent">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="text-xl font-bold text-text-main">
                                        {unit.title}
                                    </h3>
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold whitespace-nowrap">
                                        <Youtube size={14} />
                                        Videos: {unit.videoRange}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid md:grid-cols-3 gap-8">
                                {/* Topics Table */}
                                <div className="md:col-span-2 space-y-4">
                                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                        <BookOpen size={14} />
                                        Topics & Video Mapping
                                    </h4>
                                    <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5 overflow-x-auto">
                                        <table className="w-full text-sm text-left min-w-[300px]">
                                            <thead className="bg-white/5 text-text-muted">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium whitespace-nowrap">Topic Coverage</th>
                                                    <th className="px-4 py-3 font-medium w-24 text-right whitespace-nowrap">Video No.</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {unit.topics.map((topic, i) => (
                                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-3 text-text-main/90">{topic.name}</td>
                                                        <td className="px-4 py-3 text-right font-mono text-primary/80">{topic.videoNo}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Outcomes */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-text-muted uppercase tracking-wider flex items-center gap-2">
                                        <CheckCircle2 size={14} />
                                        Learning Outcomes
                                    </h4>
                                    <div className="bg-accent/5 rounded-xl p-5 border border-accent/10 h-full">
                                        <ul className="space-y-3">
                                            {unit.outcomes.map((outcome, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-text-main/80">
                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                                                    <span className="leading-relaxed">{outcome}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Summary Table */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 bg-gradient-to-br from-surface to-surface/50 border border-white/10 rounded-2xl p-8 text-center"
            >
                <h3 className="text-2xl font-bold text-text-main mb-6">💎 Final Quick Reference</h3>
                <div className="max-w-3xl mx-auto overflow-hidden rounded-xl border border-white/10 shadow-2xl overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                        <thead className="bg-primary/20 text-primary">
                            <tr>
                                <th className="px-6 py-4 text-left font-bold whitespace-nowrap">Unit Name</th>
                                <th className="px-6 py-4 text-right font-bold whitespace-nowrap">Video Range</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-surface/80">
                            {activeRoadmap.summary.map((item, i) => (
                                <tr key={i} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-left text-text-main font-medium">{item.unit}</td>
                                    <td className="px-6 py-4 text-right font-mono text-accent font-bold">{item.range}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10 text-center">
                <p className="text-xs text-yellow-500/60">
                    <strong>Disclaimer:</strong> This study guide is based on publicly available resources and is intended for reference only.
                    While we strive for accuracy, please cross-check with your official syllabus and exam pattern.
                </p>
            </div>
        </div>
    );
};
