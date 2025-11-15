import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validate uploaded files
 */
export function validateFiles(files: Express.Multer.File[]): void {
  if (!files || files.length === 0) {
    return; // No files is okay
  }

  if (files.length > 10) {
    throw new BadRequestException('Maximum 10 files allowed per upload');
  }

  files.forEach(file => {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException(
        `File ${file.originalname} exceeds maximum size of 10MB`,
      );
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new BadRequestException(`File ${file.originalname} is empty`);
    }
  });
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/\.\./g, '')
    .substring(0, 255);
}

/**
 * Get file extension
 */
export function getFileExtension(fileName: string): string {
  return path.extname(fileName).toLowerCase();
}

/**
 * Create directory if it doesn't exist
 */
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  if (!fs.existsSync(dirPath)) {
    await fs.promises.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Delete file from filesystem
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error(`Failed to delete file: ${filePath}`, error);
    // Don't throw error, just log it
  }
}

/**
 * Move file from temp location to final location
 */
export async function moveFile(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  try {
    await fs.promises.rename(sourcePath, destinationPath);
  } catch (error) {
    // If rename fails (different partitions), copy and delete
    await fs.promises.copyFile(sourcePath, destinationPath);
    await fs.promises.unlink(sourcePath);
  }
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
