import { Movie } from '../../types';
import { Play, Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
  onAddToWatchlist?: () => void;
}

export default function MovieCard({ movie, onAddToWatchlist }: MovieCardProps) {
  const navigate = useNavigate();

  return (
    <div className="movie-card group">
      <div className="relative aspect-[2/3]">
        <img
          src={`http://localhost:5001${movie.thumbnail}`}
          alt={movie.title}
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://via.placeholder.com/300x450?text=No+Image') {
              target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }
          }}
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-end opacity-0 group-hover:opacity-100 rounded-md">
          <div className="p-4 w-full">
            <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1">
              {movie.title}
            </h3>
            
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-yellow-400">★</span>
              <span className="text-white text-sm">{movie.rating.average.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({movie.rating.count})</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/watch/${movie._id}`)}
                className="bg-white text-black px-3 py-1.5 rounded flex items-center space-x-1 hover:bg-opacity-80 transition text-sm"
              >
                <Play className="w-4 h-4" />
                <span>Play</span>
              </button>
              
              {onAddToWatchlist && (
                <button
                  onClick={onAddToWatchlist}
                  className="bg-netflix-darkGray p-1.5 rounded hover:bg-netflix-gray transition"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              )}
              
              <button
                onClick={() => navigate(`/movie/${movie._id}`)}
                className="bg-netflix-darkGray p-1.5 rounded hover:bg-netflix-gray transition"
              >
                <Info className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
