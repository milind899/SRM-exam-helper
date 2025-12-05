import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export interface AttendanceSubject {
    id: string;
    code: string; // Course Code (e.g. 18CSC303J)
    name: string; // Course Title
    total_hours: number;
    present_hours: number;
    percentage: number; // Derived
    logs: AttendanceLog[];
    settings: {
        target: number; // e.g. 75
        credits: number;
    };
}

export interface AttendanceLog {
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Absent' | 'On Duty' | 'Cancelled';
    slot: string; // e.g. "Slot 1" or "08:00 AM"
}

// Fetch helper
const fetchSubjects = async () => {
    if (!supabase) throw new Error("Supabase not defined");
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .select('*')
        .order('name');

    console.log("Fetch Subjects Result:", { data, error, user: (await supabase.auth.getUser()).data.user });

    if (error) throw error;

    // Transform JSONB logs to array if needed, and calculate percentage
    return (data || []).map((sub: any) => ({
        ...sub,
        percentage: sub.total_hours > 0 ? (sub.present_hours / sub.total_hours) * 100 : 0,
        logs: sub.logs || [],
        settings: sub.settings || { target: 75, credits: 3 }
    })) as AttendanceSubject[];
};

export function useAttendance() {
    const queryClient = useQueryClient();
    const { user, loading: authLoading } = useAuth();

    const { data: subjects = [], isLoading, error } = useQuery({
        queryKey: ['attendance_subjects', user?.id],
        queryFn: fetchSubjects,
        staleTime: 1000 * 60 * 60 * 24,
        enabled: !authLoading && !!user,
    });

    // Example Mutation: Add Subject
    const addSubjectMutation = useMutation({
        mutationFn: async (newSubject: Partial<AttendanceSubject>) => {
            if (!supabase) throw new Error("Supabase not defined");
            const { data, error } = await supabase
                .from('subjects')
                .insert([{
                    name: newSubject.name,
                    code: newSubject.code || '',
                    total_hours: 0,
                    present_hours: 0,
                    logs: [],
                    settings: newSubject.settings || { target: 75, credits: 3 }
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance_subjects'] });
            toast.success('Subject added!');
        }
    });

    // Example Mutation: Update Logs (Sync)
    const syncMutation = useMutation({
        mutationFn: async (syncedData: any[]) => {
            if (!supabase) throw new Error("Supabase not defined");

            const { data: { user } } = await supabase.auth.getUser();
            const userId = user?.id;

            if (!userId) {
                throw new Error("User not authenticated. Please refresh.");
            }

            console.log("Preparing to sync subjects:", syncedData.length);

            // 1. Sanitize and Deduplicate
            const validSubjects = syncedData.filter(s => s.code && s.code.trim().length > 0);

            // Map to ensure uniqueness by Code
            const uniqueSubjects = new Map();
            validSubjects.forEach(s => {
                uniqueSubjects.set(s.code.trim(), {
                    user_id: userId,
                    code: s.code.trim(),
                    name: s.name,
                    total_hours: s.total,
                    present_hours: s.present,
                    logs: s.logs || [],
                    settings: { target: 75, credits: 3 }
                });
            });

            const upserts = Array.from(uniqueSubjects.values());

            if (upserts.length === 0) {
                console.warn("No valid subjects to sync (all missed codes)");
                return; // Nothing to save
            }

            console.log("Upserting subjects:", upserts);

            const { error } = await supabase
                .from('subjects')
                .upsert(upserts, { onConflict: 'user_id,code' });

            if (error) {
                console.error("Supabase Upsert Error:", error);
                throw error;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['attendance_subjects'] });
            toast.success('Synced successfully!');
        }
    });

    return {
        subjects,
        isLoading,
        error,
        addSubject: addSubjectMutation.mutate,
        syncData: syncMutation.mutateAsync
    };
}
