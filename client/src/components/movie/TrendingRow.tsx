import { Movie } from '../../types';
import TrendingMovieCard from './TrendingMovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface TrendingRowProps {
  title: string;
  movies: Movie[];
  onAddToWatchlist?: (movieId: string) => void;
}

export default function TrendingRow({ title, movies, onAddToWatchlist }: TrendingRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-white text-2xl font-bold mb-6 px-4 md:px-12 flex items-center">
        <span className="bg-gradient-to-r from-red-600 to-orange-500 bg-clip-text text-transparent">
          {title}
        </span>
        <span className="ml-3 text-sm font-normal text-gray-400">Top 10</span>
      </h2>

      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-black bg-opacity-50 hover:bg-opacity-75 transition opacity-0 group-hover:opacity-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex space-x-2 overflow-x-auto custom-scrollbar px-4 md:px-12 pb-4 pt-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {movies.slice(0, 10).map((movie, index) => (
            <div key={movie._id} className="flex-shrink-0">
              <TrendingMovieCard
                movie={movie}
                rank={index + 1}
                onAddToWatchlist={
                  onAddToWatchlist ? () => onAddToWatchlist(movie._id) : undefined
                }
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-black bg-opacity-50 hover:bg-opacity-75 transition opacity-0 group-hover:opacity-100 flex items-center justify-center"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
