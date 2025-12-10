import { Movie } from '../../types';
import MovieCard from './MovieCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onAddToWatchlist?: (movieId: string) => void;
}

export default function MovieRow({ title, movies, onAddToWatchlist }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl font-bold mb-4 px-4 md:px-12">
        {title}
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
          className="flex space-x-4 overflow-x-auto custom-scrollbar px-4 md:px-12 pb-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {movies.map((movie) => (
            <div key={movie._id} className="flex-shrink-0 w-48">
              <MovieCard
                movie={movie}
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
