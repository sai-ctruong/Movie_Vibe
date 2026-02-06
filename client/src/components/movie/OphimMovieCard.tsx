import { useNavigate } from 'react-router-dom';
import { OphimMovie } from '../../types/ophim';
import { ophimService } from '../../services/ophimService';
import { Play } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import MovieHoverCard from './MovieHoverCard';

interface OphimMovieCardProps {
  movie: OphimMovie;
}

export default function OphimMovieCard({ movie }: OphimMovieCardProps) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showHoverCard, setShowHoverCard] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const leaveTimeoutRef = useRef<NodeJS.Timeout>();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (!movie.slug) return;
    navigate(`/ophim/${movie.slug}`);
  };

  const handleMouseEnter = useCallback(() => {
    // Clear any pending leave timeout
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    
    setIsHovered(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setShowHoverCard(true);
    }, 400); // Slightly faster for better responsiveness
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Delay hiding the hover card to allow moving mouse to it
    leaveTimeoutRef.current = setTimeout(() => {
      setShowHoverCard(false);
    }, 150);
  }, []);

  const handleHoverCardMouseEnter = useCallback(() => {
    // Keep hover card visible when mouse enters it
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
  }, []);

  return (
    <div 
      ref={cardRef}
      className="movie-card-wrapper relative aspect-[2/3] rounded-lg cursor-pointer group"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Expanded Hover Card */}
      {showHoverCard && (
        <MovieHoverCard 
          movie={movie} 
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleHoverCardMouseEnter}
          style={{ 
            width: 'calc(100% + 100px)',
            minWidth: '280px',
            left: '50%',
            transform: 'translateX(-50%)',
            top: '-10%',
            position: 'absolute'
          }}
        />
      )}

      {/* Standard Card Content */}
      <div className={`w-full h-full rounded-lg overflow-hidden relative transition-all duration-300 ease-out ${
        isHovered && !showHoverCard ? 'scale-105 shadow-xl' : ''
      } ${showHoverCard ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={ophimService.getImageUrl(movie.thumb_url)}
          alt={movie.name}
          className="movie-card-image w-full h-full object-cover"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://via.placeholder.com/300x450?text=No+Image') {
              target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }
          }}
        />
        
        {/* Quality & Lang Badges */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
            {movie.quality}
          </span>
          <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
            {movie.lang}
          </span>
        </div>

        {/* Hover Overlay with Play Button */}
        {!showHoverCard && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white/95 rounded-full p-3 transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out shadow-xl hover:bg-white">
              <Play className="w-8 h-8 text-black fill-black ml-0.5" />
            </div>
          </div>
        )}

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-red-400 transition-colors duration-200">
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
