import { Router } from 'express';
import {
  getUserProfile,
  updateProfile,
  addToWatchlist,
  removeFromWatchlist,
  getWatchHistory,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/profile', authenticate, getUserProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/watchlist', authenticate, addToWatchlist);
router.delete('/watchlist/:movieId', authenticate, removeFromWatchlist);
router.get('/watch-history', authenticate, getWatchHistory);

export default router;
