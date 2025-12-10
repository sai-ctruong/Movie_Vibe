import { Response } from 'express';
import { Movie } from '../models/Movie';
import { WatchHistory } from '../models/WatchHistory';
import { Review } from '../models/Review';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { cacheService } from '../services/cacheService';
import { analyzeSentiment, moderateContent } from '../utils/sentimentAnalysis';
import logger from '../utils/logger';

export const getMovies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const genre = req.query.genre as string;
    const sortBy = (req.query.sortBy as string) || 'recent';

    const skip = (page - 1) * limit;

    // Build query
    const query: any = { isActive: true };
    if (genre) {
      query.genre = genre;
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    if (sortBy === 'popular') {
      sort = { 'analytics.viewCount': -1 };
    } else if (sortBy === 'rating') {
      sort = { 'rating.average': -1 };
    }

    // Check cache
    const cacheKey = `movies:${JSON.stringify({ page, limit, genre, sortBy })}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }

    // Fetch from database
    const [movies, total] = await Promise.all([
      Movie.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Movie.countDocuments(query),
    ]);

    const response = {
      success: true,
      movies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    // Cache for 5 minutes
    await cacheService.set(cacheKey, response, 300);

    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch movies' });
  }
};

export const getMovieById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await Movie.findById(id);
    if (!movie || !movie.isActive) {
      throw new AppError('Movie not found', 404);
    }

    // Fetch similar movies
    const similarMovies = await Movie.find({
      _id: { $ne: id },
      genre: { $in: movie.genre },
      isActive: true,
    })
      .limit(6)
      .select('title thumbnail genre rating releaseYear')
      .lean();

    // Fetch reviews
    const reviews = await Review.find({ movieId: id, 'moderation.autoRejected': false })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      movie,
      similarMovies,
      reviews,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch movie' });
    }
  }
};

export const rateMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, text } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    // Check if movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    // Analyze sentiment and moderate content
    let sentiment: { score: number; label: 'positive' | 'negative' | 'neutral' } = { 
      score: 0, 
      label: 'neutral' 
    };
    let moderation: { 
      flagged: boolean; 
      autoRejected: boolean; 
      reason?: string 
    } = { 
      flagged: false, 
      autoRejected: false 
    };

    if (text && text.trim().length > 0) {
      sentiment = analyzeSentiment(text);
      const moderationResult = moderateContent(text);
      moderation = {
        flagged: moderationResult.flagged,
        autoRejected: moderationResult.flagged,
        reason: moderationResult.reason,
      };

      if (moderationResult.flagged) {
        logger.warn('Review flagged by moderation', { userId, movieId: id, reason: moderationResult.reason });
      }
    }

    // Create or update review
    const review = await Review.findOneAndUpdate(
      { userId, movieId: id },
      {
        rating,
        text,
        sentiment,
        moderation,
      },
      { upsert: true, new: true }
    );

    // Update movie rating (only count non-rejected reviews)
    const reviews = await Review.find({ movieId: id, 'moderation.autoRejected': false });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    movie.rating.average = avgRating;
    movie.rating.count = reviews.length;
    await movie.save();

    // Invalidate cache
    await cacheService.delPattern(`movies:*`);

    res.json({
      success: true,
      message: moderation.autoRejected 
        ? 'Review submitted but flagged for moderation' 
        : 'Review submitted successfully',
      review,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      logger.error('Failed to submit review', { error });
      res.status(500).json({ success: false, message: 'Failed to submit review' });
    }
  }
};

export const recordWatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { progress, timestamp } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const watchHistory = await WatchHistory.findOneAndUpdate(
      { userId, movieId: id },
      {
        progress,
        lastWatchedAt: new Date(),
        completed: progress >= 90,
        $inc: { watchTime: timestamp },
      },
      { upsert: true, new: true }
    );

    // Update movie analytics
    await Movie.findByIdAndUpdate(id, {
      $inc: { 'analytics.viewCount': 1 },
    });

    res.json({
      success: true,
      message: 'Watch progress saved',
      watchHistory,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to save watch progress' });
    }
  }
};
