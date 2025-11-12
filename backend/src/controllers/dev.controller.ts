/**
 * Development Controller
 * 
 * Provides endpoints for running development scripts (seeding, clearing data).
 * WARNING: These endpoints should only be available in development/test environments.
 */

import { NextFunction, Request, Response } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger.util';

const execAsync = promisify(exec);

export class DevController {
  /**
   * Seed test jobs (10 varied jobs for testing Smart Route)
   */
  async seedTestJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Running seed-test-jobs script...');
      
      const { stdout, stderr } = await execAsync('npm run seed-jobs:ts', {
        cwd: process.cwd(),
        env: process.env
      });
      
      logger.info('Seed jobs script output:', stdout);
      if (stderr) logger.warn('Seed jobs script stderr:', stderr);
      
      res.status(200).json({
        success: true,
        message: 'Test jobs seeded successfully',
        output: stdout
      });
    } catch (error: any) {
      logger.error('Error running seed-test-jobs script:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed test jobs',
        error: error.message
      });
    }
  }

  /**
   * Seed availability test jobs (2 jobs: 1 within availability, 1 outside)
   */
  async seedAvailabilityTestJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Running seed-availability-test-jobs script...');
      
      const { stdout, stderr } = await execAsync('npm run seed-availability-test-jobs', {
        cwd: process.cwd(),
        env: process.env
      });
      
      logger.info('Seed availability test jobs script output:', stdout);
      if (stderr) logger.warn('Seed availability test jobs script stderr:', stderr);
      
      res.status(200).json({
        success: true,
        message: 'Availability test jobs seeded successfully',
        output: stdout
      });
    } catch (error: any) {
      logger.error('Error running seed-availability-test-jobs script:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to seed availability test jobs',
        error: error.message
      });
    }
  }

  /**
   * Clear all jobs from the database
   */
  async clearJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('Running clear-jobs script...');
      
      const { stdout, stderr } = await execAsync('npm run clear-jobs', {
        cwd: process.cwd(),
        env: process.env
      });
      
      logger.info('Clear jobs script output:', stdout);
      if (stderr) logger.warn('Clear jobs script stderr:', stderr);
      
      res.status(200).json({
        success: true,
        message: 'All jobs cleared successfully',
        output: stdout
      });
    } catch (error: any) {
      logger.error('Error running clear-jobs script:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clear jobs',
        error: error.message
      });
    }
  }
}

export default new DevController();
