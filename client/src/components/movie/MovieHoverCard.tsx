import { useNavigate } from 'react-router-dom';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { ophimService } from '../../services/ophimService';
import { toast } from 'react-hot-toast';

interface MovieHoverCardProps {
  movie: any;
  onMouseLeave: () => void;
  style?: React.CSSProperties;
}

export default function MovieHoverCard({ movie, onMouseLeave, style }: MovieHoverCardProps) {
  const navigate = useNavigate();

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/ophim/${movie.slug}`);
  };

  const handleMyList = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success('Đã thêm vào danh sách');
  };

  const imageUrl = ophimService.getImageUrl(movie.poster_url || movie.thumb_url);

  return (
    <div 
      className="absolute top-0 left-0 w-full bg-[#141414] rounded-xl shadow-2xl overflow-hidden z-50 transform transition-all duration-300 ease-out origin-center"
      style={{
        ...style,
        animation: 'scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards', // Smooth ease-out pop
        boxShadow: '0 20px 60px rgba(0,0,0,0.9)',
      }}
      onMouseLeave={onMouseLeave}
      onClick={handlePlay}
    >
      {/* Media Area */}
      <div className="relative aspect-video w-full">
        <img 
          src={imageUrl} 
          alt={movie.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
             <h3 className="text-white font-anton text-lg leading-tight drop-shadow-md line-clamp-1">
                {movie.name}
             </h3>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4 pt-2 space-y-3 bg-[#141414]">
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button 
                onClick={handlePlay}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition"
            >
              <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            </button>
            <button 
                onClick={handleMyList}
                className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition">
              <ThumbsUp className="w-4 h-4" />
            </button>
          </div>
          <button className="w-8 h-8 rounded-full border-2 border-gray-500 flex items-center justify-center hover:border-white text-gray-400 hover:text-white transition group">
            <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
        </div>

        {/* Metadata */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-gray-400">
           <span className="text-green-400 font-bold">98% Match</span>
           <span className="border border-gray-500 px-1 rounded text-[10px] text-gray-300">
             {movie.quality || 'HD'}
           </span>
           <span className="px-1 rounded text-[10px] bg-gray-700 text-white">
             {movie.lang || 'Vietsub'}
           </span>
            <span>{movie.year || '2024'}</span>
        </div>

        {/* Duration if available */}
        {movie.time && (
             <div className="text-xs text-gray-500">
                Thời lượng: <span className="text-gray-300">{movie.time}</span>
             </div>
        )}

        {/* Genres */}
        <div className="flex flex-wrap gap-1">
          {movie.category?.slice(0, 3).map((cat: any) => (
            <span key={cat.id} className="text-[10px] text-gray-400 relative pr-2 last:pr-0 after:content-['•'] after:absolute after:right-0 after:text-gray-600 last:after:content-['']">
              {cat.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
