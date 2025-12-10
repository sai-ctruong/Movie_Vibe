import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { nguoncService } from '../services/nguoncService';
import { ArrowLeft, Play, Calendar, Clock, Globe, Star, Film } from 'lucide-react';

export default function NguoncMovieDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['nguonc-movie', slug],
    queryFn: () => nguoncService.getMovieBySlug(slug!),
    enabled: !!slug,
  });

  const movie = data?.movie;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-netflix-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-netflix-black flex flex-col items-center justify-center text-white">
        <h1 className="text-2xl mb-4">Không tìm thấy phim</h1>
        <button
          onClick={() => navigate(-1)}
          className="bg-red-600 px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Get categories from movie data
  const genres = movie.category?.['2']?.list?.map(g => g.name) || [];
  const year = movie.category?.['3']?.list?.[0]?.name || '';
  const country = movie.category?.['4']?.list?.[0]?.name || '';

  return (
    <div className="min-h-screen bg-netflix-black">
      {/* Hero Section */}
      <div className="relative h-[70vh]">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={movie.poster_url || movie.thumb_url}
            alt={movie.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-netflix-black via-transparent to-transparent" />
        </div>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-8 z-10 flex items-center space-x-2 text-white hover:text-red-500 transition"
        >
          <ArrowLeft className="w-6 h-6" />
          <span>Quay lại</span>
        </button>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {movie.name}
            </h1>
            {movie.original_name && movie.original_name !== movie.name && (
              <p className="text-gray-400 text-lg mb-4">{movie.original_name}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold">
                {movie.quality}
              </span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded text-sm">
                {movie.language}
              </span>
              <span className="text-yellow-500 flex items-center">
                <Star className="w-4 h-4 mr-1 fill-current" />
                {movie.current_episode}
              </span>
            </div>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-6">
              {year && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {year}
                </span>
              )}
              {movie.time && (
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {movie.time}
                </span>
              )}
              {country && (
                <span className="flex items-center">
                  <Globe className="w-4 h-4 mr-2" />
                  {country}
                </span>
              )}
              <span className="flex items-center">
                <Film className="w-4 h-4 mr-2" />
                {movie.total_episodes} tập
              </span>
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
              {movie.description}
            </p>

            {/* Director & Cast */}
            <div className="mt-6 space-y-2 text-gray-400">
              {movie.director && (
                <p><span className="text-gray-500">Đạo diễn:</span> {movie.director}</p>
              )}
              {movie.casts && (
                <p><span className="text-gray-500">Diễn viên:</span> {movie.casts}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Episodes Section */}
      <div className="px-8 md:px-12 py-12">
        <h2 className="text-white text-2xl font-bold mb-6">Danh sách tập</h2>

        {movie.episodes && movie.episodes.length > 0 ? (
          movie.episodes.map((server, serverIndex) => (
            <div key={serverIndex} className="mb-8">
              <h3 className="text-gray-400 text-lg mb-4">{server.server_name}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-3">
                {server.items.map((episode) => (
                  <button
                    key={episode.slug}
                    onClick={() => navigate(`/nguonc/watch/${movie.slug}/${episode.slug}`)}
                    className="bg-gray-800 hover:bg-red-600 text-white py-3 px-4 rounded-lg transition-all hover:scale-105 flex items-center justify-center"
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
      </div>
    </div>
  );
}
