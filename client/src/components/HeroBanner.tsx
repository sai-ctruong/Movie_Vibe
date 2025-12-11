import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { ophimService } from '../services/ophimService';

interface HeroBannerProps {
  movies: any[];
}

export default function HeroBanner({ movies }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  // Ensure we only use movies that have a poster (backdrop)
  const featuredMovies = movies.filter(m => m.poster_url || m.thumb_url).slice(0, 10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(timer);
  }, [featuredMovies.length]);

  if (!featuredMovies.length) return null;

  const currentMovie = featuredMovies[currentIndex];
  
  // OPhim specific fields
  const movieYear = currentMovie.year || new Date(currentMovie.created || Date.now()).getFullYear();
  const quality = currentMovie.quality || 'HD';
  const language = currentMovie.lang || 'Vietsub';

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  const handlePlay = () => {
    // Correct navigation for OPhim movies
    navigate(`/ophim/${currentMovie.slug}`);
  };

  return (
    <div className="relative w-full h-[60vh] md:h-[85vh] overflow-hidden group">
      {/* Background Image Layer */}
      <div className="absolute inset-0 transition-opacity duration-1000 ease-in-out">
        {featuredMovies.map((movie, index) => (
           <div 
             key={movie._id || movie.slug}
             className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
               index === currentIndex ? 'opacity-100' : 'opacity-0'
             }`}
             style={{ 
               backgroundImage: `url('${ophimService.getImageUrl(movie.poster_url || movie.thumb_url)}')` 
             }}
           >
             {/* Gradient Overlay - Cinematic Effect */}
             <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
           </div>
        ))}
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 flex items-center px-4 md:px-12">
        <div className="max-w-2xl w-full space-y-4 md:space-y-6 pt-20 animate-fade-in-up">
          {/* Metadata Badges */}
          <div className="flex items-center space-x-3 text-xs md:text-sm font-medium">
             <span className="bg-yellow-500 text-black px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-glow">{quality}</span>
             <span className="bg-white/20 text-white px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">{movieYear}</span>
             {currentMovie.time && (
                <span className="bg-gray-800/80 text-gray-300 px-2 py-0.5 rounded backdrop-blur-sm border border-white/5">{currentMovie.time}</span>
             )}
             <span className="text-green-400 flex items-center font-bold">
                <Star className="w-3 h-3 fill-current mr-1" />
                {((Math.random() * 2) + 8).toFixed(1)}
             </span>
             <span className="text-gray-300">{language}</span>
          </div>

          {/* Title - Trying to mimic "Logo" style with text if no logo available */}
          <h1 
             className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-400 leading-none drop-shadow-2xl font-anton tracking-wide"
             style={{ 
                 textShadow: '0 10px 30px rgba(0,0,0,0.5)',
                 WebkitTextStroke: '1px rgba(255,255,255,0.1)' 
             }}
          >
            {currentMovie.name}
          </h1>
          
          {currentMovie.original_name && (
             <p className="text-xl md:text-2xl text-gray-400 font-light italic tracking-wide">
                {currentMovie.original_name}
             </p>
          )}

          {/* Description line clamp */}
          <p className="text-gray-300 text-sm md:text-lg line-clamp-3 md:line-clamp-4 max-w-xl drop-shadow-md leading-relaxed">
             {/* Strip HTML tags if any */}
            {currentMovie.content ? currentMovie.content.replace(/<[^>]*>?/gm, '') : 'Một siêu phẩm không thể bỏ lỡ...'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <button 
              onClick={handlePlay}
              className="flex items-center space-x-2 bg-white text-black px-8 py-3.5 rounded hover:bg-white/90 transition transform hover:scale-105 font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              <Play className="w-6 h-6 fill-black" />
              <span>Xem Ngay</span>
            </button>
            <button 
               onClick={handlePlay}
               className="flex items-center space-x-2 bg-gray-600/40 text-white px-8 py-3.5 rounded backdrop-blur-md hover:bg-gray-500/60 transition font-medium border border-white/10 hover:border-white/30"
            >
              <Info className="w-6 h-6" />
              <span>Thông Tin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slider Controls */}
      <div className="absolute right-4 bottom-24 md:bottom-1/3 flex-col space-y-2 hidden md:flex z-20">
         <button onClick={handlePrev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md border border-white/10">
            <ChevronLeft className="w-6 h-6" />
         </button>
         <button onClick={handleNext} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md border border-white/10">
            <ChevronRight className="w-6 h-6" />
         </button>
      </div>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 right-12 flex space-x-2">
         {featuredMovies.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                 idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-gray-600'
              }`}
            />
         ))}
      </div>
    </div>
  );
}
