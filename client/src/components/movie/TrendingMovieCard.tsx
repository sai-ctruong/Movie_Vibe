import { Movie } from '../../types';
import { Plus, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  MovieCardPlayButton,
  MovieCardIconButton,
} from './MovieCardComponents';

interface TrendingMovieCardProps {
  movie: Movie;
  rank: number;
  onAddToWatchlist?: () => void;
}

const PosterWrapper = styled.div`
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  group: 'hover';

  img {
    transition: transform 0.4s cubic-bezier(0.23, 1, 0.320, 1);
  }

  &:hover img {
    transform: scale(1.1);
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
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

export default function TrendingMovieCard({ movie, rank, onAddToWatchlist }: TrendingMovieCardProps) {
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
    <div className="trending-card group relative flex items-end">
      {/* Large rank number */}
      <div className="trending-rank">
        <span className="trending-number" data-stroke={rank}>
          {rank}
        </span>
      </div>

      {/* Movie poster */}
      <PosterWrapper className="relative w-32 h-48 flex-shrink-0 ml-10">
        <img
          src={`http://localhost:5001${movie.thumbnail}`}
          alt={movie.title}
          className="w-full h-full object-cover shadow-lg"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== 'https://via.placeholder.com/300x450?text=No+Image') {
              target.src = 'https://via.placeholder.com/300x450?text=No+Image';
            }
          }}
        />

        {/* Hover overlay with buttons */}
        <div className="overlay">
          <div className="flex items-center gap-2">
            <MovieCardPlayButton onClick={handlePlayClick} />

            {onAddToWatchlist && (
              <MovieCardIconButton onClick={handleAddToWatchlist} title="Add to Watchlist">
                <Plus className="w-5 h-5 text-white" />
              </MovieCardIconButton>
            )}

            <MovieCardIconButton onClick={handleMoreInfo} title="More Info">
              <Info className="w-5 h-5 text-white" />
            </MovieCardIconButton>
          </div>
        </div>
      </PosterWrapper>
    </div>
  );
}
