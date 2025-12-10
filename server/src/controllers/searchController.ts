import { Response } from 'express';
import { Movie } from '../models/Movie';
import { AuthRequest } from '../middleware/auth';

export const searchMovies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query, genres, year, rating, language, page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build search query
    const searchQuery: any = { isActive: true };

    // Text search
    if (query) {
      searchQuery.$text = { $search: query as string };
    }

    // Genre filter
    if (genres) {
      const genreArray = typeof genres === 'string' ? genres.split(',') : genres;
      searchQuery.genre = { $in: genreArray };
    }

    // Year filter
    if (year) {
      searchQuery.releaseYear = Number(year);
    }

    // Rating filter
    if (rating) {
      searchQuery['rating.average'] = { $gte: Number(rating) };
    }

    // Language filter
    if (language) {
      searchQuery.language = language;
    }

    const [movies, total] = await Promise.all([
      Movie.find(searchQuery)
        .select('title description genre releaseYear rating thumbnail cast director')
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Movie.countDocuments(searchQuery),
    ]);

    res.json({
      success: true,
      results: movies,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
};
