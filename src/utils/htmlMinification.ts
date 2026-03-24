/**
 * Minifies HTML content to reduce size.
 * Simple browser-compatible implementation that removes unnecessary whitespace.
 * @param html - The HTML string to minify
 * @returns Minified HTML string
 */
export async function minifyHtml(html: string): Promise<string> {
  try {
    // Simple minification that's safe for email HTML:
    // 1. Remove comments
    let minified = html.replace(/<!--[\s\S]*?-->/g, '');

    // 2. Collapse whitespace between tags (but preserve space in text content)
    minified = minified.replace(/>\s+</g, '><');

    // 3. Trim whitespace at start/end of tags
    minified = minified.replace(/\s+>/g, '>');
    minified = minified.replace(/<\s+/g, '<');

    // 4. Collapse multiple spaces in attributes to single space
    minified = minified.replace(/\s{2,}/g, ' ');

    // 5. Minify inline CSS (simple version - collapse whitespace in style attributes)
    minified = minified.replace(/style="([^"]*)"/g, (_match, css) => {
      const minifiedCss = css
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s+/g, ' ')
        .trim();
      return `style="${minifiedCss}"`;
    });

    return minified;
  } catch (error) {
    console.warn('HTML minification failed:', error);
    return html; // Return original on error
  }
}
