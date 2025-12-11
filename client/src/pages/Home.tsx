
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import { nguoncService } from '../services/nguoncService';
import { ophimService } from '../services/ophimService';
import MovieRow from '../components/movie/MovieRow';
import TrendingRow from '../components/movie/TrendingRow';
import NguoncMovieRow from '../components/movie/NguoncMovieRow';
import OphimMovieRow from '../components/movie/OphimMovieRow';
import HeroBanner from '../components/HeroBanner';
import Top10Row from '../components/movie/Top10Row'; // Added this import
import { Clock, Film, Clapperboard, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
export default function Home() {
  const navigate = useNavigate();

  // Fetch popular movies (Local DB)
  const { data: moviesData, isLoading } = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => movieService.getMovies({ sortBy: 'popular', limit: 20 }),
  });

  // Fetch recent movies (Local DB)
  const { data: recentMovies } = useQuery({
    queryKey: ['movies', 'recent'],
    queryFn: () => movieService.getMovies({ sortBy: 'recent', limit: 20 }),
  });

  // Fetch watch history
  const { data: watchHistory } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: () => movieService.getWatchHistory({ limit: 10 }),
  });

  // ============ OPHIM API - VIP / NO ADS ============
  
  // OPhim - Phim mới cập nhật
  const { data: ophimLatest, isLoading: ophimLatestLoading } = useQuery({
    queryKey: ['ophim-movies', 'latest', 1],
    queryFn: () => ophimService.getLatestMovies(1),
    staleTime: 5 * 60 * 1000,
  });

  // OPhim - Phim Việt Nam (New Request)
  const { data: ophimVietnam, isLoading: ophimVietnamLoading } = useQuery({
    queryKey: ['ophim-movies', 'vietnam', 1],
    queryFn: () => ophimService.getMoviesByCountry('viet-nam', 1),
    staleTime: 10 * 60 * 1000,
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

  // ============ NGUONC API - GENERAL / ADS ============
  
  // Phim mới cập nhật
  const { data: nguoncLatest, isLoading: nguoncLatestLoading } = useQuery({
    queryKey: ['nguonc-movies', 'latest', 1],
    queryFn: () => nguoncService.getLatestMovies(1),
    staleTime: 5 * 60 * 1000,
  });

  // Phim lẻ
  const { data: nguoncSingle, isLoading: nguoncSingleLoading } = useQuery({
    queryKey: ['nguonc-movies', 'phim-le', 1],
    queryFn: () => nguoncService.getMoviesByType('phim-le', 1),
    staleTime: 5 * 60 * 1000,
  });

  const handleAddToWatchlist = async (movieId: string) => {
    try {
      await movieService.addToWatchlist(movieId);
      toast.success('Đã thêm vào danh sách');
    } catch (error) {
      toast.error('Không thể thêm vào danh sách');
    }
  };

  // Loading skeleton
  if (isLoading || ophimLatestLoading) {
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
      {/* Premium Hero Banner (from OPhim Latest) */}
      <HeroBanner movies={ophimLatest?.data?.items || []} />

      {/* Movie Rows Container */}
      <div className="-mt-12 md:-mt-24 relative z-10 pb-16 space-y-8 md:space-y-12">
        
        {/* Continue Watching Section */}
        {watchHistory?.history && watchHistory.history.length > 0 && (
          <div className="pt-4 animate-fade-in">
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
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg border border-gray-800 group-hover:border-gray-500 transition-all">
                    <img
                      src={`http://localhost:5001${item.movieId.thumbnail}`}
                      alt={item.movieId.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                      <div className="bg-white/90 rounded-full p-4 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                        <Film className="w-6 h-6 md:w-8 md:h-8 text-black fill-black" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-white text-sm mt-3 line-clamp-1 font-medium group-hover:text-red-500 transition">{item.movieId.title}</h3>
                  <p className="text-gray-500 text-xs">Phim từ thư viện</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ VIP SECTION (OPHIM) ============ */}
        <div className="space-y-8 animate-fade-in-up">
            <div className="px-4 md:px-12 mb-2">
                <span className="text-green-500 text-xs font-bold tracking-widest border border-green-500/30 px-2 py-1 rounded bg-green-500/10">
                    <i className="fas fa-crown mr-2"></i>
                    VIP ACCESS • TỐC ĐỘ CAO • KHÔNG QUẢNG CÁO
                </span>
            </div>
            
            {/* Top 10 Row */}
             <Top10Row 
               title="Top 10 Phim Bộ Hôm Nay"
               movies={ophimLatest?.data?.items?.slice(0, 10) || []}
               isLoading={ophimLatestLoading}
             />

            <OphimMovieRow
            title="Phim Mới Cập Nhật VIP"
            movies={ophimLatest?.data?.items || []}
            isLoading={ophimLatestLoading}
            icon={<i className="fas fa-bolt text-green-500 text-xl" />}
            />

            {/* Phim Việt Nam (Requested) */}
            <OphimMovieRow
            title="Phim Việt Nam Đặc Sắc"
            movies={ophimVietnam?.data?.items || []}
            isLoading={ophimVietnamLoading}
            icon={<i className="fas fa-star text-red-600 text-xl" />}
            />

            <OphimMovieRow
            title="Phim Lẻ Chọn Lọc"
            movies={ophimSingle?.data?.items || []}
            isLoading={ophimSingleLoading}
            icon={<i className="fas fa-film text-emerald-500 text-xl" />}
            />

            <OphimMovieRow
            title="Series Phim Bộ Hot"
            movies={ophimSeries?.data?.items || []}
            isLoading={ophimSeriesLoading}
            icon={<i className="fas fa-tv text-teal-500 text-xl" />}
            />
             
            <OphimMovieRow
            title="Anime & Hoạt Hình"
            movies={ophimAnime?.data?.items || []}
            isLoading={ophimAnimeLoading}
            icon={<Clapperboard className="w-5 h-5 text-cyan-500" />}
            />
        </div>


        {/* ============ DIVERSE SECTION (NGUONC) ============ */}
        <div className="space-y-8 animate-fade-in-up delay-200 border-t border-gray-800/50 pt-8">
            <div className="px-4 md:px-12 mb-2">
                 <span className="text-blue-500 text-xs font-bold tracking-widest border border-blue-500/30 px-2 py-1 rounded bg-blue-500/10">
                    <i className="fas fa-layer-group mr-2"></i>
                    KHO PHIM TỔNG HỢP • CÓ THỂ CÓ QUẢNG CÁO
                </span>
            </div>
          
          <NguoncMovieRow
            title="Tuyển Tập Mới (NguonC)"
            movies={nguoncLatest?.items || []}
            isLoading={nguoncLatestLoading}
            icon={<i className="fas fa-fire text-orange-500 text-xl" />}
          />

          <NguoncMovieRow
            title="Phim Lẻ Đa Dạng"
            movies={nguoncSingle?.items || []}
            isLoading={nguoncSingleLoading}
            icon={<i className="fas fa-mask text-blue-500 text-xl" />}
          />
        </div>


        {/* ============ LOCAL DB SECTION ============ */}
        <div className="space-y-8 border-t border-gray-800/50 pt-8">
            <div className="px-4 md:px-12 mb-2">
                 <span className="text-red-500 text-xs font-bold tracking-widest border border-red-500/30 px-2 py-1 rounded bg-red-500/10">
                    <i className="fas fa-database mr-2"></i>
                    THƯ VIỆN CÁ NHÂN • UPLOADED
                </span>
            </div>

            {/* Trending Now - Top 10 */}
            {moviesData?.movies && moviesData.movies.length > 0 && (
            <TrendingRow
                title="Trending Now"
                movies={moviesData.movies}
                onAddToWatchlist={handleAddToWatchlist}
            />
            )}

            {/* Recently Added */}
            {recentMovies?.movies && recentMovies.movies.length > 0 && (
            <MovieRow
                title="Mới Thêm Vào Server"
                movies={recentMovies.movies}
                onAddToWatchlist={handleAddToWatchlist}
            />
            )}
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8 px-4 md:px-12 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/browse')}
              className="glass-card p-6 cursor-pointer hover:bg-white/10 transition group border border-white/5 rounded-xl"
            >
              <Film className="w-10 h-10 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white text-lg font-semibold mb-1 text-center">Khám Phá</h3>
              <p className="text-gray-400 text-sm text-center">Hàng nghìn phim đang chờ bạn</p>
            </div>
            
            <div 
              onClick={() => navigate('/profile')}
              className="glass-card p-6 cursor-pointer hover:bg-white/10 transition group border border-white/5 rounded-xl"
            >
              <Clock className="w-10 h-10 text-yellow-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white text-lg font-semibold mb-1 text-center">Danh Sách</h3>
              <p className="text-gray-400 text-sm text-center">Tiếp tục xem phim đã lưu</p>
            </div>
            
            <div 
              onClick={() => navigate('/search')}
              className="glass-card p-6 cursor-pointer hover:bg-white/10 transition group border border-white/5 rounded-xl"
            >
              <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white text-lg font-semibold mb-1 text-center">Tìm Kiếm</h3>
              <p className="text-gray-400 text-sm text-center">Tìm kiếm phim yêu thích</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
