import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ophimService } from '../services/ophimService';
import OphimMovieCard from '../components/movie/OphimMovieCard';
import { Search, X, Loader2, Film, ArrowLeft, Filter, ChevronDown, ChevronUp, Calendar, Globe, Tag } from 'lucide-react';

// Filter options
const YEARS = Array.from({ length: 26 }, (_, i) => 2025 - i); // 2025 to 2000

const CATEGORIES = [
  { name: 'Tất cả', slug: '' },
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
];

const COUNTRIES = [
  { name: 'Tất cả', slug: '' },
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Việt Nam', slug: 'viet-nam' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Ấn Độ', slug: 'an-do' },
];

export default function OphimSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Search state
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const yearFilter = searchParams.get('year') || '';
  const categoryFilter = searchParams.get('category') || '';
  const countryFilter = searchParams.get('country') || '';

  // Determine if we're doing a keyword search or filter browse
  const isFilterMode = !query && (categoryFilter || countryFilter);
  
  // Search query (keyword search)
  const { data: searchData, isLoading: isSearchLoading, isFetching: isSearchFetching } = useQuery({
    queryKey: ['ophim-search', query, page],
    queryFn: () => ophimService.searchMovies(query, page),
    enabled: query.length >= 2 && !isFilterMode,
    staleTime: 5 * 60 * 1000,
  });

  // Category filter query
  const { data: categoryData, isLoading: isCategoryLoading } = useQuery({
    queryKey: ['ophim-category', categoryFilter, page],
    queryFn: () => ophimService.getMoviesByCategory(categoryFilter, page),
    enabled: !!categoryFilter && !query,
    staleTime: 5 * 60 * 1000,
  });

  // Country filter query
  const { data: countryData, isLoading: isCountryLoading } = useQuery({
    queryKey: ['ophim-country', countryFilter, page],
    queryFn: () => ophimService.getMoviesByCountry(countryFilter, page),
    enabled: !!countryFilter && !query && !categoryFilter,
    staleTime: 5 * 60 * 1000,
  });

  // Determine which data to show
  const data = query ? searchData : (categoryFilter ? categoryData : countryData);
  const isLoading = query ? isSearchLoading : (categoryFilter ? isCategoryLoading : isCountryLoading);
  const isFetching = isSearchFetching;

  // Filter movies by year (client-side)
  let movies = data?.data?.items || [];
  if (yearFilter) {
    movies = movies.filter((m: any) => m.year?.toString() === yearFilter);
  }

  const pagination = data?.data?.params?.pagination;
  const totalPages = pagination?.totalItems ? Math.ceil(pagination.totalItems / (pagination.totalItemsPerPage || 24)) : 1;

  // Active filters count
  const activeFiltersCount = [yearFilter, categoryFilter, countryFilter].filter(Boolean).length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim().length >= 2) {
      const params: Record<string, string> = { q: searchInput.trim(), page: '1' };
      if (yearFilter) params.year = yearFilter;
      setSearchParams(params);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params: Record<string, string> = { page: newPage.toString() };
    if (query) params.q = query;
    if (yearFilter) params.year = yearFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (countryFilter) params.country = countryFilter;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFilter = (key: string, value: string) => {
    const params: Record<string, string> = { page: '1' };
    if (query) params.q = query;
    
    // Update the specific filter
    const currentYear = key === 'year' ? value : yearFilter;
    const currentCategory = key === 'category' ? value : categoryFilter;
    const currentCountry = key === 'country' ? value : countryFilter;
    
    if (currentYear) params.year = currentYear;
    if (currentCategory) params.category = currentCategory;
    if (currentCountry) params.country = currentCountry;
    
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasActiveSearch = query || isFilterMode;

  return (
    <div className="min-h-screen bg-netflix-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Search className="w-6 h-6 md:w-8 md:h-8 mr-3 text-green-500" />
              Tìm Kiếm Nâng Cao
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tìm và lọc phim theo thể loại, quốc gia, năm
            </p>
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập tên phim, diễn viên, đạo diễn..."
              className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg py-3 pl-5 pr-24 text-base focus:outline-none focus:border-green-500 transition"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
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
        </form>

        {/* Filter Toggle Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              showFilters || activeFiltersCount > 0
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Bộ lọc nâng cao</span>
            {activeFiltersCount > 0 && (
              <span className="bg-white text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Year Filter */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-green-500" />
                  Năm phát hành
                </label>
                <select
                  value={yearFilter}
                  onChange={(e) => updateFilter('year', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-green-500 transition cursor-pointer"
                >
                  <option value="">Tất cả năm</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 mr-2 text-green-500" />
                  Thể loại
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => updateFilter('category', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-green-500 transition cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 mr-2 text-green-500" />
                  Quốc gia
                </label>
                <select
                  value={countryFilter}
                  onChange={(e) => updateFilter('country', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-green-500 transition cursor-pointer"
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.slug} value={country.slug}>{country.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-400 hover:text-red-300 transition flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa tất cả bộ lọc
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Search Suggestions */}
        {!hasActiveSearch && (
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
        {(isLoading || isFetching) && hasActiveSearch && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          </div>
        )}

        {/* Results */}
        {hasActiveSearch && !isLoading && (
          <>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
              <p className="text-gray-400">
                {movies.length > 0 
                  ? `Tìm thấy ${movies.length} kết quả${query ? ` cho "${query}"` : ''}${yearFilter ? ` (${yearFilter})` : ''}`
                  : `Không tìm thấy kết quả${query ? ` cho "${query}"` : ''}`
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
                {movies.map((movie: any) => (
                  <OphimMovieCard key={movie._id || movie.slug} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Không tìm thấy phim nào</p>
                <p className="text-gray-500 text-sm mt-2">Thử từ khóa khác hoặc thay đổi bộ lọc</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !yearFilter && (
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
        {!hasActiveSearch && (
          <div className="text-center py-16">
            <Search className="w-20 h-20 text-gray-700 mx-auto mb-6" />
            <h2 className="text-2xl text-white font-semibold mb-2">Tìm phim yêu thích</h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Nhập từ khóa hoặc sử dụng bộ lọc nâng cao để tìm phim theo thể loại, quốc gia và năm phát hành.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
