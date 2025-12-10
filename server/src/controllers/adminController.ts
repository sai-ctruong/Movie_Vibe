import { Response } from 'express';
import { Movie } from '../models/Movie';
import { User } from '../models/User';
import { WatchHistory } from '../models/WatchHistory';
import { Review } from '../models/Review';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config/env';

// File upload configuration
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const uploadPath = path.join(config.UPLOAD_PATH, file.fieldname === 'video' ? 'videos' : 'thumbnails');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: config.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'video') {
      const videoTypes = /mp4|avi|mkv|mov/;
      const extname = videoTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = videoTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('Only video files are allowed'));
    } else if (file.fieldname === 'thumbnail') {
      const imageTypes = /jpeg|jpg|png|webp/;
      const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = imageTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error('Only image files are allowed'));
    }
    cb(null, false);
  },
});

export const uploadMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files || !files.video || !files.thumbnail) {
      throw new AppError('Video and thumbnail files are required', 400);
    }

    const videoFile = files.video[0];
    const thumbnailFile = files.thumbnail[0];

    const movieData = {
      ...req.body,
      genre: JSON.parse(req.body.genre),
      cast: req.body.cast ? JSON.parse(req.body.cast) : [],
      video: {
        url: `/uploads/videos/${videoFile.filename}`,
        formats: [],
        duration: parseInt(req.body.duration) || 0,
      },
      thumbnail: `/uploads/thumbnails/${thumbnailFile.filename}`,
    };

    const movie = await Movie.create(movieData);

    res.status(201).json({
      success: true,
      message: 'Movie uploaded successfully',
      movie,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to upload movie' });
    }
  }
};

export const updateMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      movie,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update movie' });
    }
  }
};

export const deleteMovie = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const movie = await Movie.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!movie) {
      throw new AppError('Movie not found', 404);
    }

    res.json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to delete movie' });
    }
  }
};

export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, activeUsers, totalMovies, totalViews] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
      Movie.countDocuments({ isActive: true }),
      WatchHistory.countDocuments(),
    ]);

    const topMovies = await Movie.find({ isActive: true })
      .sort({ 'analytics.viewCount': -1 })
      .limit(10)
      .select('title analytics.viewCount rating')
      .lean();

    const recentReviews = await Review.find()
      .populate('userId', 'name')
      .populate('movieId', 'title')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        movies: {
          total: totalMovies,
          totalViews,
        },
        topMovies,
        recentReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};
