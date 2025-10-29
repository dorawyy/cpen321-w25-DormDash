import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.util';

const IMAGES_DIR = path.join(__dirname, '../../uploads/images');

export class MediaService {
  static async saveImage(filePath: string, userId: string): Promise<string> {
    try {
      const fileExtension = path.extname(filePath);
      const fileName = `${userId}-${Date.now()}${fileExtension}`;
      const newPath = path.join(IMAGES_DIR, fileName);

      // Resolve and ensure paths are inside the designated images directory
      const resolvedNewPath = path.resolve(newPath);
      const resolvedImagesDir = path.resolve(IMAGES_DIR);
      if (!resolvedNewPath.startsWith(resolvedImagesDir + path.sep) && resolvedNewPath !== resolvedImagesDir) {
        throw new Error('Invalid destination path for image');
      }

      await fs.promises.rename(filePath, resolvedNewPath);

      return resolvedNewPath.split(path.sep).join('/');
    } catch (error) {
      try {
        // Attempt to remove the temp file if it exists (ensure safety)
        const resolvedFilePath = path.resolve(filePath);
        try {
          await fs.promises.stat(resolvedFilePath);
          // Only unlink if stat succeeded
          await fs.promises.unlink(resolvedFilePath);
        } catch (statErr: any) {
          // ENOENT is expected if the file does not exist; ignore other errors
          if (statErr.code && statErr.code !== 'ENOENT') {
            logger.warn('Failed to unlink temp file after failed save:', String(statErr));
          }
        }
      } catch (unlinkErr) {
        logger.warn('Failed to unlink temp file after failed save:', String(unlinkErr));
      }
      throw new Error(`Failed to save profile picture: ${error}`);
    }
  }

  static async deleteImage(url: string): Promise<void> {
    try {
      // Accept either a filename or a full path; build a safe absolute path
      const candidatePath = url.startsWith(path.sep) ? path.join(process.cwd(), url) : path.join(IMAGES_DIR, url);
      const resolved = path.resolve(candidatePath);
      const resolvedImagesDir = path.resolve(IMAGES_DIR);
      if (!resolved.startsWith(resolvedImagesDir + path.sep) && resolved !== resolvedImagesDir) {
        // don't delete files outside the images directory
        logger.warn(`Attempted to delete image outside images directory: ${resolved}`);
        return;
      }

      try {
        await fs.promises.unlink(resolved);
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
          logger.error('Failed to delete old profile picture:', String(err));
        }
      }
    } catch (error) {
      logger.error('Failed to delete old profile picture:', String(error));
    }
  }

  static async deleteAllUserImages(userId: string): Promise<void> {
    try {
      try {
        try {
          await fs.promises.access(IMAGES_DIR);
        } catch (accessErr) {
          // Images dir doesn't exist or isn't accessible
          return;
        }

        const files = await fs.promises.readdir(IMAGES_DIR);
        const userFiles = files.filter(file => file.startsWith(userId + '-'));

        await Promise.all(userFiles.map(file => this.deleteImage(file)));
      } catch (err: any) {
        logger.error('Failed to delete user images:', String(err));
      }
    } catch (error) {
      logger.error('Failed to delete user images:', String(error));
    }
  }
}