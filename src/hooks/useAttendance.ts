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
        scraped_percentage?: number; // From portal if hours missing
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

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log("Fetch Subjects: No active user found.");
            return [];
        }

        console.log("Fetch Subjects: Fetching for user", user.id);

        const { data, error } = await supabase
            .from('subjects')
            .select('*')
            // .eq('user_id', user.id) // Rely on RLS policies to filter
            .order('name');

        if (error) {
            console.error("Fetch Subjects Error:", error);
            throw error;
        }

        console.log("Fetch Subjects Success: DB returned", data?.length, "records.");

        // Transform JSONB logs to array if needed, and calculate percentage
        return (data || []).map((sub: any) => {
            const calculatedPercentage = sub.total_hours > 0 ? (sub.present_hours / sub.total_hours) * 100 : 0;
            // Prefer calculated percentage if hours exist, otherwise use scraped percentage from settings
            const percentage = sub.total_hours > 0 ? calculatedPercentage : (sub.settings?.scraped_percentage || 0);

            return {
                ...sub,
                percentage: percentage,
                logs: sub.logs || [],
                settings: sub.settings || { target: 75, credits: 3 }
            };
        }) as AttendanceSubject[];
    } catch (err) {
        console.error("Fetch Subjects Unexpected Error:", err);
        throw err;
    }
};

export function useAttendance() {
    const queryClient = useQueryClient();
    const { user, loading: authLoading } = useAuth();

    const { data: subjects = [], isLoading, error } = useQuery({
        queryKey: ['attendance_subjects', user?.id],
        queryFn: fetchSubjects,
        // staleTime removed to force fresh fetch on mount/update during debug
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
                    total_hours: s.total || 0,
                    present_hours: s.attended || 0, // Ensure naming matches scraper
                    logs: s.logs || [],
                    settings: {
                        target: 75,
                        credits: 3,
                        scraped_percentage: s.scrapedPercentage // Save this!
                    }
                });
            });

            const upserts = Array.from(uniqueSubjects.values());

            if (upserts.length === 0) {
                console.warn("No valid subjects to sync (all missed codes)");
                throw new Error("No valid subjects found. detection failed or empty data.");
            }

            console.log("Upserting subjects:", upserts);

            const { data, error } = await supabase
                .from('subjects')
                .upsert(upserts, { onConflict: 'user_id,code' })
                .select();

            if (error) {
                console.error("Supabase Upsert Error:", error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.warn("Upsert returned no data. RLS might be blocking or conflict ignored.");
            } else {
                console.log("Upsert Success. Rows confirmed:", data.length);
            }
        },
        onSuccess: async () => {
            // Invalidate exactly the active query to ensure refetch
            await queryClient.invalidateQueries({ queryKey: ['attendance_subjects'] });
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
