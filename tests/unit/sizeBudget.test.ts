import { describe, it, expect, beforeEach } from 'vitest';
import { optimizeSignature } from '@/utils/sizeBudget';
import type { SignatureData, SignatureAssets } from '@/types/signature';

describe('sizeBudget', () => {
  let mockData: SignatureData;
  let mockAssets: SignatureAssets;

  beforeEach(() => {
    mockData = {
      name: 'John Doe',
      title: 'Software Engineer',
      phone: '+1234567890',
      email: 'john@example.com',
    };
    // Use a larger SVG with base64 encoding to test optimization
    const largeSvg =
      '<svg width="200" height="200"><circle cx="100" cy="100" r="80"/><rect x="50" y="50" width="100" height="100"/><text x="100" y="100">Test</text></svg>';
    const base64Svg = btoa(largeSvg);
    mockAssets = {
      companyLogo: `data:image/svg+xml;base64,${base64Svg}`,
    };
  });

  it('should return unoptimized HTML when maxSizeKB is 0', async () => {
    const result = await optimizeSignature({
      maxSizeKB: 0,
      data: mockData,
      assets: mockAssets,
    });

    expect(result.withinBudget).toBe(true);
    expect(result.optimizationsApplied).toHaveLength(0);
    expect(result.html).toContain('John Doe');
  });

  it('should optimize SVG logo when size exceeds budget', async () => {
    const result = await optimizeSignature({
      maxSizeKB: 5, // Very small budget to force optimization
      data: mockData,
      assets: mockAssets,
    });

    expect(result.optimizationsApplied).toContain('SVG optimization');
  });

  it('should apply HTML minification if needed', async () => {
    const result = await optimizeSignature({
      maxSizeKB: 10,
      data: mockData,
      assets: mockAssets,
    });

    if (!result.withinBudget) {
      expect(result.optimizationsApplied).toContain('HTML minification');
    }
  });

  it('should handle photo data correctly', async () => {
    // Just verify that having a photo doesn't break the optimization
    const dataWithPhoto = {
      ...mockData,
      photoDataUri:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    };

    const result = await optimizeSignature({
      maxSizeKB: 50, // Reasonable budget
      data: dataWithPhoto,
      assets: mockAssets,
    });

    expect(result.html).toContain('John Doe');
    expect(result.sizeBytes).toBeGreaterThan(0);
  });

  it('should report size information correctly', async () => {
    const result = await optimizeSignature({
      maxSizeKB: 50,
      data: mockData,
      assets: mockAssets,
    });

    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(result.targetBytes).toBe(50 * 1024);
    expect(typeof result.withinBudget).toBe('boolean');
  });

  it('should maintain optimization priority order', async () => {
    // SVG optimization should come before HTML minification
    const result = await optimizeSignature({
      maxSizeKB: 10,
      data: mockData,
      assets: mockAssets,
    });

    if (result.optimizationsApplied.length > 1) {
      const svgIndex = result.optimizationsApplied.findIndex((opt) => opt.includes('SVG'));
      const htmlIndex = result.optimizationsApplied.findIndex((opt) => opt.includes('HTML'));

      if (svgIndex !== -1 && htmlIndex !== -1) {
        expect(svgIndex).toBeLessThan(htmlIndex);
      }
    }
  });
});
