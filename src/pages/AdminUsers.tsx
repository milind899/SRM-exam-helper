import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Layout } from '../components/Layout';
import { Users, Search, Clock, Shield, Lock, AlertTriangle, Database } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface UserData {
    id: string;
    email: string;
    nickname?: string;
    last_seen: string;
}

const ADMIN_EMAIL = 'milindshandilya899@gmail.com';
const ADMIN_PIN = '390019';

export default function AdminUsers() {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Auth State
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [authError, setAuthError] = useState(false);

    useEffect(() => {
        if (user?.email === ADMIN_EMAIL) {
            setIsAuthorized(true);
        }
    }, [user]);

    useEffect(() => {
        if (isAuthorized) {
            fetchUsers();
        }
    }, [isAuthorized]);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === ADMIN_PIN) {
            setIsAuthorized(true);
            setAuthError(false);
            toast.success('Access Granted');
        } else {
            setAuthError(true);
            toast.error('Invalid PIN');
        }
    };

    const fetchUsers = async () => {
        if (!isSupabaseConfigured || !supabase) {
            setError('Supabase not configured');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('last_seen', { ascending: false });

            if (error) throw error;

            setUsers(data || []);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInitializeDB = async () => {
        const confirm = window.confirm('This will attempt to create the "users" table. Continue?');
        if (!confirm) return;

        try {
            const res = await fetch('/api/setup_mcq');
            const data = await res.json();
            if (data.success || data.message) {
                toast.success('Database initialized!');
                window.location.reload();
            } else {
                toast.error('Failed to initialize DB');
            }
        } catch (err) {
            toast.error('Error calling setup API');
            console.error(err);
        }
    };

    if (!isAuthorized) {
        return (
            <Layout
                currentTheme="dark"
                onThemeChange={() => { }}
                onShowShortcuts={() => { }}
                progressPercentage={0}
                currentSubjectTitle="Admin Access"
                headerActions={<div />}
            >
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="bg-surface border border-white/10 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Lock size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-text-main mb-2">Restricted Access</h1>
                        <p className="text-text-muted mb-8">
                            This page is restricted to administrators. <br />
                            Please enter the PIN or sign in with an authorized email.
                        </p>

                        <form onSubmit={handlePinSubmit} className="space-y-4">
                            <input
                                type="password"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                placeholder="Enter Admin PIN"
                                className={`w-full bg-background/50 border ${authError ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 text-center text-lg tracking-widest focus:outline-none focus:border-primary/50 transition-colors`}
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors"
                            >
                                Unlock Access
                            </button>
                        </form>
                    </div>
                </div>
            </Layout>
        );
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.nickname && u.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Layout
            currentTheme="dark"
            onThemeChange={() => { }}
            onShowShortcuts={() => { }}
            progressPercentage={0}
            currentSubjectTitle="Admin"
            headerActions={
                <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg font-bold text-sm">
                    <Shield size={16} />
                    Admin Area
                </div>
            }
        >
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-text-main mb-2">User Management</h1>
                        <p className="text-text-muted">View and manage signed-in users</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {error && (
                            <button
                                onClick={handleInitializeDB}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors font-medium"
                            >
                                <Database size={16} />
                                Fix Database
                            </button>
                        )}
                        <div className="bg-surface border border-white/10 px-4 py-2 rounded-xl text-sm font-medium">
                            Total Users: <span className="text-primary font-bold">{users.length}</span>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                    <input
                        type="text"
                        placeholder="Search by email, nickname, or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded-xl pl-12 pr-4 py-3 text-text-main focus:outline-none focus:border-primary/50 transition-colors"
                    />
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3">
                        <AlertTriangle className="shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold mb-1">Database Error</p>
                            <p className="text-sm opacity-80">{error}</p>
                            {error.includes('relation "public.users" does not exist') && (
                                <p className="text-sm mt-2 text-amber-400">
                                    The "users" table is missing. Click "Fix Database" above to create it.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12 text-text-muted">Loading users...</div>
                ) : (
                    <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-white/5">
                                        <th className="p-4 font-medium text-text-muted text-sm">User</th>
                                        <th className="p-4 font-medium text-text-muted text-sm">Nickname</th>
                                        <th className="p-4 font-medium text-text-muted text-sm">Email</th>
                                        <th className="p-4 font-medium text-text-muted text-sm">Last Seen</th>
                                        <th className="p-4 font-medium text-text-muted text-sm">ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                                    <Users size={16} />
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-text-main">
                                                {user.nickname || <span className="text-text-muted italic">No nickname</span>}
                                            </td>
                                            <td className="p-4 text-text-muted text-sm">{user.email}</td>
                                            <td className="p-4 text-text-muted text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={14} />
                                                    {new Date(user.last_seen).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                                </div>
                                            </td>
                                            <td className="p-4 text-text-muted text-xs font-mono opacity-50">
                                                {user.id}
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && !error && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-text-muted">
                                                No users found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
