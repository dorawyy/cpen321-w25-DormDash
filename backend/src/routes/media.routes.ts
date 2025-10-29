import { Router } from 'express';

import { upload } from '../config/storage';
import { authenticateToken } from '../middleware/auth.middleware';
import { MediaController } from '../controllers/media.controller';

const router = Router();
const mediaController = new MediaController();

router.post(
  '/upload',
  authenticateToken,
  upload.single('media'),
  async (req, res, next) => {await mediaController.uploadImage(req, res, next)}
);

export default router;