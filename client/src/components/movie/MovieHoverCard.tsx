import { useNavigate } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown, Info } from 'lucide-react';
import { ophimService } from '../../services/ophimService';
import { toast } from 'react-hot-toast';

interface MovieHoverCardProps {
  movie: any;
  onMouseLeave: () => void;
  onMouseEnter?: () => void;
  style?: React.CSSProperties;
}

export default function MovieHoverCard({ movie, onMouseLeave, onMouseEnter, style }: MovieHoverCardProps) {
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ophim/${movie.slug}`);
  };

  const handleInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ophim/${movie.slug}`);
  };

  const handleMyList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Đã thêm vào danh sách');
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Đã thích phim này');
  };

  const imageUrl = ophimService.getImageUrl(movie.poster_url || movie.thumb_url);

  // Calculate match percentage based on movie data (mock)
  const matchPercent = Math.floor(85 + Math.random() * 14);

  return (
    <div 
      className="movie-hover-card absolute bg-[#181818] rounded-lg shadow-2xl overflow-hidden z-[100]"
      style={{
        ...style,
        boxShadow: '0 14px 40px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
        minWidth: '300px',
      }}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      onClick={handlePlay}
    >
      {/* Media Area with Aspect Video ratio */}
      <div className="relative aspect-video w-full overflow-hidden">
        <img 
          src={imageUrl} 
          alt={movie.name} 
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
        
        {/* Play button overlay on image */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handlePlay}
            className="w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all transform hover:scale-110 shadow-xl"
          >
            <Play className="w-7 h-7 text-black fill-black ml-1" />
          </button>
        </div>

        {/* Title on image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg line-clamp-2">
            {movie.name}
          </h3>
        </div>
      </div>

      {/* Info Area */}
      <div className="movie-hover-card-content p-4 space-y-3 bg-[#181818]">
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePlay}
              className="hover-card-btn w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 shadow-lg"
              title="Xem phim"
            >
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            </button>
            <button 
              onClick={handleMyList}
              className="hover-card-btn w-10 h-10 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white text-gray-400 hover:text-white bg-transparent hover:bg-white/10"
              title="Thêm vào danh sách"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button 
              onClick={handleLike}
              className="hover-card-btn w-10 h-10 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white text-gray-400 hover:text-white bg-transparent hover:bg-white/10"
              title="Thích"
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
          </div>
          <button 
            onClick={handleInfo}
            className="hover-card-btn w-10 h-10 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white text-gray-400 hover:text-white bg-transparent hover:bg-white/10"
            title="Thông tin chi tiết"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Row */}
        <div className="flex items-center flex-wrap gap-2 text-sm">
          <span className="text-green-500 font-bold">{matchPercent}% Match</span>
          <span className="border border-gray-500 px-1.5 py-0.5 rounded text-[11px] text-gray-300 font-medium">
            {movie.quality || 'HD'}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[11px] bg-gray-700 text-white font-medium">
            {movie.lang || 'Vietsub'}
          </span>
          <span className="text-gray-400">{movie.year || '2024'}</span>
        </div>

        {/* Duration if available */}
        {movie.time && (
          <div className="text-sm text-gray-400">
            Thời lượng: <span className="text-white font-medium">{movie.time}</span>
          </div>
        )}

        {/* Episode info for series */}
        {movie.episode_current && (
          <div className="text-sm text-gray-400">
            Tập: <span className="text-white font-medium">{movie.episode_current}</span>
          </div>
        )}

        {/* Genres */}
        {movie.category && movie.category.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-400">
            {movie.category.slice(0, 3).map((cat: any, idx: number) => (
              <span key={cat.id || idx} className="flex items-center">
                <span className="hover:text-white transition-colors cursor-pointer">{cat.name}</span>
                {idx < Math.min(movie.category.length, 3) - 1 && (
                  <span className="mx-1.5 text-gray-600">•</span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
