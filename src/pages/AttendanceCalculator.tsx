import React, { useState, useEffect } from 'react';
import { Calculator, Share2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

type Department = 'ENT' | 'FSH';

interface Subject {
    id: string;
    name: string;
    total: number;
    present: number;
}

const AttendanceCalculator: React.FC = () => {
    const [department, setDepartment] = useState<Department>('ENT');
    const [subjects, setSubjects] = useState<Subject[]>([
        { id: '1', name: 'Subject 1', total: 0, present: 0 }
    ]);

    // Load from local storage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('attendanceData');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setDepartment(parsed.department || 'ENT');
                setSubjects(parsed.subjects || [{ id: '1', name: 'Subject 1', total: 0, present: 0 }]);
            } catch (e) {
                console.error("Failed to load saved data", e);
            }
        }
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem('attendanceData', JSON.stringify({ department, subjects }));
    }, [department, subjects]);

    const addSubject = () => {
        setSubjects([...subjects, { id: Date.now().toString(), name: `Subject ${subjects.length + 1}`, total: 0, present: 0 }]);
    };

    const removeSubject = (id: string) => {
        if (subjects.length > 1) {
            setSubjects(subjects.filter(s => s.id !== id));
        }
    };

    const updateSubject = (id: string, field: keyof Subject, value: string | number) => {
        setSubjects(subjects.map(s => {
            if (s.id === id) {
                return { ...s, [field]: value };
            }
            return s;
        }));
    };

    const calculateMargin = (total: number, present: number) => {
        if (total === 0) return { status: 'neutral', message: 'Enter data', margin: 0 };

        const percentage = (present / total) * 100;
        const target = 75;

        if (percentage >= target) {
            // Safe: How many can I miss?
            // (Present) / (Total + x) >= 0.75
            // Present >= 0.75 * Total + 0.75 * x
            // Present - 0.75 * Total >= 0.75 * x
            // (Present - 0.75 * Total) / 0.75 >= x
            // (4 * Present - 3 * Total) / 3 >= x
            const margin = Math.floor((4 * present - 3 * total) / 3);
            return {
                status: 'safe',
                message: `Safe! You can miss ${margin} more classes.`,
                margin,
                percentage: percentage.toFixed(2)
            };
        } else {
            // Danger: How many must I attend?
            // (Present + x) / (Total + x) >= 0.75
            // Present + x >= 0.75 * Total + 0.75 * x
            // 0.25 * x >= 0.75 * Total - Present
            // x >= 3 * Total - 4 * Present
            const required = Math.ceil(3 * total - 4 * present);
            return {
                status: 'danger',
                message: `Critical! You MUST attend next ${required} classes.`,
                margin: required,
                percentage: percentage.toFixed(2)
            };
        }
    };

    const getOverallStats = () => {
        const totalClasses = subjects.reduce((acc, s) => acc + Number(s.total), 0);
        const totalPresent = subjects.reduce((acc, s) => acc + Number(s.present), 0);
        return calculateMargin(totalClasses, totalPresent);
    };

    const handleShare = () => {
        let text = "";
        if (department === 'ENT') {
            const safeCount = subjects.filter(s => calculateMargin(s.total, s.present).status === 'safe').length;
            text = `I'm safe in ${safeCount}/${subjects.length} subjects! Check your margin on SRM Zen. #SRMZen`;
        } else {
            const stats = getOverallStats();
            text = `I have ${stats.percentage}% overall attendance! Check your margin on SRM Zen. #SRMZen`;
        }

        if (navigator.share) {
            navigator.share({
                title: 'SRM Zen Attendance',
                text: text,
                url: window.location.href,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text);
            alert('Status copied to clipboard!');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Attendance Margin Calculator
                    </h1>
                    <p className="text-text-muted mt-2">
                        Calculate exactly how many classes you can miss (or must attend).
                    </p>
                </div>

                <div className="flex bg-surface rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setDepartment('ENT')}
                        className={`px-4 py-2 rounded-md transition-all ${department === 'ENT'
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        ENT (Subject-wise)
                    </button>
                    <button
                        onClick={() => setDepartment('FSH')}
                        className={`px-4 py-2 rounded-md transition-all ${department === 'FSH'
                                ? 'bg-primary text-white shadow-lg'
                                : 'text-text-muted hover:text-text-main'
                            }`}
                    >
                        FSH (Overall)
                    </button>
                </div>
            </div>

            {/* FSH Overall Status Card */}
            {department === 'FSH' && (
                <div className="bg-surface border border-white/10 rounded-xl p-6 mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 text-center">
                        <h2 className="text-xl font-semibold mb-2">Overall Status</h2>
                        {(() => {
                            const stats = getOverallStats();
                            return (
                                <div className={`text-4xl font-bold mb-2 ${stats.status === 'safe' ? 'text-green-400' : stats.status === 'danger' ? 'text-red-400' : 'text-text-muted'
                                    }`}>
                                    {stats.percentage || 0}%
                                    <span className="text-lg font-normal text-text-muted ml-2">
                                        ({stats.status === 'safe' ? 'Safe' : stats.status === 'danger' ? 'Danger' : 'Neutral'})
                                    </span>
                                </div>
                            );
                        })()}
                        <p className="text-text-main/80">{getOverallStats().message}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {subjects.map((subject, index) => {
                    const stats = calculateMargin(subject.total, subject.present);

                    return (
                        <div key={subject.id} className="bg-surface border border-white/10 rounded-xl p-6 transition-all hover:border-primary/50 group">
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between mb-2">
                                        <input
                                            type="text"
                                            value={subject.name}
                                            onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                                            className="bg-transparent border-b border-transparent hover:border-white/20 focus:border-primary outline-none text-lg font-medium w-full"
                                            placeholder="Subject Name"
                                        />
                                        {subjects.length > 1 && (
                                            <button
                                                onClick={() => removeSubject(subject.id)}
                                                className="text-text-muted hover:text-red-400 ml-2"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Total Conducted</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={subject.total || ''}
                                                onChange={(e) => updateSubject(subject.id, 'total', parseInt(e.target.value) || 0)}
                                                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted block mb-1">Attended</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max={subject.total}
                                                value={subject.present || ''}
                                                onChange={(e) => updateSubject(subject.id, 'present', parseInt(e.target.value) || 0)}
                                                className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Subject Stats (Always visible for ENT, visible for detail in FSH) */}
                                <div className="w-full md:w-64 bg-background/30 rounded-lg p-4 border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-text-muted">Attendance</span>
                                        <span className={`font-bold ${stats.status === 'safe' ? 'text-green-400' : stats.status === 'danger' ? 'text-red-400' : 'text-text-muted'
                                            }`}>
                                            {stats.percentage || 0}%
                                        </span>
                                    </div>

                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                                        <div
                                            className={`h-full transition-all duration-500 ${stats.status === 'safe' ? 'bg-green-500' : stats.status === 'danger' ? 'bg-red-500' : 'bg-gray-500'
                                                }`}
                                            style={{ width: `${Math.min(Number(stats.percentage) || 0, 100)}%` }}
                                        />
                                    </div>

                                    <div className="flex items-start gap-2 text-sm">
                                        {stats.status === 'safe' ? (
                                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                                        ) : stats.status === 'danger' ? (
                                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                        ) : (
                                            <RefreshCw className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                                        )}
                                        <span className="text-text-main/80 text-xs leading-tight">
                                            {stats.message}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    onClick={addSubject}
                    className="flex-1 bg-surface border border-white/10 hover:border-primary/50 text-text-main py-3 rounded-xl transition-all font-medium"
                >
                    + Add Subject
                </button>

                <button
                    onClick={handleShare}
                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-medium flex items-center justify-center gap-2"
                >
                    <Share2 className="w-5 h-5" />
                    Share Status
                </button>
            </div>
        </div>
    );
};

export default AttendanceCalculator;
