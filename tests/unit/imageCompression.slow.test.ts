import { describe, it, expect } from 'vitest';
import { compressImage, dataUriToImageData } from '@/utils/imageCompression';

describe('imageCompression', () => {
  // Helper to create a simple test image data URI
  const createTestImageDataUri = (type: 'jpeg' | 'png'): string => {
    // Create a 10x10 red square
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, 10, 10);
    return canvas.toDataURL(`image/${type}`);
  };

  describe('dataUriToImageData', () => {
    it('should convert JPEG data URI to ImageData', async () => {
      const dataUri = createTestImageDataUri('jpeg');
      const imageData = await dataUriToImageData(dataUri);

      expect(imageData).toBeInstanceOf(ImageData);
      expect(imageData.width).toBeGreaterThan(0);
      expect(imageData.height).toBeGreaterThan(0);
    });

    it('should convert PNG data URI to ImageData', async () => {
      const dataUri = createTestImageDataUri('png');
      const imageData = await dataUriToImageData(dataUri);

      expect(imageData).toBeInstanceOf(ImageData);
      expect(imageData.width).toBeGreaterThan(0);
    });

    it('should reject invalid data URI', async () => {
      await expect(dataUriToImageData('invalid')).rejects.toThrow();
    });
  });

  describe('compressImage', () => {
    it('should compress JPEG image and reduce size', async () => {
      const originalDataUri = createTestImageDataUri('jpeg');
      const originalSize = originalDataUri.length;

      const compressed = await compressImage(originalDataUri, 50);

      expect(compressed).toMatch(/^data:image\/jpeg/);
      expect(compressed.length).toBeLessThanOrEqual(originalSize);
    });

    it('should handle quality parameter correctly', async () => {
      const dataUri = createTestImageDataUri('jpeg');

      const highQuality = await compressImage(dataUri, 90);
      const lowQuality = await compressImage(dataUri, 30);

      // Lower quality should produce smaller output
      expect(lowQuality.length).toBeLessThanOrEqual(highQuality.length);
    });

    it('should maintain image type', async () => {
      const jpegUri = createTestImageDataUri('jpeg');
      const pngUri = createTestImageDataUri('png');

      const compressedJpeg = await compressImage(jpegUri, 70);
      const compressedPng = await compressImage(pngUri, 70);

      expect(compressedJpeg).toMatch(/^data:image\/jpeg/);
      expect(compressedPng).toMatch(/^data:image\/png/);
    });
  });
});
