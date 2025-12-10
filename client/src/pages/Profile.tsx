import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';
import { User as UserIcon, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { data: profileData, refetch } = useQuery({
    queryKey: ['userProfile'],
    queryFn: () => movieService.getUserProfile(),
  });

  const { data: watchHistoryData } = useQuery({
    queryKey: ['watchHistory'],
    queryFn: () => movieService.getWatchHistory(),
  });

  const handleRemoveFromWatchlist = async (movieId: string) => {
    try {
      await movieService.removeFromWatchlist(movieId);
      toast.success('Removed from watchlist');
      refetch();
    } catch (error) {
      toast.error('Failed to remove from watchlist');
    }
  };

  const user = profileData?.user;

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12 pb-12">
      {/* User Info */}
      <div className="flex items-center space-x-6 mb-12">
        <div className="w-24 h-24 bg-netflix-red rounded-full flex items-center justify-center">
          <UserIcon className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{user?.name}</h1>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* My List */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">My List</h2>
        {profileData?.watchlist && profileData.watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {profileData.watchlist.map((movie: any) => (
              <div key={movie._id} className="relative group">
                <MovieCard movie={movie} />
                <button
                  onClick={() => handleRemoveFromWatchlist(movie._id)}
                  className="absolute top-2 right-2 p-2 bg-black bg-opacity-75 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Your watchlist is empty.</p>
        )}
      </div>

      {/* Watch History */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Continue Watching</h2>
        {watchHistoryData?.history && watchHistoryData.history.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchHistoryData.history.map((item: any) => (
              <div key={item._id}>
                <MovieCard movie={item.movieId} />
                <div className="mt-2">
                  <div className="w-full h-1 bg-gray-700 rounded">
                    <div
                      className="h-full bg-netflix-red rounded"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{Math.round(item.progress)}% complete</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No watch history yet.</p>
        )}
      </div>
    </div>
  );
}
