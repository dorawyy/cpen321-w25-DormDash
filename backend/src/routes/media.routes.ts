import { Router, RequestHandler } from 'express';

import { upload } from '../config/storage';
import { authenticateToken } from '../middleware/auth.middleware';
import { MediaController } from '../controllers/media.controller';

const router = Router();
const mediaController = new MediaController();

// Explicitly type the multer middleware
const uploadMiddleware: RequestHandler = upload.single('media');

router.post(
  '/upload',
  authenticateToken,
  uploadMiddleware,
  (req, res, next) => {
    mediaController.uploadImage(req, res, next).catch((err: unknown) => {
      next(err);
    });
  }
);

export default router;
