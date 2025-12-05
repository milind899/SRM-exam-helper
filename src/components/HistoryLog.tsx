import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import type { AttendanceSubject } from '../hooks/useAttendance';
import { Search, Calendar } from 'lucide-react';

interface HistoryLogProps {
    subjects: AttendanceSubject[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ subjects }) => {
    const [filter, setFilter] = useState('');

    // Flatten all logs from all subjects into one timeline
    const allLogs = useMemo(() => {
        const logs = subjects.flatMap(sub =>
            (sub.logs || []).map(log => ({
                ...log,
                subjectName: sub.name,
                subjectCode: sub.code
            }))
        );

        // Sort by date descending
        return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [subjects]);

    const filteredLogs = allLogs.filter(log =>
        log.subjectName.toLowerCase().includes(filter.toLowerCase()) ||
        log.status.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="text-primary" size={20} />
                    History Log
                </h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {filteredLogs.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500">
                        No logs found.
                    </div>
                ) : (
                    filteredLogs.map((log, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-zinc-950/30 border border-white/5 rounded-2xl hover:bg-zinc-950/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-10 rounded-full ${log.status === 'Present' ? 'bg-emerald-500' :
                                    log.status === 'Absent' ? 'bg-rose-500' : 'bg-yellow-500'
                                    }`} />
                                <div>
                                    <div className="font-bold text-white">{log.subjectName}</div>
                                    <div className="text-xs text-zinc-500">{format(new Date(log.date), 'MMM dd, yyyy')} • {log.slot}</div>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${log.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' :
                                log.status === 'Absent' ? 'bg-rose-500/10 text-rose-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                {log.status}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
