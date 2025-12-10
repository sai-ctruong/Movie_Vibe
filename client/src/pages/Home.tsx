import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import { nguoncService } from '../services/nguoncService';
import { ophimService } from '../services/ophimService';
import { Movie } from '../types';
import MovieRow from '../components/movie/MovieRow';
import TrendingRow from '../components/movie/TrendingRow';
import NguoncMovieRow from '../components/movie/NguoncMovieRow';
import OphimMovieRow from '../components/movie/OphimMovieRow';
import HeroSection from '../components/HeroSection';
import { Clock, Tv, Film, Clapperboard, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Home() {
  const navigate = useNavigate();
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);

  // Fetch popular movies
  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => movieService.getMovies({ sortBy: 'popular', limit: 20 }),
  });

  // Fetch recent movies
  const { data: recentMovies } = useQuery({
    queryKey: ['movies', 'recent'],
    queryFn: () => movieService.getMovies({ sortBy: 'recent', limit: 20 }),
  });

  // Fetch top rated movies
  const { data: topRatedMovies } = useQuery({
    queryKey: ['movies', 'rating'],
    queryFn: () => movieService.getMovies({ sortBy: 'rating', limit: 20 }),
  });

  // Fetch watch history
  const { data: watchHistory } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: () => movieService.getWatchHistory({ limit: 10 }),
  });

  // ============ NGUONC API - Nhiều loại phim ============
  
  // Phim mới cập nhật
  const { data: nguoncLatest, isLoading: nguoncLatestLoading } = useQuery({
    queryKey: ['nguonc-movies', 'latest', 1],
    queryFn: () => nguoncService.getLatestMovies(1),
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  // Phim lẻ
  const { data: nguoncSingle, isLoading: nguoncSingleLoading } = useQuery({
    queryKey: ['nguonc-movies', 'phim-le', 1],
    queryFn: () => nguoncService.getMoviesByType('phim-le', 1),
    staleTime: 5 * 60 * 1000,
  });

  // Phim bộ
  const { data: nguoncSeries, isLoading: nguoncSeriesLoading } = useQuery({
    queryKey: ['nguonc-movies', 'phim-bo', 1],
    queryFn: () => nguoncService.getMoviesByType('phim-bo', 1),
    staleTime: 5 * 60 * 1000,
  });

  // Phim hoạt hình
  const { data: nguoncAnime, isLoading: nguoncAnimeLoading } = useQuery({
    queryKey: ['nguonc-movies', 'hoat-hinh', 1],
    queryFn: () => nguoncService.getMoviesByType('hoat-hinh', 1),
    staleTime: 5 * 60 * 1000,
  });

  // TV Shows
  const { data: nguoncTV, isLoading: nguoncTVLoading } = useQuery({
    queryKey: ['nguonc-movies', 'tv-shows', 1],
    queryFn: () => nguoncService.getMoviesByType('tv-shows', 1),
    staleTime: 5 * 60 * 1000,
  });

  // ============ OPHIM API - Nguồn phim với m3u8 hoạt động (không quảng cáo) ============
  
  // OPhim - Phim mới cập nhật
  const { data: ophimLatest, isLoading: ophimLatestLoading } = useQuery({
    queryKey: ['ophim-movies', 'latest', 1],
    queryFn: () => ophimService.getLatestMovies(1),
    staleTime: 5 * 60 * 1000,
  });

  // OPhim - Phim lẻ
  const { data: ophimSingle, isLoading: ophimSingleLoading } = useQuery({
    queryKey: ['ophim-movies', 'single', 1],
    queryFn: () => ophimService.getSingleMovies(1),
    staleTime: 5 * 60 * 1000,
  });

  // OPhim - Phim bộ
  const { data: ophimSeries, isLoading: ophimSeriesLoading } = useQuery({
    queryKey: ['ophim-movies', 'series', 1],
    queryFn: () => ophimService.getSeriesMovies(1),
    staleTime: 5 * 60 * 1000,
  });

  // OPhim - Hoạt hình
  const { data: ophimAnime, isLoading: ophimAnimeLoading } = useQuery({
    queryKey: ['ophim-movies', 'anime', 1],
    queryFn: () => ophimService.getAnimeMovies(1),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (moviesData?.movies && moviesData.movies.length > 0) {
      setHeroMovies(moviesData.movies.slice(0, 5));
    }
  }, [moviesData]);

  const handleAddToWatchlist = async (movieId: string) => {
    try {
      await movieService.addToWatchlist(movieId);
      toast.success('Đã thêm vào danh sách');
    } catch (error) {
      toast.error('Không thể thêm vào danh sách');
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black">
        <div className="h-[85vh] shimmer" />
        <div className="px-4 md:px-12 py-8">
          <div className="h-8 w-48 shimmer rounded mb-4" />
          <div className="flex space-x-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-48 h-72 shimmer rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section with rotating featured movies */}
      {heroMovies.length > 0 && <HeroSection movies={heroMovies} />}

      {/* Movie Rows Container */}
      <div className="-mt-24 relative z-10 pb-16 space-y-8">
        
        {/* Continue Watching Section */}
        {watchHistory?.history && watchHistory.history.length > 0 && (
          <div className="pt-4">
            <h2 className="text-white text-xl md:text-2xl font-bold mb-4 px-4 md:px-12 flex items-center">
              <Clock className="w-5 h-5 md:w-6 md:h-6 mr-2 text-yellow-500" />
              Tiếp tục xem
            </h2>
            <div className="flex space-x-4 overflow-x-auto custom-scrollbar px-4 md:px-12 pb-4">
              {watchHistory.history.map((item: any) => (
                <div
                  key={item._id}
                  className="flex-shrink-0 w-56 md:w-64 cursor-pointer group"
                  onClick={() => navigate(`/watch/${item.movieId._id}`)}
                >
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={`http://localhost:5000${item.movieId.thumbnail}`}
                      alt={item.movieId.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=No+Image';
                      }}
                    />
                    {/* Progress bar */}
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${Math.min(item.progress * 100, 100)}%` }}
                      />
                    </div>
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-3">
                        <Film className="w-6 h-6 md:w-8 md:h-8 text-black" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-white text-sm mt-2 line-clamp-1 font-medium">{item.movieId.title}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ NGUONC SECTIONS - Phim từ nguồn phim.nguonc.com ============ */}
        
        {/* Phim Mới Cập Nhật */}
        <NguoncMovieRow
          title="🔥 Phim Mới Cập Nhật"
          movies={nguoncLatest?.items || []}
          isLoading={nguoncLatestLoading}
          icon={<Sparkles className="w-5 h-5 text-orange-500" />}
        />

        {/* Phim Lẻ */}
        <NguoncMovieRow
          title="🎬 Phim Lẻ Hay"
          movies={nguoncSingle?.items || []}
          isLoading={nguoncSingleLoading}
          icon={<Film className="w-5 h-5 text-blue-500" />}
        />

        {/* Phim Bộ */}
        <NguoncMovieRow
          title="📺 Phim Bộ Đang Hot"
          movies={nguoncSeries?.items || []}
          isLoading={nguoncSeriesLoading}
          icon={<Tv className="w-5 h-5 text-green-500" />}
        />

        {/* Phim Hoạt Hình */}
        <NguoncMovieRow
          title="🎨 Hoạt Hình"
          movies={nguoncAnime?.items || []}
          isLoading={nguoncAnimeLoading}
          icon={<Clapperboard className="w-5 h-5 text-pink-500" />}
        />

        {/* TV Shows */}
        <NguoncMovieRow
          title="📡 TV Shows"
          movies={nguoncTV?.items || []}
          isLoading={nguoncTVLoading}
          icon={<Tv className="w-5 h-5 text-purple-500" />}
        />

        {/* ============ OPHIM SECTIONS - Nguồn phim không quảng cáo ============ */}
        
        {/* OPhim - Phim Mới (KHÔNG QUẢNG CÁO) */}
        <OphimMovieRow
          title="⚡ Phim Mới HD (Không QC)"
          movies={ophimLatest?.data?.items || []}
          isLoading={ophimLatestLoading}
          icon={<Zap className="w-5 h-5 text-green-500" />}
        />

        {/* OPhim - Phim Lẻ (KHÔNG QUẢNG CÁO) */}
        <OphimMovieRow
          title="🎬 Phim Lẻ HD (Không QC)"
          movies={ophimSingle?.data?.items || []}
          isLoading={ophimSingleLoading}
          icon={<Film className="w-5 h-5 text-emerald-500" />}
        />

        {/* OPhim - Phim Bộ (KHÔNG QUẢNG CÁO) */}
        <OphimMovieRow
          title="📺 Phim Bộ HD (Không QC)"
          movies={ophimSeries?.data?.items || []}
          isLoading={ophimSeriesLoading}
          icon={<Tv className="w-5 h-5 text-teal-500" />}
        />

        {/* OPhim - Hoạt Hình (KHÔNG QUẢNG CÁO) */}
        <OphimMovieRow
          title="🎨 Hoạt Hình HD (Không QC)"
          movies={ophimAnime?.data?.items || []}
          isLoading={ophimAnimeLoading}
          icon={<Clapperboard className="w-5 h-5 text-cyan-500" />}
        />

        {/* ============ LOCAL DATABASE SECTIONS ============ */}
        
        {/* Trending Now - Top 10 */}
        {moviesData?.movies && moviesData.movies.length > 0 && (
          <TrendingRow
            title="Trending Now"
            movies={moviesData.movies}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}

        {/* Popular on MovieFlix */}
        {moviesData?.movies && moviesData.movies.length > 0 && (
          <MovieRow
            title="Popular on MovieFlix"
            movies={moviesData.movies}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}

        {/* Recently Added */}
        {recentMovies?.movies && recentMovies.movies.length > 0 && (
          <MovieRow
            title="Recently Added"
            movies={recentMovies.movies}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}

        {/* Top Rated */}
        {topRatedMovies?.movies && topRatedMovies.movies.length > 0 && (
          <MovieRow
            title="Top Rated"
            movies={topRatedMovies.movies}
            onAddToWatchlist={handleAddToWatchlist}
          />
        )}

        {/* Quick Actions Section */}
        <div className="mt-8 px-4 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/browse')}
              className="glass-card p-6 cursor-pointer hover:bg-white/10 transition group"
            >
              <Film className="w-10 h-10 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white text-lg font-semibold mb-1 text-center">Khám Phá</h3>
              <p className="text-gray-400 text-sm text-center">Tìm kiếm phim theo thể loại</p>
            </div>
            
            <div 
              onClick={() => navigate('/profile')}
              className="glass-card p-6 cursor-pointer hover:bg-white/10 transition group"
            >
              <Clock className="w-10 h-10 text-yellow-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white text-lg font-semibold mb-1 text-center">Danh Sách</h3>
              <p className="text-gray-400 text-sm text-center">Xem phim đã lưu</p>
            </div>
            
            <div 
              onClick={() => navigate('/search')}
              className="glass-card p-6 cursor-pointer hover:bg-white/10 transition group"
            >
              <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white text-lg font-semibold mb-1 text-center">Tìm Kiếm</h3>
              <p className="text-gray-400 text-sm text-center">Tìm phim yêu thích</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
