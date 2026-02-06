import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { NguoncMovie } from '../../types/nguonc';

interface NguoncMovieCardProps {
  movie: NguoncMovie;
}

export default function NguoncMovieCard({ movie }: NguoncMovieCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/nguonc/${movie.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="flex-shrink-0 w-40 sm:w-44 md:w-48 cursor-pointer group"
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-lg bg-gray-900">
        <img
          src={movie.thumb_url || movie.poster_url}
          alt={movie.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://via.placeholder.com/300x450?text=No+Image') {
              target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }
          }}
        />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

        {/* Quality badge */}
        <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
          {movie.quality || 'HD'}
        </div>
        
        {/* Episode badge */}
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
          {movie.current_episode || 'Tập ?'}
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
          <div className="bg-white/95 rounded-full p-3 shadow-xl group-hover:bg-red-600 transition-colors duration-300">
            <Play className="w-6 h-6 text-black group-hover:text-white fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          {/* Language badge */}
          <div className="flex items-center space-x-1 mb-1">
            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
              {movie.language || 'Vietsub'}
            </span>
            {movie.time && (
              <span className="text-gray-300 text-xs">
                {movie.time}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-white text-sm font-medium mt-2 line-clamp-2 group-hover:text-red-500 transition-colors duration-200 leading-tight">
        {movie.name}
      </h3>
      
      {/* Original name */}
      {movie.original_name && movie.original_name !== movie.name && (
        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
          {movie.original_name}
        </p>
      )}
    </div>
  );
}
