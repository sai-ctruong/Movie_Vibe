import { Response } from 'express';
import { User } from '../models/User';
import { Watchlist } from '../models/Watchlist';
import { WatchHistory } from '../models/WatchHistory';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const [watchlist, watchHistory] = await Promise.all([
      Watchlist.find({ userId }).populate('movieId', 'title thumbnail genre rating').lean(),
      WatchHistory.find({ userId })
        .populate('movieId', 'title thumbnail genre rating')
        .sort({ lastWatchedAt: -1 })
        .limit(20)
        .lean(),
    ]);

    res.json({
      success: true,
      user,
      watchlist: watchlist.map((w) => w.movieId),
      watchHistory,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { name, avatar, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(avatar && { avatar }),
        ...(preferences && { preferences }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
  }
};

export const addToWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { movieId } = req.body;

    if (!userId) {
      throw new AppError('Unauthorized', 401);
    }

    const watchlistItem = await Watchlist.findOneAndUpdate(
      { userId, movieId },
      { userId, movieId },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Added to watchlist',
      watchlistItem,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add to watchlist' });
    }
  }
};

export const removeFromWatchlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { movieId } = req.params;

    await Watchlist.findOneAndDelete({ userId, movieId });

    res.json({
      success: true,
      message: 'Removed from watchlist',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to remove from watchlist' });
  }
};

export const getWatchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      WatchHistory.find({ userId })
        .populate('movieId', 'title thumbnail genre rating duration')
        .sort({ lastWatchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      WatchHistory.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      history,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch watch history' });
  }
};
