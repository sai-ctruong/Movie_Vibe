import { useRef, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OphimMovieCard from './OphimMovieCard';
import type { OphimMovie } from '../../types/ophim';

interface OphimMovieRowProps {
  title: string;
  movies: OphimMovie[];
  isLoading?: boolean;
  icon?: ReactNode;
}

export default function OphimMovieRow({ title, movies, isLoading, icon }: OphimMovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="mb-6 px-4 md:px-12">
        <div className="h-7 w-56 bg-gray-800 rounded mb-4 animate-pulse" />
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-48 aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div className="group/row relative">
      {/* Title */}
      <h2 className="text-white text-lg md:text-xl lg:text-2xl font-bold mb-3 md:mb-4 px-4 md:px-12 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
          {title}
        </span>
        <span className="ml-3 text-xs text-gray-500 font-normal bg-green-600/20 px-2 py-0.5 rounded">
          OPhim • {movies.length} phim
        </span>
      </h2>

      {/* Row container */}
      <div className="relative">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 md:left-2 top-1/2 -translate-y-1/2 z-10 bg-black/90 hover:bg-green-600 p-2 md:p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        {/* Movies row */}
        <div
          ref={rowRef}
          className="flex space-x-3 md:space-x-4 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-4 scroll-smooth"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {movies.map((movie) => (
            <OphimMovieCard key={movie._id || movie.slug} movie={movie} />
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 z-10 bg-black/90 hover:bg-green-600 p-2 md:p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300 shadow-lg"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>

        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-4 w-8 md:w-16 bg-gradient-to-r from-netflix-black to-transparent pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity" />
        <div className="absolute right-0 top-0 bottom-4 w-8 md:w-16 bg-gradient-to-l from-netflix-black to-transparent pointer-events-none opacity-0 group-hover/row:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
