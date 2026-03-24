import { optimize } from 'svgo';
import svgToTinyDataUri from 'mini-svg-data-uri';

/**
 * Minifies SVG markup using SVGO.
 * @param svgString - The raw SVG string
 * @returns Minified SVG string
 */
export function minifySvg(svgString: string): string {
  try {
    const result = optimize(svgString, {
      multipass: true,
      plugins: ['preset-default'],
    });
    return result.data;
  } catch (error) {
    // If optimization fails, return original
    console.warn('SVG optimization failed:', error);
    return svgString;
  }
}

/**
 * Optimizes an SVG data URI by:
 * 1. Decoding from base64 if needed
 * 2. Applying SVGO minification
 * 3. Using mini-svg-data-uri encoding (33% smaller than base64)
 * @param svgDataUri - SVG data URI (can be base64 or raw)
 * @returns Optimized raw SVG data URI
 */
export function optimizeSvgDataUri(svgDataUri: string): string {
  try {
    // Extract SVG content from data URI
    let svgContent: string;

    if (svgDataUri.includes(';base64,')) {
      // Decode base64
      const base64Data = svgDataUri.split(';base64,')[1];
      svgContent = atob(base64Data);
    } else if (svgDataUri.startsWith('data:image/svg+xml')) {
      // Extract raw SVG (handle both utf8 and no charset)
      const match = svgDataUri.match(/^data:image\/svg\+xml[^,]*,(.+)$/);
      if (match) {
        svgContent = decodeURIComponent(match[1]);
      } else {
        throw new Error('Invalid SVG data URI format');
      }
    } else {
      throw new Error('Not a valid SVG data URI');
    }

    // Minify the SVG
    const minified = minifySvg(svgContent);

    // Use mini-svg-data-uri for optimal encoding
    // This swaps " to ', encodes only unsafe characters, and uses raw (not base64)
    return svgToTinyDataUri(minified);
  } catch (error) {
    console.warn('SVG data URI optimization failed:', error);
    return svgDataUri; // Return original on error
  }
}
