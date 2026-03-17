import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fileToDataUri, validateImageFile, loadImageAsDataUri } from '@/utils/imageUtils';

describe('imageUtils', () => {
  describe('fileToDataUri', () => {
    it('should convert a File to a data URI', async () => {
      // Create a mock file with PNG content
      const fileContent = 'fake png content';
      const blob = new Blob([fileContent], { type: 'image/png' });
      const file = new File([blob], 'test.png', { type: 'image/png' });

      const dataUri = await fileToDataUri(file);

      expect(dataUri).toMatch(/^data:image\/png;base64,/);
      expect(dataUri.length).toBeGreaterThan('data:image/png;base64,'.length);
    });

    it('should handle JPEG images', async () => {
      const blob = new Blob(['fake jpeg'], { type: 'image/jpeg' });
      const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });

      const dataUri = await fileToDataUri(file);

      expect(dataUri).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should handle SVG images', async () => {
      const svgContent = '<svg><circle r="10"/></svg>';
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const file = new File([blob], 'test.svg', { type: 'image/svg+xml' });

      const dataUri = await fileToDataUri(file);

      expect(dataUri).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('should reject with error if FileReader fails', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' });

      // Mock FileReader to simulate error
      const originalFileReader = global.FileReader;
      global.FileReader = class {
        readAsDataURL() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Read failed'));
            }
          }, 0);
        }
      } as any;

      await expect(fileToDataUri(file)).rejects.toThrow();

      // Restore original FileReader
      global.FileReader = originalFileReader;
    });
  });

  describe('validateImageFile', () => {
    it('should accept PNG files', () => {
      const file = new File(['dummy'], 'test.png', { type: 'image/png' });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it('should accept JPEG files', () => {
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpeg' });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it('should accept JPG files', () => {
      const file = new File(['dummy'], 'test.jpg', { type: 'image/jpg' });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it('should accept SVG files', () => {
      const file = new File(['dummy'], 'test.svg', { type: 'image/svg+xml' });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it('should reject non-image files', () => {
      const file = new File(['dummy'], 'test.pdf', { type: 'application/pdf' });
      expect(() => validateImageFile(file)).toThrow('Invalid file type');
    });

    it('should reject files larger than 5MB', () => {
      // Create a 6MB file
      const largeContent = new Array(6 * 1024 * 1024).fill('x').join('');
      const file = new File([largeContent], 'large.png', { type: 'image/png' });
      expect(() => validateImageFile(file)).toThrow('File too large');
    });

    it('should accept files exactly at 5MB limit', () => {
      // Create a 5MB file
      const content = new Array(5 * 1024 * 1024).fill('x').join('');
      const file = new File([content], 'exact.png', { type: 'image/png' });
      expect(() => validateImageFile(file)).not.toThrow();
    });

    it('should reject empty files', () => {
      const file = new File([], 'empty.png', { type: 'image/png' });
      expect(() => validateImageFile(file)).toThrow('File is empty');
    });
  });

  describe('loadImageAsDataUri', () => {
    it('should validate and convert file to data URI', async () => {
      const blob = new Blob(['fake image'], { type: 'image/png' });
      const file = new File([blob], 'test.png', { type: 'image/png' });

      const dataUri = await loadImageAsDataUri(file);

      expect(dataUri).toMatch(/^data:image\/png;base64,/);
    });

    it('should throw error for invalid file', async () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });

      await expect(loadImageAsDataUri(file)).rejects.toThrow('Invalid file type');
    });

    it('should throw error for oversized file', async () => {
      const largeContent = new Array(6 * 1024 * 1024).fill('x').join('');
      const file = new File([largeContent], 'large.png', { type: 'image/png' });

      await expect(loadImageAsDataUri(file)).rejects.toThrow('File too large');
    });
  });
});
