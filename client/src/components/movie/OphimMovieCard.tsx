import { useNavigate } from 'react-router-dom';
import { OphimMovie } from '../../types/ophim';
import { ophimService } from '../../services/ophimService';
import { Play } from 'lucide-react';
import { useState, useRef } from 'react';
import MovieHoverCard from './MovieHoverCard';

interface OphimMovieCardProps {
  movie: OphimMovie;
}

export default function OphimMovieCard({ movie }: OphimMovieCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showHoverCard, setShowHoverCard] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  const handleClick = () => {
    if (!movie.slug) return;
    navigate(`/ophim/${movie.slug}`);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverCard(true);
    }, 500); // 500ms delay before showing detail card
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Small delay to prevent flickering if user accidentally moves out
    setTimeout(() => {
        setShowHoverCard(false);
    }, 300);
  };

  return (
    <div 
      className="relative aspect-[2/3] rounded-lg cursor-pointer group transition-all duration-300 z-10 hover:z-50"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Expanded Hover Card */}
      {showHoverCard && (
        <MovieHoverCard 
            movie={movie} 
            onMouseLeave={handleMouseLeave}
            style={{ 
                width: '150%', // Make it wider than the original card
                left: '-25%', // Center it horizontally
                top: '-20%', // Move up slightly
                position: 'absolute'
            }}
        />
      )}

      {/* Standard Card Content (Hidden when HoverCard is shown to avoid duplication/clutter) */}
      <div className={`w-full h-full rounded-lg overflow-hidden relative transition-transform duration-300 ${isHovered && !showHoverCard ? 'scale-105' : ''}`}>
        <img
          src={ophimService.getImageUrl(movie.thumb_url)}
          alt={movie.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
          }}
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
            {movie.quality}
          </span>
          <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
            {movie.lang}
          </span>
        </div>

        {/* Hover Overlay (Before Expansion) */}
        {!showHoverCard && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-red-600/90 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-xl">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
            </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <h3 className="text-white font-medium text-sm line-clamp-1 group-hover:text-red-500 transition-colors">
            {movie.name}
          </h3>
          <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">
            {movie.origin_name} ({movie.year})
          </p>
        </div>
      </div>
    </div>
  );
}
