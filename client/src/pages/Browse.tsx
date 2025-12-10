import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movieService } from '../services/movieService';
import MovieCard from '../components/movie/MovieCard';
import toast from 'react-hot-toast';

const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Documentary'];

export default function Browse() {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popular');

  const { data } = useQuery({
    queryKey: ['movies', 'browse', selectedGenre, sortBy],
    queryFn: () =>
      movieService.getMovies({
        genre: selectedGenre,
        sortBy,
        limit: 50,
      }),
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
      <h1 className="text-4xl font-bold text-white mb-8">Browse Movies</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-netflix-darkGray border border-netflix-gray text-white px-4 py-2 rounded focus:outline-none focus:border-white"
        >
          <option value="">All Genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-netflix-darkGray border border-netflix-gray text-white px-4 py-2 rounded focus:outline-none focus:border-white"
        >
          <option value="popular">Most Popular</option>
          <option value="recent">Recently Added</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {data?.movies?.map((movie: any) => (
          <MovieCard key={movie._id} movie={movie} onAddToWatchlist={() => handleAddToWatchlist(movie._id)} />
        ))}
      </div>

      {data?.movies?.length === 0 && (
        <div className="text-center text-gray-400 text-lg mt-12">
          No movies found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
}
