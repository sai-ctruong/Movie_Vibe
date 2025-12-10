import axios from 'axios';
import type { NguoncApiResponse, NguoncMovieResponse } from '../types/nguonc';

// Create axios instance for NguonC API
const nguoncApi = axios.create({
  baseURL: '/nguonc-api',
  timeout: 10000,
});

export const nguoncService = {
  /**
   * Get latest updated movies
   */
  async getLatestMovies(page: number = 1): Promise<NguoncApiResponse> {
    const response = await nguoncApi.get(`/films/phim-moi-cap-nhat?page=${page}`);
    return response.data;
  },

  /**
   * Get movies by type (phim-le, phim-bo, etc.)
   */
  async getMoviesByType(type: string, page: number = 1): Promise<NguoncApiResponse> {
    const response = await nguoncApi.get(`/films/danh-sach/${type}?page=${page}`);
    return response.data;
  },

  /**
   * Get movie detail by slug
   */
  async getMovieBySlug(slug: string): Promise<NguoncMovieResponse> {
    const response = await nguoncApi.get(`/film/${slug}`);
    return response.data;
  },

  /**
   * Search movies
   */
  async searchMovies(keyword: string, page: number = 1): Promise<NguoncApiResponse> {
    const response = await nguoncApi.get(`/films/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    return response.data;
  },

  /**
   * Get movies by genre
   */
  async getMoviesByGenre(genre: string, page: number = 1): Promise<NguoncApiResponse> {
    const response = await nguoncApi.get(`/films/the-loai/${genre}?page=${page}`);
    return response.data;
  },

  /**
   * Get movies by country
   */
  async getMoviesByCountry(country: string, page: number = 1): Promise<NguoncApiResponse> {
    const response = await nguoncApi.get(`/films/quoc-gia/${country}?page=${page}`);
    return response.data;
  },
};
