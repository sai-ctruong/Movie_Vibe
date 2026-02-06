import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { nguoncService } from '../services/nguoncService';
import { ArrowLeft, List, Loader2, ArrowRight, Home } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

export default function NguoncWatch() {
  const { slug, episode } = useParams<{ slug: string; episode: string }>();
  const navigate = useNavigate();
  
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['nguonc-movie', slug],
    queryFn: () => nguoncService.getMovieBySlug(slug!),
    enabled: !!slug,
  });

  const movie = data?.movie;
  // Handle NguonC structure: episodes[0].items
  const episodes = movie?.episodes?.[0]?.items || [];
  const servers = movie?.episodes || [];
  const currentEpisode = episodes.find(ep => ep.slug === episode);
  const currentEpisodeIndex = episodes.findIndex(ep => ep.slug === episode);

  // Handle fullscreen changes - iOS compatible
  useEffect(() => {
    const handleFullscreenChange = () => {
      // Check multiple fullscreen APIs for cross-browser compatibility
      const doc: any = document;
      const isNowFullscreen = !!(
        doc.fullscreenElement || 
        doc.webkitFullscreenElement || 
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );
      
      setIsFullscreen(isNowFullscreen);

      // For iOS/Safari - use CSS transform to rotate on mobile
      if (window.innerWidth < 768) {
        const videoContainer = document.querySelector('.video-player-container');
        if (videoContainer) {
          if (isNowFullscreen) {
            videoContainer.classList.add('fullscreen-landscape');
            // Lock to landscape if supported (Android)
            if ('orientation' in screen && 'lock' in screen.orientation) {
              try {
                (screen.orientation as any).lock('landscape').catch(() => {});
              } catch (e) {}
            }
          } else {
            videoContainer.classList.remove('fullscreen-landscape');
            // Unlock orientation
            if ('orientation' in screen && 'unlock' in screen.orientation) {
              try {
                (screen.orientation as any).unlock();
              } catch (e) {}
            }
          }
        }
      }
    };

    // Listen to all fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Also listen to webkit events for iOS
    const videoElement = document.querySelector('video');
    if (videoElement) {
      videoElement.addEventListener('webkitbeginfullscreen', () => {
        setIsFullscreen(true);
        const container = document.querySelector('.video-player-container');
        if (container && window.innerWidth < 768) {
          container.classList.add('fullscreen-landscape');
        }
      });
      videoElement.addEventListener('webkitendfullscreen', () => {
        setIsFullscreen(false);
        const container = document.querySelector('.video-player-container');
        if (container) {
          container.classList.remove('fullscreen-landscape');
        }
      });
    }
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const goToEpisode = (epSlug: string) => {
    navigate(`/nguonc/watch/${slug}/${epSlug}`);
    setShowEpisodes(false);
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

  if (isLoading || !movie || !currentEpisode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-400">Đang tải phim...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-black">
      {/* Top Bar with Breadcrumb - Only visible when NOT in fullscreen */}
      {!isFullscreen && (
        <div className="fixed top-0 left-0 right-0 bg-black z-50 border-b border-gray-700">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => navigate(`/nguonc/${slug}`)}
                className="flex items-center space-x-2 text-white hover:text-blue-500 transition"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm">Quay lại</span>
              </button>
              
              <button
                onClick={() => setShowEpisodes(!showEpisodes)}
                className="flex items-center space-x-1 text-white hover:text-blue-500 transition bg-gray-800 px-3 py-2 rounded-lg"
              >
                <List className="w-4 h-4" />
                <span className="text-sm">Tập phim</span>
              </button>
            </div>

            {/* Breadcrumb - Simple and Clear */}
            <div className="flex items-center space-x-2 text-sm">
              <Home className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400">/</span>
              <span className="text-white truncate max-w-[200px]">{movie.name}</span>
            </div>
          </div>
        </div>
      )}

      {/* Video Player with Safe Area */}
      <div className={`video-player-container w-full h-full ${!isFullscreen ? 'pt-28 pb-24 md:pt-24 md:pb-28' : ''}`}>
        <VideoPlayer 
          episode={currentEpisode}
          isFullscreen={isFullscreen}
          onSuccess={() => console.log('Video loaded')}
          onError={(e) => console.log('Video error', e)}
        />
      </div>

      {/* Navigation Controls - Only visible when NOT in fullscreen */}
      {!isFullscreen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-black/80 backdrop-blur rounded-lg px-6 py-3 z-20">
          <button
            onClick={goToPrevEpisode}
            disabled={currentEpisodeIndex === 0}
            className="text-white hover:text-blue-500 transition disabled:opacity-30 flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Tập trước</span>
          </button>

          <div className="text-white text-sm px-4 py-1 bg-blue-600 rounded">
            Tập {currentEpisode.name}
          </div>

          <button
            onClick={goToNextEpisode}
            disabled={currentEpisodeIndex === episodes.length - 1}
            className="text-white hover:text-blue-500 transition disabled:opacity-30 flex items-center space-x-1"
          >
            <span className="text-sm hidden sm:inline">Tập sau</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Episode Panel */}
      {showEpisodes && (
        <div className="absolute top-20 right-4 bottom-24 w-72 bg-black/95 rounded-lg overflow-hidden z-30 border border-gray-800">
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
                          ? 'bg-blue-600 text-white'
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
