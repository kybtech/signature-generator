/**
 * Image utility functions for converting files to data URIs
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

/**
 * Validates an image file for type and size constraints
 *
 * @param file - The file to validate
 * @throws Error if file is invalid
 */
export function validateImageFile(file: File): void {
  if (!file) {
    throw new Error('File is required');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Allowed types: PNG, JPEG, SVG`);
  }

  if (file.size === 0) {
    throw new Error('File is empty');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size: 5MB`);
  }
}

/**
 * Converts a File object to a data URI string
 *
 * @param file - The file to convert
 * @returns Promise that resolves to a data URI string
 */
export function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('FileReader error'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates and converts an image file to a data URI
 *
 * @param file - The image file to process
 * @returns Promise that resolves to a data URI string
 * @throws Error if file is invalid
 */
export async function loadImageAsDataUri(file: File): Promise<string> {
  validateImageFile(file);
  return fileToDataUri(file);
}
