import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { OphimMovie } from '../../types/ophim';
import { ophimService } from '../../services/ophimService';

interface OphimMovieCardProps {
  movie: OphimMovie;
}

export default function OphimMovieCard({ movie }: OphimMovieCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/ophim/${movie.slug}`);
  };

  // Helper to get image URL
  const getImageUrl = () => {
    return ophimService.getImageUrl(movie.thumb_url || movie.poster_url);
  };

  return (
    <div
      onClick={handleClick}
      className="flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer group"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-900">
        <img
          src={getImageUrl()}
          alt={movie.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quality badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
          {movie.quality || 'HD'}
        </div>
        
        {/* Episode badge */}
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          {movie.episode_current || 'N/A'}
        </div>

        {/* Type badge */}
        {movie.type && (
          <div className="absolute bottom-12 left-2 bg-blue-600/80 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            {movie.type === 'single' ? 'Phim lẻ' : 
             movie.type === 'series' ? 'Phim bộ' :
             movie.type === 'hoathinh' ? 'Hoạt hình' : 'TV Show'}
          </div>
        )}

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-green-600/90 rounded-full p-3 shadow-xl transform hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-gray-300 text-xs">{movie.lang || 'Vietsub'}</span>
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-white text-sm font-medium mt-2 line-clamp-2 group-hover:text-green-400 transition-colors duration-200 leading-tight">
        {movie.name}
      </h3>
      
      {/* Year and country */}
      <div className="flex items-center text-gray-500 text-xs mt-0.5 space-x-2">
        {movie.year && <span>{movie.year}</span>}
        {movie.country?.[0] && <span>• {movie.country[0].name}</span>}
      </div>
    </div>
  );
}
