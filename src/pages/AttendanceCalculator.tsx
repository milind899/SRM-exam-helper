import React, { useState } from 'react';
import { Plus, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { AddSubjectModal } from '../components/AddSubjectModal';
import { AttendanceCard } from '../components/AttendanceCard';
import { AttendanceStats } from '../components/AttendanceStats';
import { HistoryLog } from '../components/HistoryLog';
import { useAttendance } from '../hooks/useAttendance';

const AttendanceCalculator: React.FC = () => {
    const { subjects, addSubject, syncData, isLoading } = useAttendance();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // Handlers
    const handleAddSubject = (newSubject: { name: string; total: number; present: number; percentage?: string; code?: string }) => {
        addSubject({
            name: newSubject.name,
            code: newSubject.code || newSubject.name.substring(0, 3).toUpperCase(),
            total_hours: newSubject.total,
            present_hours: newSubject.present,
            logs: [],
            settings: { target: 75, credits: 3 }
        }, {
            onSuccess: () => setIsModalOpen(false)
        });
    };

    const handleUpdate = (id: string, status: 'Present' | 'Absent') => {
        // We need an update mutation in useAttendance basically.
        // For now, let's just toast since we focused on fetch/sync first.
        // Real implementation would call updateSubject mutation.
        toast('Update feature coming in next step!', { icon: '🚧' });
    };

    const handleSyncClick = async () => {
        // Extension check
        if (!document.getElementById('srm-zen-bridge-installed')) {
            toast.error('Extension not detected! Please reload extension.');
            return;
        }

        setIsSyncing(true);
        const toastId = toast.loading('Syncing with SRM Portal...');

        const timeoutId = setTimeout(() => {
            setIsSyncing(false);
            toast.error('Timeout: Ensure Portal tab is open.', { id: toastId });
        }, 15000);

        const handleMessage = async (event: MessageEvent) => {
            if (event.source !== window) return;
            if (event.data.type === 'SYNC_RESPONSE') {
                clearTimeout(timeoutId);
                window.removeEventListener('message', handleMessage);
                setIsSyncing(false);

                if (event.data.success) {
                    // Transform data for Supabase
                    const portalData = event.data.data.attendance.map((s: any) => ({
                        code: s.code,
                        name: s.courseTitle,
                        total: parseInt(s.hoursConducted) || 0,
                        present: parseInt(s.hoursAttended) || 0,
                        logs: s.logs || [] // Detailed logs from scraper
                    }));

                    try {
                        await syncData(portalData);
                        toast.success('Synced successfully!', { id: toastId });
                        confetti();
                    } catch (e) {
                        toast.error('Sync failed to save.', { id: toastId });
                    }
                } else {
                    toast.error('Sync failed: ' + event.data.error, { id: toastId });
                }
            }
        };

        window.addEventListener('message', handleMessage);
        window.postMessage({ type: 'SYNC_REQUEST' }, '*');
    };

    if (isLoading) {
        return <div className="p-8 text-center text-zinc-500">Loading attendance data...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/30 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Attendance
                    </h1>
                    <p className="text-zinc-500 mt-1">Track, Predict, and Manage.</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href="https://sp.srmist.edu.in/srmiststudentportal/students/loginManager/youLogin.jsp"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-primary transition-all font-bold text-sm"
                    >
                        <ExternalLink size={16} />
                        Portal
                    </a>
                    <button
                        onClick={handleSyncClick}
                        disabled={isSyncing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all text-sm ${isSyncing
                            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20'}`}
                    >
                        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Syncing...' : 'Sync'}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 text-sm"
                    >
                        <Plus size={16} />
                        Add
                    </button>
                </div>
            </div>

            {/* Stats */}
            <AttendanceStats subjects={subjects} />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-white mb-4">Your Subjects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map(subject => (
                            <AttendanceCard
                                key={subject.id}
                                subject={subject}
                                onUpdate={handleUpdate}
                            />
                        ))}
                    </div>
                    {subjects.length === 0 && (
                        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-3xl">
                            <p className="text-zinc-500">No subjects found. Sync or Add manually.</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1">
                    <HistoryLog subjects={subjects} />
                </div>
            </div>

            <AddSubjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddSubject}
            />
        </div>
    );
};

export default AttendanceCalculator;
