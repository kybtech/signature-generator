/**
 * Browser-native image compression using Canvas API.
 * Much simpler and more reliable than WASM libraries.
 */

/**
 * Converts a data URI to ImageData for processing.
 * @param dataUri - The image data URI
 * @returns ImageData object
 */
export async function dataUriToImageData(dataUri: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    if (!dataUri || !dataUri.startsWith('data:image/')) {
      reject(new Error('Invalid data URI'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        resolve(imageData);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = dataUri;
  });
}

/**
 * Compresses an image data URI to reduce size using native browser APIs.
 * @param dataUri - The original image data URI
 * @param targetQuality - Target quality (0-100)
 * @returns Compressed image data URI
 */
export async function compressImage(dataUri: string, targetQuality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!dataUri || !dataUri.startsWith('data:image/')) {
      reject(new Error('Invalid data URI'));
      return;
    }

    // Load image
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Convert quality from 0-100 to 0-1 for canvas API
        const quality = targetQuality / 100;

        // Always output as JPEG for better compression
        // (PNG photos are much larger and don't benefit from transparency in signatures)
        const outputMimeType = 'image/jpeg';

        // Compress using canvas.toDataURL with quality parameter
        const compressed = canvas.toDataURL(outputMimeType, quality);

        resolve(compressed);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = dataUri;
  });
}
