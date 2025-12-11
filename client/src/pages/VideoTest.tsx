import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { nguoncService } from '../services/nguoncService';
import VideoPlayer from '../components/VideoPlayer';
import { ArrowLeft, Server, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function VideoTest() {
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'movies' | 'domains'>('movies');

  const { data: movies, isLoading } = useQuery({
    queryKey: ['nguonc-latest-test'],
    queryFn: () => nguoncService.getLatestMovies(1),
  });

  const { data: domainTest, isLoading: isDomainLoading, refetch: refetchDomains } = useQuery({
    queryKey: ['domain-test'],
    queryFn: async () => {
      const response = await axios.get('/api/proxy/test-domains');
      return response.data;
    },
    enabled: activeTab === 'domains',
  });

  const handleMovieSelect = async (movie: any) => {
    setSelectedMovie(movie);
    setSelectedEpisode(null);
    setError(null);
    
    // Fetch movie details
    try {
      const details = await nguoncService.getMovieBySlug(movie.slug);
      if (details.movie?.episodes?.[0]?.items?.[0]) {
        setSelectedEpisode(details.movie.episodes[0].items[0]);
      }
    } catch (err) {
      setError('Không thể tải thông tin phim');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Về trang chủ</span>
        </button>

        <h1 className="text-2xl font-bold mb-6">Video Streaming Test</h1>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('movies')}
            className={`px-4 py-2 rounded ${
              activeTab === 'movies' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Test Movies
          </button>
          <button
            onClick={() => setActiveTab('domains')}
            className={`px-4 py-2 rounded ${
              activeTab === 'domains' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Domain Status
          </button>
        </div>

        {activeTab === 'domains' && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Video Server Status</h2>
              <button
                onClick={() => refetchDomains()}
                disabled={isDomainLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded flex items-center space-x-2"
              >
                <Server className="w-4 h-4" />
                <span>{isDomainLoading ? 'Testing...' : 'Test Again'}</span>
              </button>
            </div>

            {domainTest && (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded">
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>Total: {domainTest.summary.total}</div>
                    <div className="text-green-400">Accessible: {domainTest.summary.accessible}</div>
                    <div className="text-red-400">Failed: {domainTest.summary.failed}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {domainTest.results.map((result: any, index: number) => (
                    <div key={index} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {result.status === 'accessible' ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                        <span className="font-mono">{result.domain}</span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {result.status === 'accessible' 
                          ? `Status: ${result.statusCode}` 
                          : `Error: ${result.error}`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'movies' && !selectedMovie ? (
          <div>
            <h2 className="text-xl mb-4">Chọn phim để test:</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movies?.items?.slice(0, 12).map((movie: any) => (
                <div
                  key={movie.slug}
                  onClick={() => handleMovieSelect(movie)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  <img
                    src={movie.thumb_url}
                    alt={movie.name}
                    className="w-full aspect-[2/3] object-cover rounded"
                  />
                  <p className="text-sm mt-2 line-clamp-2">{movie.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'movies' ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl">Testing: {selectedMovie.name}</h2>
              <button
                onClick={() => {
                  setSelectedMovie(null);
                  setSelectedEpisode(null);
                  setError(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Chọn phim khác
              </button>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 p-4 rounded mb-4">
                <p className="text-red-200">{error}</p>
              </div>
            )}

            {selectedEpisode ? (
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <VideoPlayer
                  episode={selectedEpisode}
                  onError={(err) => setError(err)}
                  onSuccess={() => setError(null)}
                />
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                  <p>Đang tải thông tin tập phim...</p>
                </div>
              </div>
            )}

            {selectedEpisode && (
              <div className="mt-4 p-4 bg-gray-900 rounded">
                <h3 className="font-semibold mb-2">Debug Info:</h3>
                <div className="text-sm space-y-1">
                  <p><strong>Embed URL:</strong> {selectedEpisode.embed || 'N/A'}</p>
                  <p><strong>M3U8 URL:</strong> {selectedEpisode.m3u8 || 'N/A'}</p>
                  <p><strong>Slug:</strong> {selectedEpisode.slug}</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}