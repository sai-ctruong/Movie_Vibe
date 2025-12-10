import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ophimService } from '../services/ophimService';
import { ArrowLeft, Play, Calendar, Clock, Globe, Star, Film, Users, Clapperboard } from 'lucide-react';

export default function OphimMovieDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['ophim-movie', slug],
    queryFn: () => ophimService.getMovieBySlug(slug!),
    enabled: !!slug,
  });

  const movie = data?.data?.item;
  const cdnImage = data?.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';

  const getImageUrl = (path: string) => {
    if (!path) return 'https://via.placeholder.com/300x450';
    if (path.startsWith('http')) return path;
    return `${cdnImage}/uploads/movies/${path}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-netflix-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4">Không tìm thấy phim</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Get first available episode
  const firstServer = movie.episodes?.[0];
  const firstEpisode = firstServer?.server_data?.[0];

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative h-[70vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={getImageUrl(movie.poster_url || movie.thumb_url)}
            alt={movie.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-transparent to-transparent" />
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-8 z-10 flex items-center space-x-2 text-white hover:text-green-500 transition"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Quay lại</span>
        </button>

        {/* Source Badge */}
        <div className="absolute top-20 right-8 z-10 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg">
          OPhim
        </div>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {movie.name}
            </h1>
            {movie.origin_name && movie.origin_name !== movie.name && (
              <p className="text-gray-400 text-lg mb-4">{movie.origin_name}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                {movie.quality}
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                {movie.lang}
              </span>
              <span className="bg-gray-700 text-white px-3 py-1 rounded text-sm">
                {movie.episode_current}
              </span>
              {movie.tmdb?.vote_average > 0 && (
                <span className="text-yellow-500 flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  {movie.tmdb.vote_average.toFixed(1)}
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-6">
              {movie.year && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {movie.year}
                </span>
              )}
              {movie.time && (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {movie.time}
                </span>
              )}
              {movie.country?.[0] && (
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  {movie.country[0].name}
                </span>
              )}
              <span className="flex items-center">
                <Film className="w-4 h-4 mr-2" />
                {movie.type === 'single' ? 'Phim lẻ' : 
                 movie.type === 'series' ? 'Phim bộ' :
                 movie.type === 'hoathinh' ? 'Hoạt hình' : 'TV Show'}
              </span>
            </div>

            {/* Categories */}
            {movie.category && movie.category.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.category.map((cat) => (
                  <span
                    key={cat.id}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {movie.content && (
              <p 
                className="text-gray-300 text-lg leading-relaxed max-w-3xl"
                dangerouslySetInnerHTML={{ __html: movie.content }}
              />
            )}

            {/* Director & Actors */}
            <div className="mt-6 space-y-2 text-gray-400">
              {movie.director && movie.director.length > 0 && (
                <p className="flex items-center">
                  <Clapperboard className="w-4 h-4 mr-2" />
                  <span className="text-gray-500 mr-2">Đạo diễn:</span>
                  {movie.director.join(', ')}
                </p>
              )}
              {movie.actor && movie.actor.length > 0 && (
                <p className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-gray-500 mr-2">Diễn viên:</span>
                  {movie.actor.slice(0, 5).join(', ')}
                  {movie.actor.length > 5 && '...'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="px-8 md:px-12 py-12">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center">
          <Play className="w-6 h-6 mr-2 text-green-500" />
          Danh sách tập
          <span className="ml-3 text-sm font-normal text-gray-500">
            {movie.episode_current}
          </span>
        </h2>

        {movie.episodes && movie.episodes.length > 0 ? (
          movie.episodes.map((server, serverIndex) => (
            <div key={serverIndex} className="mb-8">
              <h3 className="text-gray-400 text-lg mb-4 flex items-center">
                <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded text-sm mr-2">
                  {server.server_name}
                </span>
                <span className="text-gray-600 text-sm">
                  {server.server_data?.length || 0} tập
                </span>
              </h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                {server.server_data?.map((episode) => (
                  <button
                    key={episode.slug}
                    onClick={() => navigate(`/ophim/watch/${movie.slug}/${episode.slug}`)}
                    className="bg-gray-800 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center text-sm font-medium"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    {episode.name}
                  </button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Chưa có tập phim nào.</p>
        )}

        {/* Quick play button */}
        {firstEpisode && (
          <div className="mt-8">
            <button
              onClick={() => navigate(`/ophim/watch/${movie.slug}/${firstEpisode.slug}`)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center transition-all hover:scale-105 shadow-lg"
            >
              <Play className="w-6 h-6 mr-2 fill-current" />
              Xem Ngay - {firstEpisode.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
