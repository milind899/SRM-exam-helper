import React, { useState, useEffect } from 'react';
import { Share2, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

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

    // Sync State
    const [showSyncModal, setShowSyncModal] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [captchaImage, setCaptchaImage] = useState<string | null>(null);
    const [cookies, setCookies] = useState<any[]>([]);
    const [credentials, setCredentials] = useState({ netId: '', password: '', captchaText: '' });
    const [syncError, setSyncError] = useState<string | null>(null);

    const API_BASE_URL = 'http://localhost:3000'; // TODO: Use env variable

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
            const margin = Math.floor((4 * present - 3 * total) / 3);
            return {
                status: 'safe',
                message: `Safe! You can miss ${margin} more classes.`,
                margin,
                percentage: percentage.toFixed(2)
            };
        } else {
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

    // Sync Logic
    const handleSyncClick = async () => {
        setShowSyncModal(true);
        setSyncError(null);
        setCaptchaImage(null);
        await fetchCaptcha();
    };

    const fetchCaptcha = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/crawl/captcha`);
            const data = await res.json();
            if (data.success) {
                setCaptchaImage(data.captchaImage);
                setCookies(data.cookies);
            } else {
                setSyncError('Failed to load captcha. Please try again.');
            }
        } catch (err) {
            console.error(err);
            setSyncError('Could not connect to crawler service.');
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSyncing(true);
        setSyncError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/api/crawl/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    netId: credentials.netId,
                    password: credentials.password,
                    captchaText: credentials.captchaText,
                    cookies
                })
            });
            const data = await res.json();

            if (data.success) {
                if (data.attendance && Array.isArray(data.attendance)) {
                     const newSubjects: Subject[] = data.attendance.map((item: any) => ({
                        id: item.code || Date.now().toString() + Math.random(),
                        name: item.name,
                        total: parseInt(item.total) || 0,
                        present: parseInt(item.attended) || 0
                    }));
                    setSubjects(newSubjects);
                    setShowSyncModal(false);
                    alert('Attendance synced successfully!');
                } else {
                     setSyncError('Invalid data format received from portal.');
                }
            } else {
                setSyncError(data.error || 'Login failed. Check credentials/captcha.');
                await fetchCaptcha();
                setCredentials(prev => ({ ...prev, captchaText: '' }));
            }
        } catch (err) {
            console.error(err);
            setSyncError('Sync failed. Please try again.');
        } finally {
            setIsSyncing(false);
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

                <div className="flex gap-2">
                     <button
                        onClick={handleSyncClick}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Sync Portal
                    </button>
                    <div className="flex bg-surface rounded-lg p-1 border border-white/10">
                        <button
                            onClick={() => setDepartment('ENT')}
                            className={`px-4 py-2 rounded-md transition-all ${department === 'ENT'
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            ENT
                        </button>
                        <button
                            onClick={() => setDepartment('FSH')}
                            className={`px-4 py-2 rounded-md transition-all ${department === 'FSH'
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-text-muted hover:text-text-main'
                                }`}
                        >
                            FSH
                        </button>
                    </div>
                </div>
            </div>

            {/* Sync Modal */}
            {showSyncModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Sync with SRM Portal</h2>
                        
                        {syncError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">
                                {syncError}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-muted mb-1">NetID (Register No)</label>
                                <input 
                                    type="text" 
                                    value={credentials.netId}
                                    onChange={e => setCredentials({...credentials, netId: e.target.value})}
                                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 focus:border-primary outline-none"
                                    placeholder="RA..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-text-muted mb-1">Password</label>
                                <input 
                                    type="password" 
                                    value={credentials.password}
                                    onChange={e => setCredentials({...credentials, password: e.target.value})}
                                    className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            
                            {captchaImage ? (
                                <div>
                                    <label className="block text-sm text-text-muted mb-1">Captcha</label>
                                    <div className="flex gap-2 mb-2">
                                        <img src={captchaImage} alt="Captcha" className="h-10 rounded border border-white/10" />
                                        <button type="button" onClick={fetchCaptcha} className="p-2 hover:bg-white/5 rounded">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={credentials.captchaText}
                                        onChange={e => setCredentials({...credentials, captchaText: e.target.value})}
                                        className="w-full bg-background/50 border border-white/10 rounded-lg px-3 py-2 focus:border-primary outline-none"
                                        placeholder="Enter code"
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="text-center py-4 text-text-muted">Loading Captcha...</div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowSyncModal(false)}
                                    className="flex-1 py-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isSyncing}
                                    className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                                >
                                    {isSyncing ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Syncing...
                                        </>
                                    ) : 'Login & Sync'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                {subjects.map((subject) => {
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
