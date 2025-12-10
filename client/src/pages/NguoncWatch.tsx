import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { nguoncService } from '../services/nguoncService';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, List, Monitor, Film, RefreshCw, Settings, Loader2 } from 'lucide-react';
import Hls from 'hls.js';
import axios from 'axios';

type PlayerType = 'direct' | 'embed';

export default function NguoncWatch() {
  const { slug, episode } = useParams<{ slug: string; episode: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [playerType, setPlayerType] = useState<PlayerType>('direct');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Đang tải video...');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [streamToken, setStreamToken] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ['nguonc-movie', slug],
    queryFn: () => nguoncService.getMovieBySlug(slug!),
    enabled: !!slug,
  });

  const movie = data?.movie;
  const episodes = movie?.episodes?.[0]?.items || [];
  const currentEpisode = episodes.find(ep => ep.slug === episode);
  const currentEpisodeIndex = episodes.findIndex(ep => ep.slug === episode);
  const servers = movie?.episodes || [];

  // Extract token từ embed URL
  const extractStreamToken = useCallback(async (embedUrl: string) => {
    try {
      setLoadingMessage('Đang trích xuất link video...');
      const response = await axios.get(`/api/proxy/extract?embed=${encodeURIComponent(embedUrl)}`);
      
      if (response.data.success && response.data.token) {
        return response.data.token;
      }
      return null;
    } catch (error) {
      console.error('Extract error:', error);
      return null;
    }
  }, []);

  // Initialize Direct HLS player (không quảng cáo)
  useEffect(() => {
    if (playerType !== 'direct' || !currentEpisode || !videoRef.current) return;

    const video = videoRef.current;
    
    const initPlayer = async () => {
      setIsLoading(true);
      setError(null);
      
      let token = streamToken;
      
      // Nếu chưa có token, extract từ embed URL
      if (!token && currentEpisode.embed) {
        token = await extractStreamToken(currentEpisode.embed);
        if (token) {
          setStreamToken(token);
        }
      }
      
      if (!token) {
        // Fallback: thử dùng m3u8 URL trực tiếp qua proxy
        const m3u8Url = currentEpisode.m3u8;
        if (m3u8Url) {
          setLoadingMessage('Đang thử phương thức dự phòng...');
          initHlsWithUrl(`/api/proxy/m3u8?url=${encodeURIComponent(m3u8Url)}`);
        } else {
          setError('Không tìm thấy link video. Vui lòng thử Embed Player.');
          setIsLoading(false);
        }
        return;
      }
      
      // Sử dụng stream endpoint với token
      const streamUrl = `/api/proxy/stream?token=${encodeURIComponent(token)}`;
      setLoadingMessage('Đang kết nối...');
      initHlsWithUrl(streamUrl);
    };
    
    const initHlsWithUrl = (url: string) => {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          startLevel: -1, // Auto quality
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });
        
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          setLoadingMessage('');
          video.play().catch(() => setIsPlaying(false));
          setIsPlaying(true);
        });

        hls.on(Hls.Events.ERROR, (_event: typeof Hls.Events.ERROR, data: { fatal: boolean; type: string; details: string }) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            setIsLoading(false);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                setError('Không thể tải video. Nguồn có thể tạm thời không khả dụng.');
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                setError('Không thể phát video. Vui lòng thử Embed Player.');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
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
        setError('Trình duyệt không hỗ trợ phát video HLS.');
        setIsLoading(false);
      }
    };
    
    initPlayer();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentEpisode, playerType, extractStreamToken]);

  // Reset token khi episode thay đổi
  useEffect(() => {
    setStreamToken(null);
  }, [episode]);

  // Handle embed player load
  useEffect(() => {
    if (playerType === 'embed') {
      setIsLoading(true);
      setError(null);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [playerType, currentEpisode]);

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
          setShowSettings(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, volume]);

  // Update progress and buffer
  useEffect(() => {
    const video = videoRef.current;
    if (!video || playerType === 'embed') return;

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
  }, [playerType]);

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
    if (!video || playerType === 'embed') return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video || playerType === 'embed') return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const changeVolume = (delta: number) => {
    const video = videoRef.current;
    if (!video || playerType === 'embed') return;

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
    if (!video || playerType === 'embed') return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || playerType === 'embed') return;

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
      if (isPlaying && !showEpisodes && !showSettings) {
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
    navigate(`/nguonc/watch/${slug}/${epSlug}`);
    setShowEpisodes(false);
    setError(null);
    setIsLoading(true);
    setStreamToken(null);
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

  const switchPlayer = (type: PlayerType) => {
    setPlayerType(type);
    setError(null);
    setIsLoading(true);
    setShowSettings(false);
  };

  const retryPlayer = () => {
    setError(null);
    setIsLoading(true);
    setStreamToken(null);
    // Force re-render
    setPlayerType(prev => prev === 'direct' ? 'embed' : 'direct');
  };

  if (!movie || !currentEpisode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Đang tải thông tin phim...</p>
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
            onClick={() => navigate(`/nguonc/${slug}`)}
            className="flex items-center space-x-2 text-white hover:text-red-500 transition"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="text-white text-center flex-1 mx-4">
            <h3 className="font-semibold text-sm md:text-base line-clamp-1">{movie.name}</h3>
            <p className="text-gray-400 text-xs md:text-sm">
              Tập {currentEpisode.name}
              {playerType === 'direct' && !error && (
                <span className="ml-2 text-green-400">• Không quảng cáo</span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-red-500 transition p-2"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowEpisodes(!showEpisodes)}
              className="flex items-center space-x-1 text-white hover:text-red-500 transition bg-gray-800/80 px-3 py-2 rounded-lg"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Tập phim</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 right-4 md:right-6 w-64 bg-black/95 rounded-lg overflow-hidden z-30 border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Cài đặt Player</h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <p className="text-gray-400 text-xs mb-2">Chọn nguồn phát</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => switchPlayer('direct')}
                  className={`flex flex-col items-center p-3 rounded-lg transition ${
                    playerType === 'direct' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Film className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Không QC</span>
                </button>
                <button
                  onClick={() => switchPlayer('embed')}
                  className={`flex flex-col items-center p-3 rounded-lg transition ${
                    playerType === 'embed' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Monitor className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">Embed</span>
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {playerType === 'direct' 
                  ? '✓ Video gốc, không quảng cáo' 
                  : '⚠ Player nguồn (có thể có quảng cáo)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-red-600 mx-auto mb-4 animate-spin" />
            <p className="text-white">{loadingMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
          <div className="text-center max-w-md px-4">
            <p className="text-red-400 text-lg mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={retryPlayer}
                className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Thử lại
              </button>
              <button
                onClick={() => switchPlayer(playerType === 'embed' ? 'direct' : 'embed')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
              >
                {playerType === 'embed' ? <Film className="w-4 h-4 mr-2" /> : <Monitor className="w-4 h-4 mr-2" />}
                Thử {playerType === 'embed' ? 'Không QC' : 'Embed'}
              </button>
              <button
                onClick={() => navigate(`/nguonc/${slug}`)}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embed Player */}
      {playerType === 'embed' && currentEpisode.embed && (
        <iframe
          src={currentEpisode.embed}
          className="w-full h-full pt-16"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError('Không thể tải Embed player. Vui lòng thử lại sau.');
            setIsLoading(false);
          }}
        />
      )}

      {/* Direct HLS Video Player */}
      {playerType === 'direct' && (
        <>
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
                  className="w-20 h-20 bg-red-600/90 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-xl transform hover:scale-110"
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
                  className="h-full bg-red-600 rounded-full transition-all relative group-hover:h-2"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition shadow-md" />
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <button onClick={togglePlay} className="text-white hover:text-red-500 transition">
                    {isPlaying ? <Pause className="w-7 h-7 md:w-8 md:h-8" /> : <Play className="w-7 h-7 md:w-8 md:h-8" />}
                  </button>

                  <button
                    onClick={goToPrevEpisode}
                    disabled={currentEpisodeIndex === 0}
                    className="text-white hover:text-red-500 transition disabled:opacity-30"
                  >
                    <SkipBack className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  <button
                    onClick={goToNextEpisode}
                    disabled={currentEpisodeIndex === episodes.length - 1}
                    className="text-white hover:text-red-500 transition disabled:opacity-30"
                  >
                    <SkipForward className="w-5 h-5 md:w-6 md:h-6" />
                  </button>

                  <div className="flex items-center space-x-2 group">
                    <button onClick={toggleMute} className="text-white hover:text-red-500 transition">
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
                      className="w-0 group-hover:w-20 transition-all duration-200 accent-red-600"
                    />
                  </div>

                  <span className="text-white text-xs md:text-sm font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="text-white hover:text-red-500 transition"
                >
                  <Maximize className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Episode Panel */}
      {showEpisodes && (
        <div className="absolute top-20 right-4 md:right-6 bottom-24 w-64 md:w-72 bg-black/95 rounded-lg overflow-hidden z-30 border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Danh sách tập</h3>
            <p className="text-gray-500 text-xs">{episodes.length} tập</p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)] p-3">
            {servers.map((server, serverIndex) => (
              <div key={serverIndex} className="mb-4">
                {servers.length > 1 && (
                  <p className="text-gray-400 text-xs mb-2">{server.server_name}</p>
                )}
                <div className="grid grid-cols-4 gap-2">
                  {server.items.map((ep) => (
                    <button
                      key={ep.slug}
                      onClick={() => goToEpisode(ep.slug)}
                      className={`py-2 px-2 rounded text-xs font-medium transition ${
                        ep.slug === episode
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {ep.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
