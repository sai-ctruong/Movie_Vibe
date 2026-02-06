import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RefreshCw, 
  AlertCircle,
  PictureInPicture2,
  Gauge
} from 'lucide-react';
import { videoService, VideoSource } from '../services/videoService';
import MovieLoader from './MovieLoader';

interface VideoPlayerProps {
  episode: any;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export default function VideoPlayer({ episode, onError, onSuccess }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Player State
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [currentSourceIndex, setCurrentSourceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Đang khởi tạo...');
  const [isBuffering, setIsBuffering] = useState(false);
  
  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const bufferingTimeoutRef = useRef<NodeJS.Timeout>();

  // Available playback speeds
  const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const initializeVideo = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Đang tìm nguồn phim...');

    try {
      const result = await videoService.getVideoSources(episode);
      
      if (!result.success || result.sources.length === 0) {
        throw new Error('Không tìm thấy nguồn phim nào');
      }

      setSources(result.sources);
      setCurrentSourceIndex(0);
      await loadSource(result.sources[0]);
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi tải video';
      // If we fail to even get sources, try to fallback to embed from raw episode if possible
      if (episode.link_embed || episode.embed) {
        setSources([{
           url: episode.link_embed || episode.embed,
           type: 'embed',
           label: 'Netflow Embed'
        }]);
        loadSource({
           url: episode.link_embed || episode.embed,
           type: 'embed',
           label: 'Netflow Embed'
        });
      } else {
        setError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);
      }
    }
  }, [episode, onError]);

  const loadSource = useCallback(async (source: VideoSource) => {
    if (!videoRef.current && source.type !== 'embed') return;

    setLoadingMessage(`Đang tải ${source.label}...`);
    setIsLoading(true); // Ensure loading state is true when switching sources
    
    // Cleanup HLS
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (source.type === 'hls') {
      const video = videoRef.current!;

      if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        
        hlsRef.current = hls;
        hls.loadSource(source.url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          setLoadingMessage('');
          video.play().catch(() => {
              setIsPlaying(false);
              // Auto-play might be blocked, this is fine
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            console.error('HLS Fatal Error:', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // For NguonC or unstable streams, network error usually means dead link.
                // Switch to next source immediately instead of trying to load.
                console.log('HLS Network Error, switching source...');
                hls.destroy();
                handleSourceError();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                handleSourceError();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source.url;
        video.onloadedmetadata = () => {
            setIsLoading(false);
            setLoadingMessage('');
            video.play();
        };
        video.onerror = handleSourceError;
      } else {
        handleSourceError();
      }
    } else if (source.type === 'embed') {
      setIsLoading(false);
      setLoadingMessage('');
      onSuccess?.();
    } else {
      // Normal MP4
      const video = videoRef.current!;
      video.src = source.url;
      video.onloadedmetadata = () => {
          setIsLoading(false);
          video.play();
      };
      video.onerror = handleSourceError;
    }
  }, [onSuccess]);

  const handleSourceError = useCallback(() => {
    console.log("Source Error encountered, trying next source...");
    
    // Use functional update to ensure we have the latest state
    setCurrentSourceIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      
      // Need to access sources from state or closure. 
      // Since `sources` might be stale in this callback if not updated, be careful.
      // However, sources usually doesn't change after init.
      
      if (nextIndex < sources.length) {
        console.log(`Switching to source ${nextIndex}: ${sources[nextIndex].label}`);
        // Defer the loadSource call to avoid state update conflicts or run effect immediately
        setTimeout(() => loadSource(sources[nextIndex]), 0);
        return nextIndex;
      } else {
        const errorMsg = 'Video không khả dụng ở tất cả các nguồn.';
        setError(errorMsg);
        setIsLoading(false);
        onError?.(errorMsg);
        return prevIndex;
      }
    });
  }, [sources, loadSource, onError]); // Sources dependency is important here

  // --- Controls Handlers ---
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
      // Show buffering indicator when seeking
      setIsBuffering(true);
      // Clear previous timeout
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
      // Hide buffering after 2 seconds (or when video is ready)
      bufferingTimeoutRef.current = setTimeout(() => {
        setIsBuffering(false);
      }, 2000);
    }
  };

  const skipForward = (seconds: number = 10) => {
    if (videoRef.current) {
      const newTime = Math.min(videoRef.current.currentTime + seconds, videoRef.current.duration);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsBuffering(true);
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
      bufferingTimeoutRef.current = setTimeout(() => {
        setIsBuffering(false);
      }, 2000);
    }
  };

  const skipBackward = (seconds: number = 10) => {
    if (videoRef.current) {
      const newTime = Math.max(videoRef.current.currentTime - seconds, 0);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      setIsBuffering(true);
      if (bufferingTimeoutRef.current) {
        clearTimeout(bufferingTimeoutRef.current);
      }
      bufferingTimeoutRef.current = setTimeout(() => {
        setIsBuffering(false);
      }, 2000);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setVolume(vol);
      setIsMuted(vol === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    const el: any = containerRef.current;
    const doc: any = document;

    (async () => {
      try {
        if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
          // Prefer standard API
          if (el.requestFullscreen) {
            await el.requestFullscreen();
          } else if (el.webkitRequestFullscreen) {
            // Safari / older WebKit
            el.webkitRequestFullscreen();
          } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
            // iOS Safari: request video fullscreen
            (videoRef.current as any).webkitEnterFullscreen();
          }
          setIsFullscreen(true);
        } else {
          if (doc.exitFullscreen) {
            await doc.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
          }
          setIsFullscreen(false);
        }
      } catch (err) {
        console.error('Fullscreen toggle error:', err);
      }
    })();
  };

  // Picture-in-Picture toggle
  const togglePiP = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  // Change playback speed
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSpeedMenu(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // --- Effects ---

  useEffect(() => {
    initializeVideo();
    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (bufferingTimeoutRef.current) clearTimeout(bufferingTimeoutRef.current);
    };
  }, [initializeVideo]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch(e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyJ':
          e.preventDefault();
          skipBackward(10);
          break;
        case 'KeyL':
          e.preventDefault();
          skipForward(10);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipBackward(5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipForward(5);
          break;
        case 'KeyF':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Handle auto-hide controls
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Format time helper
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- Render ---

  if (error) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-lg font-medium mb-4">{error}</p>
        <button 
          onClick={() => initializeVideo()}
          className="flex items-center space-x-2 bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  const currentSource = sources[currentSourceIndex];
  const isEmbed = currentSource?.type === 'embed';

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {isEmbed ? (
        <iframe
          src={currentSource.url}
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            crossOrigin="anonymous"
            onClick={togglePlay}
          />
          
          {/* Buffering/Loading Spinner */}
          {(isLoading || isBuffering) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 pointer-events-none z-20">
              <MovieLoader size="md" />
              {loadingMessage && (
                  <p className="absolute mt-40 text-white font-medium shadow-black drop-shadow-md">{loadingMessage}</p>
              )}
              {!loadingMessage && isLoading && (
                  <p className="absolute mt-40 text-white font-medium shadow-black drop-shadow-md">Đang tải...</p>
              )}
              {isBuffering && !loadingMessage && (
                  <p className="absolute mt-40 text-white font-medium shadow-black drop-shadow-md">Phim đang load chờ xíu má...</p>
              )}
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300 z-10 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Progress Bar */}
            <div className="w-full mb-4 flex items-center group/progress">
               <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button onClick={togglePlay} className="text-white hover:text-green-500 transition">
                  {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2 group/volume">
                  <button onClick={toggleMute} className="text-white hover:text-gray-300">
                    {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                  <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                    />
                  </div>
                </div>

                {/* Time Info */}
                <div className="text-gray-300 text-sm font-medium">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Skip Backward Button */}
                <button 
                  onClick={() => skipBackward(10)} 
                  className="flex items-center justify-center w-10 h-10 hover:opacity-80 transition" 
                  title="Back 10s (J)"
                >
                  <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1.5"/>
                    <path d="M 14 12 Q 10 16, 10 20 Q 10 26, 16 26" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <polygon points="14,10 10,12 14,15" fill="white"/>
                    <text x="20" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">10</text>
                  </svg>
                </button>

                {/* Skip Forward Button */}
                <button 
                  onClick={() => skipForward(10)} 
                  className="flex items-center justify-center w-10 h-10 hover:opacity-80 transition" 
                  title="Forward 10s (L)"
                >
                  <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="1.5"/>
                    <path d="M 26 12 Q 30 16, 30 20 Q 30 26, 24 26" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                    <polygon points="26,10 30,12 26,15" fill="white"/>
                    <text x="20" y="24" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">10</text>
                  </svg>
                </button>

                {/* Source Selection - simplified */}
                {sources.length > 1 && (
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <span className="hidden sm:inline">Nguồn:</span>
                        <select 
                            value={currentSourceIndex}
                            onChange={(e) => {
                                const newIndex = parseInt(e.target.value);
                                setCurrentSourceIndex(newIndex);
                                loadSource(sources[newIndex]);
                            }}
                            className="bg-black/50 border border-gray-600 rounded px-2 py-1 text-white cursor-pointer focus:outline-none focus:border-green-500"
                        >
                            {sources.map((src, idx) => (
                                <option key={idx} value={idx}>{src.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Playback Speed Selector */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="flex items-center space-x-1 text-white hover:text-green-500 transition px-2 py-1 rounded bg-black/30 hover:bg-black/50"
                  >
                    <Gauge className="w-4 h-4" />
                    <span className="text-xs font-medium">{playbackRate}x</span>
                  </button>
                  
                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[80px] z-50">
                      {PLAYBACK_SPEEDS.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => changePlaybackRate(speed)}
                          className={`w-full px-3 py-1.5 text-left text-sm transition ${
                            playbackRate === speed 
                              ? 'text-green-500 bg-green-500/10' 
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {speed === 1 ? 'Normal' : `${speed}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Picture-in-Picture */}
                {document.pictureInPictureEnabled && (
                  <button 
                    onClick={togglePiP}
                    className="text-white hover:text-green-500 transition"
                    title="Picture-in-Picture"
                  >
                    <PictureInPicture2 className="w-5 h-5" />
                  </button>
                )}
                
                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="text-white hover:text-green-500 transition">
                  {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}