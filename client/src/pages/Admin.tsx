import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Upload, Film, Users, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'upload' | 'analytics'>('upload');
  const [uploading, setUploading] = useState(false);

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics');
      return response.data.analytics;
    },
  });

  const handleUploadMovie = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    setUploading(true);
    try {
      await api.post('/admin/movies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Movie uploaded successfully!');
      e.currentTarget.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12 pb-12">
      <h1 className="text-4xl font-bold text-white mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 border-b border-netflix-gray">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'upload'
              ? 'text-white border-b-2 border-netflix-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Upload Movie
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 font-semibold transition ${
            activeTab === 'analytics'
              ? 'text-white border-b-2 border-netflix-red'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Upload Form */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl">
          <form onSubmit={handleUploadMovie} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">Title *</label>
              <input
                type="text"
                name="title"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                required
                rows={4}
                className="input-field resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">Release Year *</label>
                <input
                  type="number"
                  name="releaseYear"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  name="duration"
                  required
                  min="1"
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Genre (JSON array) *</label>
              <input
                type="text"
                name="genre"
                placeholder='["Action", "Thriller"]'
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Director</label>
              <input
                type="text"
                name="director"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Video File *</label>
              <input
                type="file"
                name="video"
                accept="video/*"
                required
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Thumbnail Image *</label>
              <input
                type="file"
                name="thumbnail"
                accept="image/*"
                required
                className="input-field"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>{uploading ? 'Uploading...' : 'Upload Movie'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-netflix-darkGray p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-semibold">Total Users</h3>
                <Users className="w-8 h-8 text-netflix-red" />
              </div>
              <p className="text-4xl font-bold text-white">{analytics.users.total}</p>
              <p className="text-green-400 text-sm mt-2">{analytics.users.active} active</p>
            </div>

            <div className="bg-netflix-darkGray p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-semibold">Total Movies</h3>
                <Film className="w-8 h-8 text-netflix-red" />
              </div>
              <p className="text-4xl font-bold text-white">{analytics.movies.total}</p>
              <p className="text-gray-400 text-sm mt-2">{analytics.movies.totalViews} total views</p>
            </div>

            <div className="bg-netflix-darkGray p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-400 font-semibold">Trending</h3>
                <TrendingUp className="w-8 h-8 text-netflix-red" />
              </div>
              <p className="text-4xl font-bold text-white">{analytics.topMovies.length}</p>
              <p className="text-gray-400 text-sm mt-2">top movies</p>
            </div>
          </div>

          {/* Top Movies */}
          <div className="bg-netflix-darkGray p-6 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4">Top Movies</h3>
            <div className="space-y-3">
              {analytics.topMovies.map((movie: any, index: number) => (
                <div key={movie._id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl font-bold text-gray-500">{index + 1}</span>
                    <div>
                      <p className="text-white font-semibold">{movie.title}</p>
                      <p className="text-gray-400 text-sm">
                        {movie.analytics.viewCount} views • ★ {movie.rating.average.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
