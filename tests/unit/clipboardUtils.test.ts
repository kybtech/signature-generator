import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { copyToClipboard } from '@/utils/clipboardUtils';

describe('clipboardUtils', () => {
  describe('copyToClipboard', () => {
    let originalClipboard: Clipboard | undefined;

    beforeEach(() => {
      originalClipboard = navigator.clipboard;
    });

    afterEach(() => {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', {
          value: originalClipboard,
          writable: true,
        });
      }
    });

    it('should copy text to clipboard successfully', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const text = '<div>Test HTML</div>';
      await copyToClipboard(text);

      expect(mockWriteText).toHaveBeenCalledWith(text);
      expect(mockWriteText).toHaveBeenCalledTimes(1);
    });

    it('should handle empty string', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      await copyToClipboard('');

      expect(mockWriteText).toHaveBeenCalledWith('');
    });

    it('should handle clipboard API errors', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      await expect(copyToClipboard('test')).rejects.toThrow('Permission denied');
    });

    it('should throw error if clipboard API is not available', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });

      await expect(copyToClipboard('test')).rejects.toThrow('Clipboard API not available');
    });

    it('should handle large HTML content', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const largeHtml = '<div>' + 'x'.repeat(10000) + '</div>';
      await copyToClipboard(largeHtml);

      expect(mockWriteText).toHaveBeenCalledWith(largeHtml);
    });

    it('should preserve special characters and HTML tags', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });

      const html = '<div>&lt;script&gt;alert("test")&lt;/script&gt;</div>';
      await copyToClipboard(html);

      expect(mockWriteText).toHaveBeenCalledWith(html);
    });
  });
});
