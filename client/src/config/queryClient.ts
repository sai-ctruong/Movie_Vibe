import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// Optimized default options for React Query
const queryConfig: DefaultOptions = {
  queries: {
    // Stale time: khoảng thời gian data được coi là "fresh"
    staleTime: 1000 * 60 * 5, // 5 minutes
    // GC time: khoảng thời gian data được giữ trong bộ nhớ cache trước khi xóa
    gcTime: 1000 * 60 * 10, // 10 minutes
    // Retry strategy cho failed requests
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Enable refetch on window focus
    refetchOnWindowFocus: false,
    // Enable refetch on mount
    refetchOnMount: false,
  },
  mutations: {
    retry: 1,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

// Create Query Client instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});
