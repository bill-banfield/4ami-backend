import { memoryStorage } from 'multer';
import { BadRequestException } from '@nestjs/common';

// Allowed MIME types
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
];

// Max file size: 10MB
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Max files per upload
export const MAX_FILES_COUNT = 10;

// File filter to validate MIME types
export const fileFilter = (req: any, file: Express.Multer.File, callback: any) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        `File type not allowed. Allowed types: PDF, Images (PNG, JPG), Excel (XLS, XLSX), Word (DOC, DOCX), Text, CSV`,
      ),
      false,
    );
  }
};

// Multer options - using memory storage to avoid permission issues
// Files will be written to disk manually in the service layer
export const multerOptions = {
  storage: memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES_COUNT,
  },
};
