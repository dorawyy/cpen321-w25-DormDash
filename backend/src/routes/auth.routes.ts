import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { AuthenticateUserRequest, authenticateUserSchema } from '../types/auth.types';
import { SelectRoleRequest, selectRoleSchema } from '../types/user.types';
import { validateBody } from '../middleware/validation.middleware';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

router.post(
  '/signup',
  validateBody<AuthenticateUserRequest>(authenticateUserSchema),
  async (req, res, next) => {await authController.signUp(req, res, next)}
);

router.post(
  '/signin',
  validateBody(authenticateUserSchema),
  async (req, res, next) => {await authController.signIn(req, res, next)}
);

router.post(
  '/select-role',
  authenticateToken,  // Require authentication
  validateBody<SelectRoleRequest>(selectRoleSchema),
  async (req, res, next) => {await authController.selectRole(req, res, next)}
);

export default router;