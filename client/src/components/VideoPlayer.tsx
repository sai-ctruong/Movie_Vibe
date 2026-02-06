import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  RefreshCw, 
  AlertCircle
} from 'lucide-react';
import { videoService, VideoSource } from '../services/videoService';
import MovieLoader from './MovieLoader';

interface VideoPlayerProps {
  episode: any;
  isFullscreen?: boolean;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

export default function VideoPlayer({ episode, isFullscreen = false, onError, onSuccess }: VideoPlayerProps) {
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
  const [internalFullscreen, setInternalFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const bufferingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Double tap detection for mobile
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const [showSkipAnimation, setShowSkipAnimation] = useState<{ direction: 'left' | 'right'; x: number } | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile((e as any).matches);
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

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
          // Don't set state here - let the event listener handle it
        } else {
          if (doc.exitFullscreen) {
            await doc.exitFullscreen();
          } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
          }
          // Don't set state here - let the event listener handle it
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

  // Handle double tap to skip on mobile
  const handleVideoTap = (e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>) => {
    if (!isMobile || isEmbed) return;
    
    const now = Date.now();
    const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX;
    
    if (!clientX) return;
    
    const videoWidth = videoRef.current?.offsetWidth || window.innerWidth;
    const tapX = clientX;
    
    // Check if this is a double tap (within 300ms)
    if (lastTapRef.current && now - lastTapRef.current.time < 300) {
      // Determine if tap is on left or right side
      const isLeftSide = tapX < videoWidth / 2;
      
      if (isLeftSide) {
        skipBackward(10);
        setShowSkipAnimation({ direction: 'left', x: tapX });
      } else {
        skipForward(10);
        setShowSkipAnimation({ direction: 'right', x: tapX });
      }
      
      // Hide animation after 500ms
      setTimeout(() => setShowSkipAnimation(null), 500);
      
      // Reset last tap
      lastTapRef.current = null;
    } else {
      // Store this tap
      lastTapRef.current = { time: now, x: tapX };
    }
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

  // Handle auto-hide controls and fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Check all fullscreen APIs for cross-browser compatibility
      const doc: any = document;
      const isNowFullscreen = !!(
        doc.fullscreenElement || 
        doc.webkitFullscreenElement || 
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      
      console.log('Fullscreen changed:', isNowFullscreen); // Debug log
      setInternalFullscreen(isNowFullscreen);

      // Pause video when exiting fullscreen on mobile
      if (!isNowFullscreen && window.innerWidth < 768 && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }

      // Auto rotate to landscape on mobile when entering fullscreen
      if (isNowFullscreen && window.innerWidth < 768) {
        if ('orientation' in screen && 'lock' in screen.orientation) {
          try {
            (screen.orientation as any).lock('landscape').catch(() => {});
          } catch (e) {}
        }
      }

      // Unlock orientation when exiting fullscreen
      if (!isNowFullscreen) {
        if ('orientation' in screen && 'unlock' in screen.orientation) {
          try {
            (screen.orientation as any).unlock();
          } catch (e) {}
        }
      }
    };

    // Add listeners immediately
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Check initial state
    handleFullscreenChange();
    
    // iOS Safari specific events for native video fullscreen
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleWebkitBeginFullscreen = () => {
        setInternalFullscreen(true);
      };
      
      const handleWebkitEndFullscreen = () => {
        setInternalFullscreen(false);
        // Pause video when exiting fullscreen on iOS
        if (window.innerWidth < 768 && videoElement) {
          videoElement.pause();
          setIsPlaying(false);
        }
      };
      
      videoElement.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
      videoElement.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen);
      
      return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        videoElement.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen);
        videoElement.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen);
      };
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Sync internal state with parent prop
  useEffect(() => {
    if (isFullscreen !== internalFullscreen) {
      setInternalFullscreen(isFullscreen);
    }
  }, [isFullscreen]);

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
            className={isMobile ? "w-full aspect-video object-cover" : "w-full h-full object-contain"}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            playsInline
            crossOrigin="anonymous"
            onClick={isMobile ? handleVideoTap : togglePlay}
            onTouchEnd={isMobile ? handleVideoTap : undefined}
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

          {/* Double Tap Skip Animation */}
          {showSkipAnimation && isMobile && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              style={{ 
                left: showSkipAnimation.direction === 'left' ? '0' : '50%',
                right: showSkipAnimation.direction === 'right' ? '0' : '50%'
              }}
            >
              <div className="animate-ping">
                <span className="material-icons text-white text-[64px] opacity-80">
                  {showSkipAnimation.direction === 'left' ? 'replay_10' : 'forward_10'}
                </span>
              </div>
            </div>
          )}

          {/* Custom Controls Overlay */}
          <div 
            className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 ${isMobile ? 'bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 z-30' : 'bg-gradient-to-t from-black/90 to-transparent p-4 z-10'} ${showControls ? 'opacity-100' : 'opacity-0'}`}
            style={isMobile ? { paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)' } : undefined}
          >
            {/* Progress Bar */}
            <div className={`${isMobile ? 'w-full mb-2' : 'w-full mb-4'} flex items-center group/progress`}>
               <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className={isMobile ? "w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full transition-all" : "w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"}
              />
            </div>

            <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-between'}`}>
              {isMobile ? (
                // Mobile: Simplified controls
                <>
                  <div className="flex items-center space-x-2">
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className="text-white hover:text-green-500 transition active:scale-95 flex items-center">
                      <span className="material-icons text-[40px]">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>

                    {/* Mute */}
                    <button onClick={toggleMute} className="text-white hover:text-gray-300 transition active:scale-95 flex items-center">
                      <span className="material-icons text-[28px]">
                        {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                      </span>
                    </button>

                    {/* Time Info */}
                    <div className="text-gray-300 text-xs font-medium ml-1 flex items-center">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Skip Backward Button */}
                    <button 
                      onClick={() => skipBackward(10)} 
                      className="text-white hover:text-green-500 active:scale-95 transition flex items-center"
                      title="Tua lùi 10s"
                    >
                      <span className="material-icons text-[28px]">replay_10</span>
                    </button>

                    {/* Skip Forward Button */}
                    <button 
                      onClick={() => skipForward(10)} 
                      className="text-white hover:text-green-500 active:scale-95 transition flex items-center"
                      title="Tua tới 10s"
                    >
                      <span className="material-icons text-[28px]">forward_10</span>
                    </button>

                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="text-white hover:text-green-500 transition active:scale-95 flex items-center">
                      <span className="material-icons text-[28px]">
                        {internalFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                      </span>
                    </button>
                  </div>
                </>
              ) : (
                // Desktop: Full controls
                <>
                  <div className="flex items-center space-x-4">
                    {/* Play/Pause */}
                    <button onClick={togglePlay} className="text-white hover:text-green-500 transition flex items-center">
                      <span className="material-icons text-[32px]">
                        {isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>

                    {/* Volume */}
                    <div className="flex items-center space-x-2 group/volume">
                      <button onClick={toggleMute} className="text-white hover:text-gray-300 flex items-center">
                        <span className="material-icons text-[24px]">
                          {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                        </span>
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
                    <div className="text-gray-300 text-sm font-medium flex items-center">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Skip Backward Button */}
                    <button 
                      onClick={() => skipBackward(10)} 
                      className="text-white hover:text-green-500 transition flex items-center" 
                      title="Back 10s (J)"
                    >
                      <span className="material-icons text-[28px]">replay_10</span>
                    </button>

                    {/* Skip Forward Button */}
                    <button 
                      onClick={() => skipForward(10)} 
                      className="text-white hover:text-green-500 transition flex items-center" 
                      title="Forward 10s (L)"
                    >
                      <span className="material-icons text-[28px]">forward_10</span>
                    </button>

                    {/* Playback Speed Selector */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="flex items-center space-x-1 text-white hover:text-green-500 transition px-2 py-1 rounded bg-black/30 hover:bg-black/50"
                      >
                        <span className="material-icons text-[16px]">speed</span>
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
                        className="text-white hover:text-green-500 transition flex items-center"
                        title="Picture-in-Picture"
                      >
                        <span className="material-icons text-[20px]">picture_in_picture_alt</span>
                      </button>
                    )}
                    
                    {/* Fullscreen */}
                    <button onClick={toggleFullscreen} className="text-white hover:text-green-500 transition flex items-center">
                      <span className="material-icons text-[24px]">
                        {internalFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                      </span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}