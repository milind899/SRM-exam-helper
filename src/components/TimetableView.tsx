import React, { useState } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimetableEntry {
    day: string;
    period: string;
    time: string;
    subject: string;
    room: string;
}

interface TimetableViewProps {
    timetable: TimetableEntry[];
}

const TimetableView: React.FC<TimetableViewProps> = ({ timetable }) => {
    const [viewMode, setViewMode] = useState<'today' | 'week'>('today');

    // Get current day
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    const today = days[todayIndex];

    // Filter for today's classes
    const todaysClasses = timetable.filter(entry =>
        entry.day.toLowerCase() === today.toLowerCase() ||
        entry.day.toLowerCase().includes(today.toLowerCase())
    );

    // Sort by time/period
    todaysClasses.sort((a, b) => a.period.localeCompare(b.period));

    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    return (
        <div className="space-y-6">
            {/* View Toggle */}
            <div className="flex justify-center">
                <div className="bg-zinc-950 p-1 rounded-xl border border-zinc-800 inline-flex">
                    <button
                        onClick={() => setViewMode('today')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'today'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Today's Schedule
                    </button>
                    <button
                        onClick={() => setViewMode('week')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'week'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        Weekly View
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {viewMode === 'today' ? (
                    <motion.div
                        key="today"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-2xl mx-auto"
                    >
                        {todaysClasses.length === 0 ? (
                            <div className="text-center py-16 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl">
                                <div className="bg-zinc-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-zinc-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Classes Today</h3>
                                <p className="text-zinc-500">Enjoy your free time! 🎉</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {todaysClasses.map((cls, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex items-start gap-4 hover:border-zinc-700 transition-all group relative overflow-hidden"
                                    >
                                        {/* Time Column */}
                                        <div className="flex flex-col items-center min-w-[80px] pt-1">
                                            <span className="text-zinc-400 text-xs font-mono mb-1">{cls.period}</span>
                                            <span className="text-white font-bold text-lg">{cls.time.split('-')[0]}</span>
                                            <span className="text-zinc-500 text-xs">{cls.time.split('-')[1]}</span>
                                        </div>

                                        {/* Divider */}
                                        <div className="w-px bg-zinc-800 self-stretch" />

                                        {/* Content */}
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">
                                                {cls.subject}
                                            </h4>
                                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                                                <span className="flex items-center gap-1.5 bg-zinc-950 px-2 py-1 rounded-md border border-zinc-800">
                                                    <MapPin size={14} /> {cls.room}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} /> {cls.time}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Active Indicator (Mock logic for now) */}
                                        {idx === 0 && (
                                            <div className="absolute top-0 right-0 p-2">
                                                <span className="flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="week"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="overflow-x-auto pb-4"
                    >
                        <div className="min-w-[800px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                            <div className="grid grid-cols-6 border-b border-zinc-800 bg-zinc-950/50">
                                <div className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-r border-zinc-800">Day</div>
                                {[1, 2, 3, 4, 5].map(slot => (
                                    <div key={slot} className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-wider border-r border-zinc-800 last:border-0">
                                        Slot {slot}
                                    </div>
                                ))}
                            </div>

                            {weekDays.map((day) => {
                                const dayClasses = timetable.filter(t => t.day.includes(day));
                                return (
                                    <div key={day} className="grid grid-cols-6 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/30 transition-colors">
                                        <div className="p-4 text-sm font-bold text-zinc-400 border-r border-zinc-800 flex items-center">
                                            {day}
                                        </div>
                                        {[1, 2, 3, 4, 5].map(slot => {
                                            const cls = dayClasses.find(c => c.period.includes(slot.toString()) || c.period === `Slot ${slot}`);
                                            return (
                                                <div key={slot} className="p-3 border-r border-zinc-800 last:border-0 min-h-[100px]">
                                                    {cls ? (
                                                        <div className="h-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs flex flex-col justify-between group hover:border-primary/50 transition-colors cursor-default">
                                                            <div className="font-bold text-zinc-200 line-clamp-2 mb-1" title={cls.subject}>
                                                                {cls.subject}
                                                            </div>
                                                            <div className="flex justify-between items-end text-[10px] text-zinc-500">
                                                                <span>{cls.room}</span>
                                                                <span className="font-mono">{cls.time.split('-')[0]}</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-full flex items-center justify-center">
                                                            <span className="text-zinc-800 text-2xl font-light">-</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimetableView;
