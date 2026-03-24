import { describe, it, expect } from 'vitest';
import { optimizeSvgDataUri, minifySvg } from '@/utils/svgOptimization';

describe('svgOptimization', () => {
  describe('minifySvg', () => {
    it('should remove unnecessary whitespace from SVG', () => {
      const input = '<svg width="100" height="100">\n  <circle cx="50" cy="50" r="40" />\n</svg>';
      const result = minifySvg(input);
      expect(result.length).toBeLessThan(input.length);
      expect(result).toContain('<svg');
      expect(result).toContain('<circle');
    });

    it('should preserve SVG structure and attributes', () => {
      const input = '<svg width="100"><rect x="10" y="20" width="30" height="40"/></svg>';
      const result = minifySvg(input);
      expect(result).toContain('width');
      // SVGO may convert rect to path, so check for either
      expect(result.match(/rect|path/)).toBeTruthy();
    });
  });

  describe('optimizeSvgDataUri', () => {
    it('should convert base64 SVG data URI to optimized raw encoding', () => {
      // Base64 encoded simple SVG
      const base64DataUri =
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiLz48L3N2Zz4=';
      const result = optimizeSvgDataUri(base64DataUri);

      // Should not be base64
      expect(result).not.toContain('base64');
      // Should be raw SVG with proper encoding
      expect(result).toMatch(/^data:image\/svg\+xml,/);
      // Should be smaller than base64 version
      expect(result.length).toBeLessThan(base64DataUri.length);
    });

    it('should encode unsafe characters in SVG data URI', () => {
      // Use HTML entities instead of raw < > to avoid parser errors
      const svgWithUnsafe = '<svg><text>a &lt; b &gt; c # d</text></svg>';
      const dataUri = `data:image/svg+xml;utf8,${svgWithUnsafe}`;
      const result = optimizeSvgDataUri(dataUri);

      // Should encode # (hash)
      expect(result).toContain('%23');
    });

    it('should swap double quotes to single quotes in attributes', () => {
      const dataUri = 'data:image/svg+xml;utf8,<svg width="100" height="100"></svg>';
      const result = optimizeSvgDataUri(dataUri);

      expect(result).toContain("'100'");
      expect(result).not.toContain('"100"');
    });
  });
});
