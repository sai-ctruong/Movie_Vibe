import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import { ophimService } from '../services/ophimService';
import { nguoncService } from '../services/nguoncService';
import MovieCard from '../components/movie/MovieCard';
import OphimMovieCard from '../components/movie/OphimMovieCard';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Search as SearchIcon, Database, Globe, Film, Layers } from 'lucide-react';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState<'all' | 'local' | 'ophim' | 'nguonc'>('all');

  // Local DB Search
  const { data: localData, isLoading: localLoading } = useQuery({
    queryKey: ['search', 'local', query],
    queryFn: () => movieService.searchMovies({ query }),
    enabled: !!query,
  });

  // OPhim Search
  const { data: ophimData, isLoading: ophimLoading } = useQuery({
    queryKey: ['search', 'ophim', query],
    queryFn: () => ophimService.searchMovies(query),
    enabled: !!query,
  });

  // NguonC Search
  const { data: nguoncData, isLoading: nguoncLoading } = useQuery({
    queryKey: ['search', 'nguonc', query],
    queryFn: () => nguoncService.searchMovies(query),
    enabled: !!query,
  });

  const handleAddToWatchlist = async (movieId: string) => {
    try {
      await movieService.addToWatchlist(movieId);
      toast.success('Added to watchlist');
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  const localResults = localData?.results || [];
  const ophimResults = ophimData?.data?.items || [];
  const nguoncResults = nguoncData?.items || [];

  const totalResults = localResults.length + ophimResults.length + nguoncResults.length;
  const isLoading = localLoading || ophimLoading || nguoncLoading;

  if (!query) {
      return (
          <div className="min-h-screen pt-24 px-4 flex flex-col items-center justify-center text-gray-500">
              <SearchIcon className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-xl">Nhập tên phim để bắt đầu tìm kiếm...</p>
          </div>
      )
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12 pb-12">
      <h1 className="text-3xl font-bold text-white mb-6 flex items-center">
        Kết quả cho "{query}"
        <span className="ml-3 text-sm font-normal text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            {isLoading ? 'Đang tìm...' : `${totalResults} kết quả`}
        </span>
      </h1>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition ${
            activeTab === 'all' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tất cả ({totalResults})</span>
        </button>
        <button
          onClick={() => setActiveTab('local')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition ${
            activeTab === 'local' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Thư viện ({localResults.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('ophim')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition ${
            activeTab === 'ophim' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>OPhim ({ophimResults.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('nguonc')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 whitespace-nowrap transition ${
            activeTab === 'nguonc' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>NguonC ({nguoncResults.length})</span>
        </button>
      </div>

      <div className="space-y-12">
        {/* Local Results */}
        {(activeTab === 'all' || activeTab === 'local') && localResults.length > 0 && (
          <section>
             <h2 className="text-xl text-white font-semibold mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-red-500" />
                Thư viện phim
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {localResults.map((movie: any) => (
                <MovieCard
                  key={movie._id}
                  movie={movie}
                  onAddToWatchlist={() => handleAddToWatchlist(movie._id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* OPhim Results */}
        {(activeTab === 'all' || activeTab === 'ophim') && ophimResults.length > 0 && (
          <section>
            <h2 className="text-xl text-white font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-green-500" />
                Kết quả từ OPhim
             </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {ophimResults.map((movie: any) => (
                <OphimMovieCard key={movie._id || movie.slug} movie={movie} />
              ))}
            </div>
          </section>
        )}

        {/* NguonC Results */}
        {(activeTab === 'all' || activeTab === 'nguonc') && nguoncResults.length > 0 && (
          <section>
            <h2 className="text-xl text-white font-semibold mb-4 flex items-center">
                <Film className="w-5 h-5 mr-2 text-blue-500" />
                Kết quả từ NguonC
             </h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {nguoncResults.map((movie: any) => (
                // Reusing OphimMovieCard structure since data shape is similar enough for basic display
                // or create a simple wrapper inline if needed.
                <div 
                    key={movie._id || movie.slug}
                    onClick={() => navigate(`/nguonc/${movie.slug}`)}
                    className="cursor-pointer group"
                >
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                        <img 
                            src={movie.thumb_url.startsWith('http') ? movie.thumb_url : `https://img.ophim.live/uploads/movies/${movie.thumb_url}`}
                            alt={movie.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450'}
                        />
                         <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            {movie.quality}
                        </div>
                    </div>
                    <h3 className="text-white text-sm font-medium line-clamp-1 group-hover:text-blue-400 transition">{movie.name}</h3>
                    <p className="text-gray-500 text-xs">{movie.original_name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && totalResults === 0 && (
             <div className="text-center text-gray-400 text-lg mt-12">
                Không tìm thấy phim nào phù hợp với "{query}".
            </div>
        )}
      </div>
    </div>
  );
}
