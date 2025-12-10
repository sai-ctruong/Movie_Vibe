import { Router } from 'express';
import {
  getMovies,
  getMovieById,
  rateMovie,
  recordWatch,
} from '../controllers/movieController';
import { authenticate } from '../middleware/auth';
import { validateRequest, reviewSchema } from '../middleware/validation';

const router = Router();

router.get('/', getMovies);
router.get('/:id', getMovieById);
router.post('/:id/rate', authenticate, validateRequest(reviewSchema), rateMovie);
router.post('/:id/watch', authenticate, recordWatch);

export default router;
