import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Heart,
  Plus,
  Share2,
  Star,
  Clock,
  Calendar,
  Film
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Watch() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovieById(id!),
    enabled: !!id,
  });

  const movie = data?.movie;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        toggleMute();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyPress);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const currentProgress = (video.currentTime / video.duration) * 100;
      setProgress(currentProgress);

      // Save progress to server
      if (id && Math.floor(currentProgress) % 10 === 0) {
        movieService.recordWatch(id, {
          progress: currentProgress,
          timestamp: video.currentTime,
        }).catch(console.error);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, [id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeout) {
      window.clearTimeout(controlsTimeout);
    }
    
    const timeout = window.setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const handleFavorite = async () => {
    try {
      if (id) {
        await movieService.addToWatchlist(id);
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Đã xóa khỏi danh sách' : 'Đã thêm vào danh sách yêu thích');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title,
        text: `Xem phim ${movie?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã copy link');
    }
  };

  if (!movie) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141414]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Hero Section with Video Player - 70vh */}
      <div
        className="relative h-[70vh] bg-black overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Background Backdrop (when video not playing or as fallback) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(http://localhost:5001${movie.thumbnail})`,
            filter: isPlaying ? 'blur(0px)' : 'blur(8px)',
            opacity: isPlaying ? 0 : 0.3
          }}
        />
        
        {/* Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />

        {/* Video Player */}
        <video
          ref={videoRef}
          src={`http://localhost:5001${movie.video.url}`}
          className="w-full h-full object-contain relative z-10"
          onClick={togglePlay}
        />

        {/* Controls Overlay */}
        <div
          className={`absolute inset-0 z-20 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors group"
              >
                <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Quay lại</span>
              </button>

              {/* Exit Fullscreen Button - Only show in fullscreen */}
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-md transition-all backdrop-blur-sm border border-red-500/50 hover:scale-105"
                >
                  <Minimize className="w-5 h-5" />
                  <span className="font-medium">Thoát toàn màn hình</span>
                </button>
              )}
            </div>
          </div>

          {/* Center Play Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all duration-300 border-2 border-white/30"
              >
                <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-1" />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
            {/* Progress Bar */}
            <div
              onClick={handleProgressClick}
              className="w-full h-1 bg-gray-600/50 rounded-full mb-6 cursor-pointer group"
            >
              <div
                className="h-full bg-red-600 rounded-full transition-all group-hover:h-1.5 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={togglePlay} 
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 md:w-8 md:h-8" />
                  ) : (
                    <Play className="w-7 h-7 md:w-8 md:h-8" />
                  )}
                </button>

                <button 
                  onClick={toggleMute} 
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-7 h-7 md:w-8 md:h-8" />
                  ) : (
                    <Volume2 className="w-7 h-7 md:w-8 md:h-8" />
                  )}
                </button>

                <div className="hidden md:block text-white ml-4">
                  <h3 className="font-semibold text-lg">{movie.title}</h3>
                </div>
              </div>

              <div className="flex items-center space-x-3 md:space-x-4">
                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-gray-300 transition-colors"
                  title={isFullscreen ? 'Thoát toàn màn hình (ESC)' : 'Toàn màn hình (F)'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-6 h-6 md:w-7 md:h-7" />
                  ) : (
                    <Maximize className="w-6 h-6 md:w-7 md:h-7" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info Section - Below Video */}
      <div className="relative z-30 -mt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          {/* Title & Actions */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {movie.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-3 mb-6 text-sm md:text-base">
              <div className="flex items-center gap-1.5 text-yellow-500">
                <Star className="w-5 h-5 fill-yellow-500" />
                <span className="font-bold">{movie.rating.average.toFixed(1)}</span>
              </div>
              
              <span className="text-gray-400">•</span>
              
              <div className="flex items-center gap-1.5 text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>{new Date(movie.releaseDate).getFullYear()}</span>
              </div>

              <span className="text-gray-400">•</span>

              <div className="flex items-center gap-1.5 text-gray-300">
                <Clock className="w-4 h-4" />
                <span>{movie.duration} phút</span>
              </div>

              <span className="text-gray-400">•</span>

              <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-medium border border-gray-700">
                {movie.quality}
              </span>

              <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-medium border border-gray-700">
                {movie.language}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-200 transition-all hover:scale-105 shadow-lg"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>Phát</span>
              </button>

              <button
                onClick={() => navigate(`/movie/${id}`)}
                className="flex items-center gap-2 bg-gray-700/80 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-600 transition-all backdrop-blur-sm border border-gray-600"
              >
                <Film className="w-5 h-5" />
                <span>Trailer</span>
              </button>

              <button
                onClick={handleFavorite}
                className={`p-3 rounded-md border transition-all hover:scale-110 ${
                  isFavorite 
                    ? 'bg-red-600 border-red-600 text-white' 
                    : 'bg-gray-800/80 border-gray-600 text-white hover:border-white'
                }`}
                title="Yêu thích"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-white' : ''}`} />
              </button>

              <button
                onClick={() => toast.success('Đã thêm vào danh sách')}
                className="p-3 bg-gray-800/80 border border-gray-600 text-white rounded-md hover:border-white transition-all hover:scale-110"
                title="Thêm vào danh sách"
              >
                <Plus className="w-5 h-5" />
              </button>

              <button
                onClick={handleShare}
                className="p-3 bg-gray-800/80 border border-gray-600 text-white rounded-md hover:border-white transition-all hover:scale-110"
                title="Chia sẻ"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Description & Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Description */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-3">Nội dung phim</h3>
                <p className="text-gray-300 leading-relaxed text-base">
                  {movie.description}
                </p>
              </div>

              {/* Genres */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Thể loại</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre: string) => (
                    <span
                      key={genre}
                      className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md text-sm hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Additional Info */}
            <div className="space-y-4">
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">Thông tin</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Đạo diễn:</span>
                    <p className="text-gray-300 font-medium mt-1">
                      {movie.director || 'Đang cập nhật'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Diễn viên:</span>
                    <p className="text-gray-300 font-medium mt-1">
                      {movie.cast?.join(', ') || 'Đang cập nhật'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Quốc gia:</span>
                    <p className="text-gray-300 font-medium mt-1">
                      {movie.country || 'Đang cập nhật'}
                    </p>
                  </div>

                  <div>
                    <span className="text-gray-500">Lượt xem:</span>
                    <p className="text-gray-300 font-medium mt-1">
                      {movie.views?.toLocaleString() || '0'} lượt
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
