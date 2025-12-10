import api from './api';

export const movieService = {
  async getMovies(params?: {
    page?: number;
    limit?: number;
    genre?: string;
    sortBy?: string;
  }) {
    const response = await api.get('/movies', { params });
    return response.data;
  },

  async getMovieById(id: string) {
    const response = await api.get(`/movies/${id}`);
    return response.data;
  },

  async rateMovie(id: string, data: { rating: number; text?: string }) {
    const response = await api.post(`/movies/${id}/rate`, data);
    return response.data;
  },

  async recordWatch(id: string, data: { progress: number; timestamp: number }) {
    const response = await api.post(`/movies/${id}/watch`, data);
    return response.data;
  },

  async searchMovies(params: {
    query?: string;
    genres?: string;
    year?: number;
    rating?: number;
    language?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get('/search', { params });
    return response.data;
  },

  async addToWatchlist(movieId: string) {
    const response = await api.post('/user/watchlist', { movieId });
    return response.data;
  },

  async removeFromWatchlist(movieId: string) {
    const response = await api.delete(`/user/watchlist/${movieId}`);
    return response.data;
  },

  async getWatchHistory(params?: { page?: number; limit?: number }) {
    const response = await api.get('/user/watch-history', { params });
    return response.data;
  },

  async getUserProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },
};
