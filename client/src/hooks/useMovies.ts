import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import toast from 'react-hot-toast';

export function useMovies(params?: {
  page?: number;
  limit?: number;
  genre?: string;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: ['movies', params],
    queryFn: () => movieService.getMovies(params),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection (formerly cacheTime)
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useMovie(id: string) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovieById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
  });
}

export function useRateMovie() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { rating: number; text?: string } }) =>
      movieService.rateMovie(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['movie', variables.id] });
      toast.success('Review submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    },
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: string) => movieService.addToWatchlist(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Added to watchlist!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add to watchlist');
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (movieId: string) => movieService.removeFromWatchlist(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Removed from watchlist');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove from watchlist');
    },
  });
}

export function useWatchHistory(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['watch-history', params],
    queryFn: () => movieService.getWatchHistory(params),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => movieService.getUserProfile(),
    staleTime: 3 * 60 * 1000, // 3 minutes cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
  });
}
