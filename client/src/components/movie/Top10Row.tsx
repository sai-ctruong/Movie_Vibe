import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import OphimMovieCard from './OphimMovieCard';
import type { OphimMovie } from '../../types/ophim';

interface Top10RowProps {
  title: string;
  movies: OphimMovie[];
  isLoading?: boolean;
}

export default function Top10Row({ title, movies, isLoading }: Top10RowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -800 : 800;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const topMovies = movies.slice(0, 10);

  if (isLoading || !topMovies.length) {
      return null; // Or skeleton
  }

  return (
    <div className="group/row relative mb-12">
      <h2 className="text-white text-xl md:text-2xl font-bold mb-6 px-4 md:px-12 flex items-center">
        <i className="fas fa-crown text-yellow-500 mr-3 text-2xl"></i>
        <span>{title}</span>
      </h2>

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex space-x-2 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-8 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topMovies.map((movie, index) => (
            <div key={movie.slug} className="relative flex-shrink-0 flex items-center group/card cursor-pointer">
               {/* Huge Number */}
               <div className="relative -mr-6 z-0 flex-shrink-0 h-[200px] flex items-end">
                  <svg 
                    viewBox="0 0 100 200" 
                    className="h-full w-auto fill-black stroke-white stroke-[2px] drop-shadow-2xl opacity-80"
                    style={{ 
                        filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.2))' 
                    }}
                  >
                     <text 
                        x="50%" 
                        y="100%" 
                        textAnchor="middle" 
                        fontSize="230" 
                        fontWeight="900" 
                        fontFamily="Oswald"
                     >
                        {index + 1}
                     </text>
                  </svg>
               </div>
               
               {/* Movie Card */}
               <div className="w-[140px] md:w-[180px] z-10 transform transition-transform duration-300 group-hover/card:scale-105 origin-center">
                  <OphimMovieCard movie={movie} />
               </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-all duration-300"
        >
           <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}
