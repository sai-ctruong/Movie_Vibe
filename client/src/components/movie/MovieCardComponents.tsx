

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
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 28px;
    border: 3px solid #ffffff;
    background-color: transparent;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 600;
    color: #ffffff;
    cursor: pointer;
    overflow: visible;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    opacity: 0;
    transform: scale(0.9);
    will-change: transform, box-shadow;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    &:hover {
      border-color: transparent;
      border-radius: 12px;
      box-shadow: 0 0 0 12px rgba(255, 255, 255, 0.1);
    }

    &:active {
      scale: 0.95;
    }
  }

  /* Arrow icons - absolute positioned */
  .play-button svg {
    position: absolute;
    width: 24px;
    height: 24px;
    fill: #ffffff;
    z-index: 9;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .play-button .arr-1 {
    right: 16px;
  }

  .play-button .arr-2 {
    left: -25%;
  }

  /* Expanding circle on hover */
  .play-button .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
    pointer-events: none;
  }

  /* Play text */
  .play-button .play-text {
    position: relative;
    z-index: 1;
    transform: translateX(-12px);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  /* Play icon */
  .play-icon {
    width: 24px;
    height: 24px;
    color: #ffffff;
    fill: currentColor;
    position: relative;
    z-index: 2;
    transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  }

  /* Hover states */
  .group:hover .play-button {
    opacity: 1;
    transform: scale(1);
  }

  .play-button:hover .arr-1 {
    right: -25%;
  }

  .play-button:hover .arr-2 {
    left: 16px;
  }

  .play-button:hover .play-text {
    transform: translateX(12px);
  }

  .play-button:hover .circle {
    width: 220px;
    height: 220px;
    opacity: 1;
  }

  .play-button:hover {
    color: transparent;
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
    border-radius: 100px;
    pointer-events: none;
    z-index: 1;
  }

  .play-button:hover::before {
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
`;

export const MovieCardPlayButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => (
  <PlayButtonWrapper>
    <div className="play-button-container">
      <button onClick={onClick} className="play-button" title="Play">
        <svg xmlns="http://www.w3.org/2000/svg" className="arr-2" viewBox="0 0 24 24">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
        <span className="play-text">PLAY</span>
        <Play className="play-icon" />
        <span className="circle" />
        <svg xmlns="http://www.w3.org/2000/svg" className="arr-1" viewBox="0 0 24 24">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
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
