import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { nguoncService } from '../services/nguoncService';
import { ArrowLeft, List, Loader2, ArrowRight } from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';

export default function NguoncWatch() {
  const { slug, episode } = useParams<{ slug: string; episode: string }>();
  const navigate = useNavigate();
  
  const [showEpisodes, setShowEpisodes] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['nguonc-movie', slug],
    queryFn: () => nguoncService.getMovieBySlug(slug!),
    enabled: !!slug,
  });

  const movie = data?.movie;
  // Handle NguonC structure: episodes[0].items
  const episodes = movie?.episodes?.[0]?.items || [];
  const currentEpisode = episodes.find(ep => ep.slug === episode);
  const currentEpisodeIndex = episodes.findIndex(ep => ep.slug === episode);

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
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent z-20 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => navigate(`/nguonc/${slug}`)}
            className="flex items-center space-x-2 text-white hover:text-blue-500 transition"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="text-white text-center flex-1 mx-4">
            <h3 className="font-semibold text-base line-clamp-1">{movie.name}</h3>
            <p className="text-gray-400 text-sm">
              Tập {currentEpisode.name} • NguonC
            </p>
          </div>
          
          <button
            onClick={() => setShowEpisodes(!showEpisodes)}
            className="flex items-center space-x-1 text-white hover:text-blue-500 transition bg-gray-800/80 px-3 py-2 rounded-lg"
          >
            <List className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Tập phim</span>
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div className="w-full h-full pt-16">
        <VideoPlayer 
          episode={currentEpisode}
          onSuccess={() => console.log('Video loaded')}
          onError={(e) => console.log('Video error', e)}
        />
      </div>

      {/* Navigation Controls */}
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

      {/* Episode Panel */}
      {showEpisodes && (
        <div className="absolute top-20 right-4 bottom-24 w-72 bg-black/95 rounded-lg overflow-hidden z-30 border border-gray-800">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-white font-semibold">Danh sách tập</h3>
            <p className="text-gray-500 text-xs">{episodes.length} tập</p>
          </div>
          <div className="overflow-y-auto h-[calc(100%-60px)] p-3">
             <div className="grid grid-cols-4 gap-2">
                {episodes.map((ep) => (
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
        </div>
      )}
    </div>
  );
}
