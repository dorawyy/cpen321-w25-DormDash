import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { UpdateProfileRequest, updateProfileSchema } from '../types/user.types';
import { validateBody } from '../middleware/validation.middleware';

const router = Router();
const userController = new UserController();

router.get('/profile', (req, res) => userController.getProfile(req, res));

router.post(
  '/profile',
  validateBody<UpdateProfileRequest>(updateProfileSchema),
  async (req, res, next) => await userController.updateProfile(req, res, next)
);

router.delete('/profile', async (req, res, next) => await userController.deleteProfile(req, res, next));

router.post('/cash-out', async (req, res, next) => await userController.cashOut(req, res, next));

export default router;