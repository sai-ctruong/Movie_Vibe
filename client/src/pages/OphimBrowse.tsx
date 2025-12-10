import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ophimService } from '../services/ophimService';
import OphimMovieCard from '../components/movie/OphimMovieCard';
import { Filter, Globe, Tag, Loader2, Film, ArrowLeft, Grid, X } from 'lucide-react';

// Danh sách thể loại phổ biến
const CATEGORIES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Tình Cảm', slug: 'tinh-cam' },
  { name: 'Hài Hước', slug: 'hai-huoc' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Viễn Tưởng', slug: 'vien-tuong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Võ Thuật', slug: 'vo-thuat' },
  { name: 'Cổ Trang', slug: 'co-trang' },
  { name: 'Tâm Lý', slug: 'tam-ly' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Chiến Tranh', slug: 'chien-tranh' },
  { name: 'Khoa Học', slug: 'khoa-hoc' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Bí Ẩn', slug: 'bi-an' },
  { name: 'Chính Kịch', slug: 'chinh-kich' },
];

// Danh sách quốc gia phổ biến
const COUNTRIES = [
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Việt Nam', slug: 'viet-nam' },
  { name: 'Hồng Kông', slug: 'hong-kong' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Ấn Độ', slug: 'an-do' },
  { name: 'Philippines', slug: 'philippines' },
];

// Danh sách loại phim
const TYPES = [
  { name: 'Phim Mới', slug: 'phim-moi-cap-nhat', icon: '🔥' },
  { name: 'Phim Lẻ', slug: 'phim-le', icon: '🎬' },
  { name: 'Phim Bộ', slug: 'phim-bo', icon: '📺' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh', icon: '🎨' },
  { name: 'TV Shows', slug: 'tv-shows', icon: '📡' },
];

type FilterType = 'type' | 'category' | 'country';

export default function OphimBrowse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const filterType = (searchParams.get('filter') as FilterType) || 'type';
  const filterValue = searchParams.get('value') || 'phim-moi-cap-nhat';
  const page = parseInt(searchParams.get('page') || '1');

  // Build query function based on filter type
  const getQueryFn = () => {
    switch (filterType) {
      case 'category':
        return () => ophimService.getMoviesByCategory(filterValue, page);
      case 'country':
        return () => ophimService.getMoviesByCountry(filterValue, page);
      case 'type':
      default:
        switch (filterValue) {
          case 'phim-le':
            return () => ophimService.getSingleMovies(page);
          case 'phim-bo':
            return () => ophimService.getSeriesMovies(page);
          case 'hoat-hinh':
            return () => ophimService.getAnimeMovies(page);
          case 'tv-shows':
            return () => ophimService.getTVShows(page);
          default:
            return () => ophimService.getLatestMovies(page);
        }
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['ophim-browse', filterType, filterValue, page],
    queryFn: getQueryFn(),
    staleTime: 5 * 60 * 1000,
  });

  const movies = data?.data?.items || [];
  const pagination = data?.data?.params?.pagination;
  const totalPages = pagination?.totalItems ? Math.ceil(pagination.totalItems / (pagination.totalItemsPerPage || 24)) : 1;

  const handleFilterChange = (type: FilterType, value: string) => {
    setSearchParams({ filter: type, value, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ filter: filterType, value: filterValue, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getFilterLabel = () => {
    switch (filterType) {
      case 'category':
        return CATEGORIES.find(c => c.slug === filterValue)?.name || filterValue;
      case 'country':
        return COUNTRIES.find(c => c.slug === filterValue)?.name || filterValue;
      case 'type':
        return TYPES.find(t => t.slug === filterValue)?.name || 'Phim Mới';
      default:
        return 'Phim';
    }
  };

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
              <Grid className="w-6 h-6 md:w-8 md:h-8 mr-3 text-green-500" />
              Duyệt Phim OPhim
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tất cả phim đều xem được không quảng cáo
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-4 border-b border-gray-800 pb-4">
            <button
              onClick={() => handleFilterChange('type', 'phim-moi-cap-nhat')}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                filterType === 'type' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Film className="w-4 h-4 mr-2" />
              Loại Phim
            </button>
            <button
              onClick={() => handleFilterChange('category', 'hanh-dong')}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                filterType === 'category' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Tag className="w-4 h-4 mr-2" />
              Thể Loại
            </button>
            <button
              onClick={() => handleFilterChange('country', 'han-quoc')}
              className={`flex items-center px-4 py-2 rounded-lg transition ${
                filterType === 'country' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              Quốc Gia
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {filterType === 'type' && TYPES.map((type) => (
              <button
                key={type.slug}
                onClick={() => handleFilterChange('type', type.slug)}
                className={`px-4 py-2 rounded-full text-sm transition flex items-center ${
                  filterValue === type.slug 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                {type.name}
              </button>
            ))}
            
            {filterType === 'category' && CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleFilterChange('category', cat.slug)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  filterValue === cat.slug 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
            
            {filterType === 'country' && COUNTRIES.map((country) => (
              <button
                key={country.slug}
                onClick={() => handleFilterChange('country', country.slug)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  filterValue === country.slug 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {country.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Filter Label */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Filter className="w-5 h-5 mr-2 text-green-500" />
            {getFilterLabel()}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({pagination?.totalItems || movies.length} phim)
            </span>
          </h2>
          <span className="text-green-500 text-sm flex items-center">
            <Film className="w-4 h-4 mr-1" />
            Không quảng cáo
          </span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
          </div>
        )}

        {/* Movies Grid */}
        {!isLoading && movies.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map((movie) => (
              <OphimMovieCard key={movie._id || movie.slug} movie={movie} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && movies.length === 0 && (
          <div className="text-center py-12">
            <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Không tìm thấy phim nào</p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
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
      </div>
    </div>
  );
}
