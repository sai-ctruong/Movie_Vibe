import { Router } from 'express';
import {
  uploadMovie,
  updateMovie,
  deleteMovie,
  getAnalytics,
  upload,
} from '../controllers/adminController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorizeAdmin);

router.post('/movies', upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
]), uploadMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);
router.get('/analytics', getAnalytics);

export default router;
