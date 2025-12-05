import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

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
        .order('name');

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

    const { data: subjects = [], isLoading, error } = useQuery({
        queryKey: ['attendance_subjects'],
        queryFn: fetchSubjects,
        staleTime: 1000 * 60 * 60 * 24, // 24 hours stale time (Offline first)
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
            // This is a complex bulk upsert.
            // For each subject in sync data, we upsert into DB.
            // Since we use JSONB, we just replace the whole record or merge logs?
            // For simplicity/cost: We OVERWRITE local data with Portal Data (Source of Truth).
            // But we preserve "Custom Logs" if we had that feature.

            // Upsert Subjects
            const upserts = syncedData.map(s => ({
                user_id: (supabase?.auth.getUser() as any).id, // handled by default usually
                code: s.code,
                name: s.name,
                total_hours: s.total,
                present_hours: s.present,
                logs: s.logs || [], // If the scraper provides logs
                settings: { target: 75, credits: 3 } // Default
            }));

            const { error } = await supabase
                .from('subjects')
                .upsert(upserts, { onConflict: 'code,user_id' as any }); // We need a unique constraint on code?
            // Actually unique constraint might be 'id'.
            // We will match by 'name' or 'code' manually or assume 'code' is unique per user.
            // For now, let's just assume we might duplicate if we don't have unique constraint.
            // We should add a unique index on (user_id, code) in SQL.

            if (error) throw error;
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
