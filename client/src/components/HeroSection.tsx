import { useState, useEffect } from 'react';
import { Movie } from '../types';
import { Play, Info, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  movies: Movie[];
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentMovie = movies[currentIndex];

  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (movies.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 8000);

    return () => clearInterval(interval);
  }, [movies.length, currentIndex]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
      setIsTransitioning(false);
    }, 300);
  };

  if (!currentMovie) return null;

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden">
      {/* Background Image with animation */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <img
          src={`http://localhost:5001${currentMovie.thumbnail}`}
          alt={currentMovie.title}
          className="w-full h-full object-cover scale-105 animate-slow-zoom"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080?text=No+Image';
          }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-netflix-black/80 via-transparent to-transparent" />
        {/* Vignette effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Content */}
      <div className={`relative h-full flex items-center px-4 md:px-12 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-2xl">
          {/* Netflix-style badges */}
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">TOP 10</span>
            <span className="text-gray-300 text-sm">#{currentIndex + 1} in Movies Today</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 text-shadow leading-tight">
            {currentMovie.title}
          </h1>

          {/* Movie meta info */}
          <div className="flex items-center flex-wrap gap-3 mb-4">
            <span className="text-green-500 font-semibold">98% Match</span>
            <span className="text-gray-400">{currentMovie.releaseYear}</span>
            <span className="border border-gray-500 text-gray-400 text-xs px-1.5 py-0.5 rounded">HD</span>
            <span className="text-gray-400">{Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}m</span>
            <span className="border border-gray-500 text-gray-400 text-xs px-1.5 py-0.5 rounded">
              {currentMovie.genre?.[0] || 'Drama'}
            </span>
          </div>

          <div className="flex items-center space-x-4 mb-6">
            <div className="flex items-center bg-yellow-500/20 px-3 py-1 rounded-full">
              <span className="text-yellow-400 text-lg mr-1">★</span>
              <span className="text-white font-bold">{currentMovie.rating?.average?.toFixed(1) || '0.0'}</span>
              <span className="text-gray-400 text-sm ml-1">({currentMovie.rating?.count || 0})</span>
            </div>
          </div>

          <p className="text-lg text-gray-200 mb-8 line-clamp-3 text-shadow max-w-xl">
            {currentMovie.description}
          </p>

          {/* Action buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/watch/${currentMovie._id}`)}
              className="bg-white text-black px-8 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Play className="w-7 h-7 fill-current" />
              <span>Play</span>
            </button>

            <button
              onClick={() => navigate(`/movie/${currentMovie._id}`)}
              className="bg-gray-600/70 backdrop-blur-sm text-white px-8 py-3 rounded-lg flex items-center space-x-2 hover:bg-gray-500/70 transition-all duration-200 font-semibold text-lg"
            >
              <Info className="w-6 h-6" />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {movies.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 z-10"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 z-10"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {movies.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex space-x-2">
          {movies.slice(0, 5).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-white' : 'w-4 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Mute button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute right-12 bottom-36 p-3 rounded-full border-2 border-white/50 hover:border-white hover:bg-white/10 transition-all"
      >
        {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
      </button>

      {/* Age rating badge */}
      <div className="absolute right-0 bottom-36 bg-gray-800/80 backdrop-blur-sm px-4 py-1 border-l-4 border-white">
        <span className="text-white text-sm">18+</span>
      </div>
    </div>
  );
}
