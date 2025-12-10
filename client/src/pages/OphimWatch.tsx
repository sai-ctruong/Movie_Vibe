import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ophimService } from '../services/ophimService';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, List, Loader2, CheckCircle } from 'lucide-react';
import Hls from 'hls.js';

export default function OphimWatch() {
  const { slug, episode } = useParams<{ slug: string; episode: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [currentServer, setCurrentServer] = useState(0);

  const { data } = useQuery({
    queryKey: ['ophim-movie', slug],
    queryFn: () => ophimService.getMovieBySlug(slug!),
    enabled: !!slug,
  });

  const movie = data?.data?.item;
  const servers = movie?.episodes || [];
  const episodes = servers[currentServer]?.server_data || [];
  const currentEpisode = episodes.find(ep => ep.slug === episode);
  const currentEpisodeIndex = episodes.findIndex(ep => ep.slug === episode);

  // Initialize HLS player - OPhim cung cấp m3u8 trực tiếp
  useEffect(() => {
    if (!currentEpisode || !videoRef.current) return;

    const video = videoRef.current;
    const m3u8Url = currentEpisode.link_m3u8;

    if (!m3u8Url) {
      setError('Không tìm thấy link phát cho tập này.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        startLevel: -1,
      });
      
      hlsRef.current = hls;

      hls.loadSource(m3u8Url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      });

      hls.on(Hls.Events.ERROR, (_event: typeof Hls.Events.ERROR, data: { fatal: boolean; type: string }) => {
        console.error('HLS Error:', data);
        if (data.fatal) {
          setIsLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Lỗi mạng. Đang thử lại...');
              setTimeout(() => hls.startLoad(), 2000);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setError('Không thể phát video. Vui lòng thử server khác.');
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = m3u8Url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        video.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
      });
      video.addEventListener('error', () => {
        setError('Không thể phát video.');
        setIsLoading(false);
      });
    } else {
      setError('Trình duyệt không hỗ trợ HLS.');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEpisode, currentServer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'ArrowLeft':
          seek(-10);
          break;
        case 'ArrowRight':
          seek(10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'Escape':
          setShowEpisodes(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume]);

  // Update progress and buffer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
        setCurrentTime(video.currentTime);
        setDuration(video.duration);
      }
    };

    const updateBuffer = () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('progress', updateBuffer);
    video.addEventListener('play', () => setIsPlaying(true));
    video.addEventListener('pause', () => setIsPlaying(false));
    video.addEventListener('waiting', () => setIsLoading(true));
    video.addEventListener('canplay', () => setIsLoading(false));

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('progress', updateBuffer);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const changeVolume = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = Math.max(0, Math.min(1, volume + delta));
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
  };

  const handleMouseMove = () => {
    setShowControls(true);

    if (controlsTimeout) {
      window.clearTimeout(controlsTimeout);
    }

    const timeout = window.setTimeout(() => {
      if (isPlaying && !showEpisodes) {
        setShowControls(false);
      }
    }, 3000);

    setControlsTimeout(timeout);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToEpisode = (epSlug: string) => {
    navigate(`/ophim/watch/${slug}/${epSlug}`);
    setShowEpisodes(false);
    setError(null);
    setIsLoading(true);
  };

  const goToPrevEpisode = () => {
    if (currentEpisodeIndex > 0) {
      goToEpisode(episodes[currentEpisodeIndex - 1].slug);
    }
  };

  const goToNextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      goToEpisode(episodes[currentEpisodeIndex + 1].slug);
    }
  };

  const switchServer = (index: number) => {
    setCurrentServer(index);
    setError(null);
    setIsLoading(true);
  };

  if (!movie || !currentEpisode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-screen bg-black select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Top Bar */}
      <div className={`absolute top-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-b from-black/90 to-transparent z-20 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/ophim/${slug}`)}
            className="flex items-center space-x-2 text-white hover:text-green-500 transition"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="text-white text-center flex-1 mx-4">
            <h3 className="font-semibold text-sm md:text-base line-clamp-1">{movie.name}</h3>
            <p className="text-gray-400 text-xs md:text-sm flex items-center justify-center">
              Tập {currentEpisode.name}
              <span className="ml-2 text-green-400 flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                Không quảng cáo
              </span>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Server selector */}
            {servers.length > 1 && (
              <div className="relative group">
                <button className="text-white bg-gray-800/80 px-3 py-2 rounded-lg hover:bg-gray-700 text-xs">
                  {servers[currentServer]?.server_name || 'Server'}
                </button>
                <div className="absolute right-0 top-full mt-1 bg-black/95 rounded-lg overflow-hidden hidden group-hover:block z-30 border border-gray-800 min-w-[150px]">
                  {servers.map((server, index) => (
                    <button
                      key={index}
                      onClick={() => switchServer(index)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-green-600 transition ${
                        currentServer === index ? 'bg-green-600 text-white' : 'text-gray-300'
                      }`}
                    >
                      {server.server_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="flex items-center space-x-1 text-white hover:text-green-500 transition bg-gray-800/80 px-3 py-2 rounded-lg"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Tập phim</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-green-600 mx-auto mb-4 animate-spin" />
            <p className="text-white">Đang tải video...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center max-w-md px-4">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {servers.length > 1 && (
                <button
                  onClick={() => switchServer((currentServer + 1) % servers.length)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                >
                  Thử Server Khác
                </button>
              )}
              <button
                onClick={() => navigate(`/ophim/${slug}`)}
                className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        playsInline
      />

      {/* Video Controls Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Center Play Button */}
        {!isPlaying && !error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-green-600/90 rounded-full flex items-center justify-center hover:bg-green-600 transition shadow-xl transform hover:scale-110"
            >
              <Play className="w-10 h-10 text-white fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent">
          {/* Progress Bar */}
          <div
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-gray-600/50 rounded-full mb-4 cursor-pointer group relative"
          >
            <div
              className="absolute h-full bg-gray-500/50 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="h-full bg-green-500 rounded-full transition-all relative group-hover:h-2"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-green-500 transition">
                {isPlaying ? <Pause className="w-7 h-7 md:w-8 md:h-8" /> : <Play className="w-7 h-7 md:w-8 md:h-8" />}
              </button>

              <button
                onClick={goToPrevEpisode}
                disabled={currentEpisodeIndex === 0}
                className="text-white hover:text-green-500 transition disabled:opacity-30"
              >
                <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <button
                onClick={goToNextEpisode}
                disabled={currentEpisodeIndex === episodes.length - 1}
                className="text-white hover:text-green-500 transition disabled:opacity-30"
              >
                <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <div className="flex items-center space-x-2 group">
                <button onClick={toggleMute} className="text-white hover:text-green-500 transition">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 md:w-6 md:h-6" /> : <Volume2 className="w-5 h-5 md:w-6 md:h-6" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.volume = val;
                      setVolume(val);
                      setIsMuted(val === 0);
                    }
                  }}
                  className="w-0 group-hover:w-20 transition-all duration-200 accent-green-500"
                />
              </div>

              <span className="text-white text-xs md:text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-green-500 transition"
            >
              <Maximize className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Episode Panel */}
      {showEpisodes && (
        <div className="absolute top-20 right-4 md:right-6 bottom-24 w-64 md:w-72 bg-black/95 rounded-lg overflow-hidden z-30 border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Danh sách tập</h3>
            <p className="text-gray-500 text-xs">{episodes.length} tập • {servers[currentServer]?.server_name}</p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)] p-3">
            <div className="grid grid-cols-4 gap-2">
              {episodes.map((ep) => (
                <button
                  key={ep.slug}
                  onClick={() => goToEpisode(ep.slug)}
                  className={`py-2 px-2 rounded text-xs font-medium transition ${
                    ep.slug === episode
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {ep.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
