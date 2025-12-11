import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import { Play, Plus, Star, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import MovieRow from '../components/movie/MovieRow';

export default function MovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovieById(id!),
    enabled: !!id,
  });

  const handleAddToWatchlist = async () => {
    try {
      if (id) {
        await movieService.addToWatchlist(id);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="spinner" /></div>;
  }

  const movie = data?.movie;

  if (!movie) {
    return <div className="text-white text-center mt-20">Movie not found</div>;
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Movie Hero */}
      <div className="relative h-[70vh]">
        <div className="absolute inset-0">
          <img
            src={`http://localhost:5001${movie.thumbnail}`}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080?text=No+Image';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-transparent to-transparent" />
        </div>

        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-3 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition z-10"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="relative h-full flex items-end px-4 md:px-12 pb-12">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold text-white mb-4">{movie.title}</h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-white text-lg">{movie.rating.average.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">({movie.rating.count} reviews)</span>
              </div>
              <span className="text-white">{movie.releaseYear}</span>
              <span className="text-white">{Math.floor(movie.duration / 60)}h {movie.duration % 60}m</span>
            </div>

            <div className="flex items-center flex-wrap gap-2 mb-6">
              {movie.genre.map((g: string) => (
                <span key={g} className="px-3 py-1 bg-netflix-gray rounded-full text-white text-sm">
                  {g}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/watch/${movie._id}`)}
                className="bg-white text-black px-8 py-3 rounded flex items-center space-x-2 hover:bg-opacity-80 transition font-semibold"
              >
                <Play className="w-6 h-6 fill-current" />
                <span>Play</span>
              </button>

              <button
                onClick={handleAddToWatchlist}
                className="bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded flex items-center space-x-2 hover:bg-opacity-50 transition font-semibold"
              >
                <Plus className="w-6 h-6" />
                <span>My List</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="px-4 md:px-12 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-8">{movie.description}</p>

            {/* Reviews */}
            {data?.reviews && data.reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Reviews</h2>
                <div className="space-y-4">
                  {data.reviews.map((review: any) => (
                    <div key={review._id} className="bg-netflix-darkGray p-4 rounded">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-netflix-red rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {review.userId.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-semibold">{review.userId.name}</p>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.text && <p className="text-gray-300">{review.text}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Cast</h3>
            <ul className="text-gray-300 space-y-2">
              {movie.cast.map((actor: string, index: number) => (
                <li key={index}>{actor}</li>
              ))}
            </ul>

            {movie.director && (
              <>
                <h3 className="text-xl font-bold text-white mt-6 mb-4">Director</h3>
                <p className="text-gray-300">{movie.director}</p>
              </>
            )}

            <h3 className="text-xl font-bold text-white mt-6 mb-4">Language</h3>
            <p className="text-gray-300 capitalize">{movie.language}</p>
          </div>
        </div>

        {/* Similar Movies */}
        {data?.similarMovies && data.similarMovies.length > 0 && (
          <div className="mt-12">
            <MovieRow title="More Like This" movies={data.similarMovies} />
          </div>
        )}
      </div>
    </div>
  );
}
