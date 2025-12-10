import axios from 'axios';
import type { OphimApiResponse, OphimMovieResponse } from '../types/ophim';

// OPhim API - Nguồn phim với m3u8 hoạt động tốt
const ophimApi = axios.create({
  baseURL: 'https://ophim1.com/v1/api',
  timeout: 15000,
});

// CDN Image domain
export const OPHIM_CDN_IMAGE = 'https://img.ophim.live/uploads/movies';

export const ophimService = {
  /**
   * Get danh sách phim mới cập nhật
   */
  async getLatestMovies(page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/danh-sach/phim-moi-cap-nhat?page=${page}`);
    return response.data;
  },

  /**
   * Get phim lẻ
   */
  async getSingleMovies(page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/danh-sach/phim-le?page=${page}`);
    return response.data;
  },

  /**
   * Get phim bộ
   */
  async getSeriesMovies(page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/danh-sach/phim-bo?page=${page}`);
    return response.data;
  },

  /**
   * Get hoạt hình
   */
  async getAnimeMovies(page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/danh-sach/hoat-hinh?page=${page}`);
    return response.data;
  },

  /**
   * Get TV Shows
   */
  async getTVShows(page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/danh-sach/tv-shows?page=${page}`);
    return response.data;
  },

  /**
   * Get chi tiết phim theo slug
   */
  async getMovieBySlug(slug: string): Promise<OphimMovieResponse> {
    const response = await ophimApi.get(`/phim/${slug}`);
    return response.data;
  },

  /**
   * Tìm kiếm phim
   */
  async searchMovies(keyword: string, page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    return response.data;
  },

  /**
   * Get phim theo thể loại
   */
  async getMoviesByCategory(categorySlug: string, page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/the-loai/${categorySlug}?page=${page}`);
    return response.data;
  },

  /**
   * Get phim theo quốc gia
   */
  async getMoviesByCountry(countrySlug: string, page: number = 1): Promise<OphimApiResponse> {
    const response = await ophimApi.get(`/quoc-gia/${countrySlug}?page=${page}`);
    return response.data;
  },

  /**
   * Helper: Get full image URL
   */
  getImageUrl(path: string): string {
    if (!path) return 'https://via.placeholder.com/300x450?text=No+Image';
    if (path.startsWith('http')) return path;
    return `${OPHIM_CDN_IMAGE}/${path}`;
  },

  /**
   * Helper: Get m3u8 URL từ episode
   * OPhim trả về link_m3u8 trực tiếp, không cần extract
   */
  getM3u8Url(linkM3u8: string): string {
    return linkM3u8;
  },
};
