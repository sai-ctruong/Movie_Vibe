import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';
import toast from 'react-hot-toast';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data } = useQuery({
    queryKey: ['search', query],
    queryFn: () => movieService.searchMovies({ query }),
    enabled: !!query,
  });

  const handleAddToWatchlist = async (movieId: string) => {
    try {
      await movieService.addToWatchlist(movieId);
      toast.success('Added to watchlist');
    } catch (error) {
      toast.error('Failed to add to watchlist');
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 md:px-12 pb-12">
      <h1 className="text-3xl font-bold text-white mb-2">
        Search Results for "{query}"
      </h1>
      
      {data && (
        <p className="text-gray-400 mb-8">
          {data.total} {data.total === 1 ? 'result' : 'results'} found
        </p>
      )}

      {data?.results && data.results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {data.results.map((movie: any) => (
            <MovieCard
              key={movie._id}
              movie={movie}
              onAddToWatchlist={() => handleAddToWatchlist(movie._id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-400 text-lg mt-12">
          No movies found matching your search.
        </div>
      )}
    </div>
  );
}
