import { useNavigate } from 'react-router-dom';
import { OphimMovie } from '../../types/ophim';
import { ophimService } from '../../services/ophimService';
import { Play, Info } from 'lucide-react';
import styled from 'styled-components';
import {
  MovieCardPlayButton,
  MovieCardTitle,
  MovieCardButtonGroup,
  MovieCardPrimaryButton,
  MovieCardIconButton,
} from './MovieCardComponents';

interface OphimMovieCardProps {
  movie: OphimMovie;
}

const CardWrapper = styled.div`
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  group: 'hover';

  img {
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  }

  &:hover img {
    transform: scale(1.08);
  }

  /* Gloss effect - angled shine */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 20%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0.15) 80%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 20;
    transform: skewX(-20deg);
  }

  &:hover::before {
    animation: glossSlide 0.85s ease-in-out forwards;
  }

  @keyframes glossSlide {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  /* Overlay */
  .overlay {
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0);
    transition: background-color 0.35s cubic-bezier(0.23, 1, 0.320, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    z-index: 10;
  }

  &:hover .overlay {
    background-color: rgba(0, 0, 0, 0.65);
  }

  /* Info section */
  .info-section {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7), transparent);
    border-radius: 0 0 0.5rem 0.5rem;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.35s cubic-bezier(0.23, 1, 0.320, 1);
    z-index: 12;
  }

  &:hover .info-section {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function OphimMovieCard({ movie }: OphimMovieCardProps) {
  const navigate = useNavigate();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!movie.slug) return;
    navigate(`/ophim/${movie.slug}`);
  };

  const handleMoreInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!movie.slug) return;
    navigate(`/ophim/${movie.slug}`);
  };

  return (
    <CardWrapper className="cursor-pointer group">
      <img
        src={ophimService.getImageUrl(movie.thumb_url)}
        alt={movie.name}
        className="w-full h-full object-cover"
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
      <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-5">
        <span className="bg-red-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
          {movie.quality}
        </span>
        <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg backdrop-blur-sm">
          {movie.lang}
        </span>
      </div>

      {/* Center play button */}
      <div className="overlay">
        <MovieCardPlayButton onClick={handlePlayClick} />
      </div>

      {/* Info section */}
      <div className="info-section">
        <MovieCardTitle title={movie.name} />
        
        <p className="text-gray-400 text-xs line-clamp-1 mb-2">
          {movie.origin_name} ({movie.year})
        </p>

        <MovieCardButtonGroup>
          <MovieCardPrimaryButton onClick={handlePlayClick}>
            <Play className="w-4 h-4" />
            <span>Play</span>
          </MovieCardPrimaryButton>
          
          <MovieCardIconButton onClick={handleMoreInfo} title="More Info">
            <Info className="w-4 h-4 text-white" />
          </MovieCardIconButton>
        </MovieCardButtonGroup>
      </div>
    </CardWrapper>
  );
}
