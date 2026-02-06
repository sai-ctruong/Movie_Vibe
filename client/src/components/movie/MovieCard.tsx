import { Movie } from '../../types';
import { Play, Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  MovieCardPlayButton,
  MovieCardTitle,
  MovieCardRating,
  MovieCardButtonGroup,
  MovieCardPrimaryButton,
  MovieCardIconButton,
} from './MovieCardComponents';

interface MovieCardProps {
  movie: Movie;
  onAddToWatchlist?: () => void;
}

// Styled card container with hover effects
const CardWrapper = styled.div`
  position: relative;
  aspect-ratio: 2 / 3;
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
    z-index: 0;
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
    z-index: 20;
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
    padding: 16px;
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

  /* Reveal play button when the whole card (group) is hovered */
  &:hover .play-button {
    opacity: 1;
    transform: scale(1);
  }

  &:hover .play-button .arr-1 {
    right: -25%;
  }

  &:hover .play-button .arr-2 {
    left: 16px;
  }
`;

export default function MovieCard({ movie, onAddToWatchlist }: MovieCardProps) {
  const navigate = useNavigate();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/watch/${movie._id}`);
  };

  const handleMoreInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/movie/${movie._id}`);
  };

  const handleAddToWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToWatchlist?.();
  };

  return (
    <CardWrapper className="group">
      <img
        src={`http://localhost:5001${movie.thumbnail}`}
        alt={movie.title}
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

      {/* Center play button on hover */}
      <div className="overlay">
        <MovieCardPlayButton onClick={handlePlayClick} />
      </div>

      {/* Info section at bottom on hover */}
      <div className="info-section">
        <MovieCardTitle title={movie.title} />
        <MovieCardRating rating={movie.rating.average} count={movie.rating.count} />

        <MovieCardButtonGroup>
          <MovieCardPrimaryButton onClick={handlePlayClick}>
            <Play className="w-4 h-4" />
            <span>Play</span>
          </MovieCardPrimaryButton>

          {onAddToWatchlist && (
            <MovieCardIconButton onClick={handleAddToWatchlist} title="Add to Watchlist">
              <Plus className="w-4 h-4 text-white" />
            </MovieCardIconButton>
          )}

          <MovieCardIconButton onClick={handleMoreInfo} title="More Info">
            <Info className="w-4 h-4 text-white" />
          </MovieCardIconButton>
        </MovieCardButtonGroup>
      </div>
    </CardWrapper>
  );
}
