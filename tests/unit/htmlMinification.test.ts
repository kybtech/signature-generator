import { describe, it, expect } from 'vitest';
import { minifyHtml } from '@/utils/htmlMinification';

describe('htmlMinification', () => {
  it('should remove unnecessary whitespace', async () => {
    const input = `
      <div>
        <p>  Hello World  </p>
      </div>
    `;
    const result = await minifyHtml(input);
    expect(result.length).toBeLessThan(input.length);
    expect(result).toContain('<div>');
    expect(result).toContain('<p>');
  });

  it('should preserve essential structure', async () => {
    const input = '<table><tr><td>Cell</td></tr></table>';
    const result = await minifyHtml(input);
    expect(result).toContain('<table>');
    expect(result).toContain('<tr>');
    expect(result).toContain('<td>');
  });

  it('should minify inline CSS', async () => {
    const input = '<div style="  color: red;  margin: 10px;  ">Text</div>';
    const result = await minifyHtml(input);
    expect(result.length).toBeLessThan(input.length);
    expect(result).toContain('color:red');
  });
});
