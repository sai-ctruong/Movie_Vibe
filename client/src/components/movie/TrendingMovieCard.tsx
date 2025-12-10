import { Movie } from '../../types';
import { Play, Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrendingMovieCardProps {
  movie: Movie;
  rank: number;
  onAddToWatchlist?: () => void;
}

export default function TrendingMovieCard({ movie, rank, onAddToWatchlist }: TrendingMovieCardProps) {
  const navigate = useNavigate();

  return (
    <div className="trending-card group relative flex items-end">
      {/* Large rank number */}
      <div className="trending-rank">
        <span className="trending-number" data-stroke={rank}>
          {rank}
        </span>
      </div>

      {/* Movie poster */}
      <div className="relative w-32 h-48 flex-shrink-0 ml-10">
        <img
          src={`http://localhost:5000${movie.thumbnail}`}
          alt={movie.title}
          className="w-full h-full object-cover rounded-md shadow-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 rounded-md">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate(`/watch/${movie._id}`)}
              className="bg-white text-black p-2 rounded-full hover:bg-opacity-80 transition"
              title="Play"
            >
              <Play className="w-5 h-5" />
            </button>

            {onAddToWatchlist && (
              <button
                onClick={onAddToWatchlist}
                className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition"
                title="Add to Watchlist"
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            )}

            <button
              onClick={() => navigate(`/movie/${movie._id}`)}
              className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition"
              title="More Info"
            >
              <Info className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
