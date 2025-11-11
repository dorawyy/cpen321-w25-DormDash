/**
 * Development Routes
 * 
 * WARNING: These routes should only be enabled in development/test environments.
 * They provide endpoints for running scripts to seed/clear test data.
 */

import { Router } from 'express';
import devController from '../controllers/dev.controller';

const router = Router();

/**
 * @route   POST /api/dev/seed-jobs
 * @desc    Seed 10 test jobs for Smart Route testing
 * @access  Public (dev only)
 */
router.post('/seed-jobs', devController.seedTestJobs);

/**
 * @route   POST /api/dev/seed-availability-jobs
 * @desc    Seed 2 availability test jobs (1 within, 1 outside availability)
 * @access  Public (dev only)
 */
router.post('/seed-availability-jobs', devController.seedAvailabilityTestJobs);

/**
 * @route   POST /api/dev/clear-jobs
 * @desc    Clear all jobs from the database
 * @access  Public (dev only)
 */
router.post('/clear-jobs', devController.clearJobs);

export default router;
