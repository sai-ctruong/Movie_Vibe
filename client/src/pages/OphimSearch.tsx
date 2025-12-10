import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ophimService } from '../services/ophimService';
import OphimMovieCard from '../components/movie/OphimMovieCard';
import { Search, X, Loader2, Film, ArrowLeft } from 'lucide-react';

export default function OphimSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Search query
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['ophim-search', query, page],
    queryFn: () => ophimService.searchMovies(query, page),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  const movies = data?.data?.items || [];
  const pagination = data?.data?.params?.pagination;
  const totalPages = pagination?.totalItems ? Math.ceil(pagination.totalItems / (pagination.totalItemsPerPage || 24)) : 1;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      setSearchParams({ q: searchInput.trim(), page: '1' });
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Search className="w-6 h-6 md:w-8 md:h-8 mr-3 text-green-500" />
              Tìm Kiếm Phim OPhim
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tìm và xem phim không quảng cáo
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập tên phim, diễn viên, đạo diễn..."
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg py-4 pl-5 pr-24 text-lg focus:outline-none focus:border-green-500 transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-20 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={searchInput.length < 2}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg transition flex items-center"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          {searchInput.length > 0 && searchInput.length < 2 && (
            <p className="text-yellow-500 text-sm mt-2">Nhập ít nhất 2 ký tự</p>
          )}
        </form>

        {/* Quick Search Suggestions */}
        {!query && (
          <div className="mb-8">
            <h3 className="text-gray-400 text-sm mb-3">Gợi ý tìm kiếm:</h3>
            <div className="flex flex-wrap gap-2">
              {['One Piece', 'Conan', 'Hàn Quốc', 'Trung Quốc', 'Hành động', 'Tình cảm'].map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchInput(term);
                    setSearchParams({ q: term, page: '1' });
                  }}
                  className="bg-gray-800 hover:bg-green-600 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm transition"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {(isLoading || isFetching) && query && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          </div>
        )}

        {/* Results */}
        {query && !isLoading && (
          <>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-400">
                {movies.length > 0 
                  ? `Tìm thấy ${pagination?.totalItems || movies.length} kết quả cho "${query}"`
                  : `Không tìm thấy kết quả cho "${query}"`
                }
              </p>
              {movies.length > 0 && (
                <span className="text-green-500 text-sm flex items-center">
                  <Film className="w-4 h-4 mr-1" />
                  Không quảng cáo
                </span>
              )}
            </div>

            {/* Movies Grid */}
            {movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {movies.map((movie) => (
                  <OphimMovieCard key={movie._id || movie.slug} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Không tìm thấy phim nào</p>
                <p className="text-gray-500 text-sm mt-2">Thử từ khóa khác hoặc kiểm tra chính tả</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
                >
                  Trước
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg transition ${
                          page === pageNum 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state when no query */}
        {!query && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl text-white font-semibold mb-2">Tìm phim yêu thích</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Nhập tên phim, diễn viên hoặc đạo diễn để tìm kiếm. 
              Tất cả phim từ OPhim đều có thể xem không quảng cáo!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
