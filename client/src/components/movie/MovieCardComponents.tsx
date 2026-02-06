

import React from 'react';
import { Play } from 'lucide-react';
import styled from 'styled-components';

const PlayButtonWrapper = styled.div`
  .play-button-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 15;
  }

  .play-button {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: scale(0.9);
    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    will-change: transform, box-shadow;

    &:hover {
      background: linear-gradient(135deg, #ffffff 0%, #ffffff 100%);
      box-shadow: 
        0 8px 24px rgba(255, 255, 255, 0.4),
        0 12px 32px rgba(0, 0, 0, 0.3);
      transform: scale(1.1);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  /* Shine effect */
  .play-button::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.3) 25%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0.3) 75%,
      transparent 100%
    );
    border-radius: 50%;
    pointer-events: none;
  }

  /* Trigger shine on parent hover */
  .group:hover .play-button::before {
    animation: glossSlide 0.6s ease-in-out forwards;
  }

  @keyframes glossSlide {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  .play-icon {
    width: 32px;
    height: 32px;
    color: #000;
    fill: currentColor;
    position: relative;
    z-index: 2;
    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .play-button:hover .play-icon {
    transform: scale(1.15);
  }

  /* Show on group hover */
  .group:hover .play-button {
    opacity: 1;
    transform: scale(1);
  }
`;

export const MovieCardPlayButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <PlayButtonWrapper>
    <div className="play-button-container">
      <button onClick={onClick} className="play-button" title="Play">
        <Play className="play-icon" />
      </button>
    </div>
  </PlayButtonWrapper>
);

export const MovieCardOverlay = ({ children }: { children?: React.ReactNode }) => (
  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-65 transition-all duration-300 flex items-end opacity-0 group-hover:opacity-100 rounded-md z-10">
    {children}
  </div>
);

export const MovieCardInfoSection = ({ children }: { children?: React.ReactNode }) => (
  <div className="w-full transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
    {children}
  </div>
);

export const MovieCardTitle = ({ title }: { title: string }) => (
  <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
    {title}
  </h3>
);

export const MovieCardRating = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center space-x-2 mb-2">
    <span className="text-yellow-400">★</span>
    <span className="text-white text-xs font-medium">{rating.toFixed(1)}</span>
    <span className="text-gray-400 text-xs">({count})</span>
  </div>
);

export const MovieCardButtonGroup = ({ children }: { children?: React.ReactNode }) => (
  <div className="flex items-center space-x-2">
    {children}
  </div>
);

export const MovieCardPrimaryButton = ({ 
  children, 
  onClick 
}: { 
  children?: React.ReactNode; 
  onClick: (e: React.MouseEvent) => void;
}) => (
  <button
    onClick={onClick}
    className="bg-white text-black px-3 py-1.5 rounded flex items-center space-x-1 hover:bg-opacity-80 transition text-sm font-medium"
  >
    {children}
  </button>
);

export const MovieCardIconButton = ({ 
  children, 
  onClick,
  title 
}: { 
  children?: React.ReactNode; 
  onClick: (e: React.MouseEvent) => void;
  title?: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    className="bg-gray-700 p-1.5 rounded hover:bg-gray-600 transition"
  >
    {children}
  </button>
);
