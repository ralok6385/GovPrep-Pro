import useSWR, { SWRConfiguration } from 'swr';
import api from '@/lib/api';

// Global fetcher for SWR — uses our existing axios instance (has auth headers)
const fetcher = (url: string) => api.get(url).then(res => res.data);

/**
 * useAPI - A cached data fetching hook built on SWR.
 *
 * Features:
 * - Automatically caches responses in memory
 * - Revalidates on window focus
 * - Deduplicates concurrent requests to the same endpoint
 * - Returns cached data immediately while revalidating in the background
 *
 * @param url - The API endpoint (e.g. '/analytics/student')
 * @param options - Optional SWR config overrides
 *
 * Usage:
 *   const { data, error, isLoading, mutate } = useAPI('/analytics/student');
 */
export function useAPI<T = any>(url: string | null, options?: SWRConfiguration) {
    const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
        url,
        fetcher,
        {
            revalidateOnFocus: false, // Don't re-fetch on every tab switch (reduces API calls)
            dedupingInterval: 10000, // Deduplicate requests within 10s
            errorRetryCount: 2, // Retry failed requests twice
            ...options,
        }
    );

    return {
        data: data as T | undefined,
        error,
        isLoading,
        isValidating,
        mutate,
    };
}

/**
 * Preset hooks for common data fetching patterns
 */

// Dashboard data — stale-while-revalidate with 30s cache
export function useDashboardStats() {
    return useAPI('/analytics/student', {
        dedupingInterval: 30000,
    });
}

// My test results — cache for 15s
export function useMyResults() {
    return useAPI('/tests/results/me', {
        dedupingInterval: 15000,
    });
}

// Subjects list — rarely changes, cache for 2 minutes
export function useSubjects() {
    return useAPI('/subjects?all=true', {
        dedupingInterval: 120000,
        revalidateOnFocus: false,
    });
}

// Leaderboard — refresh more frequently
export function useLeaderboard() {
    return useAPI('/ranks/leaderboard', {
        dedupingInterval: 10000,
    });
}

// My bookmarks
export function useMyBookmarks() {
    return useAPI('/bookmarks', {
        dedupingInterval: 5000,
    });
}

// Videos/Content
export function useContent(type: string = 'video') {
    return useAPI(`/content?type=${type}`, {
        dedupingInterval: 60000,
    });
}

// My rank
export function useMyRank() {
    return useAPI('/ranks/my-rank', {
        dedupingInterval: 30000,
    });
}

export { fetcher };
