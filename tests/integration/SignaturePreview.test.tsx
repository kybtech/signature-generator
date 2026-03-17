import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import SignaturePreview from '@/components/SignaturePreview';

describe('SignaturePreview', () => {
  it('should render an iframe', () => {
    const html = '<div>Test Signature</div>';
    render(<SignaturePreview html={html} />);

    const iframe = screen.getByTitle(/signature preview/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe.tagName).toBe('IFRAME');
  });

  it('should display the provided HTML content', async () => {
    const html = '<div id="test-content">Test Signature Content</div>';
    const { container } = render(<SignaturePreview html={html} />);

    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();

    // Wait for iframe to load
    await waitFor(() => {
      const iframeDoc = iframe?.contentDocument;
      expect(iframeDoc?.body.innerHTML).toContain('test-content');
    });
  });

  it('should update when HTML changes', async () => {
    const { rerender, container } = render(<SignaturePreview html="<div>Initial</div>" />);

    const iframe = container.querySelector('iframe');

    // Wait for initial content
    await waitFor(() => {
      expect(iframe?.contentDocument?.body.innerHTML).toContain('Initial');
    });

    // Update with new HTML
    rerender(<SignaturePreview html="<div>Updated</div>" />);

    // Wait for updated content
    await waitFor(() => {
      expect(iframe?.contentDocument?.body.innerHTML).toContain('Updated');
    });
  });

  it('should handle empty HTML', () => {
    render(<SignaturePreview html="" />);

    const iframe = screen.getByTitle(/signature preview/i);
    expect(iframe).toBeInTheDocument();
  });

  it('should have sandbox attribute for security', () => {
    const html = '<div>Test</div>';
    const { container } = render(<SignaturePreview html={html} />);

    const iframe = container.querySelector('iframe');
    // Iframe should allow same-origin for preview but restrict scripts
    expect(iframe?.getAttribute('sandbox')).toBeTruthy();
  });

  it('should preserve HTML styling and structure', async () => {
    const html = `
      <div style="color: red; font-size: 16px;">
        <table cellpadding="0"><tbody><tr><td>Test</td></tr></tbody></table>
      </div>
    `;
    const { container } = render(<SignaturePreview html={html} />);

    const iframe = container.querySelector('iframe');

    await waitFor(() => {
      const iframeDoc = iframe?.contentDocument;
      expect(iframeDoc?.body.innerHTML).toContain('cellpadding="0"');
      expect(iframeDoc?.body.innerHTML).toContain('color: red');
    });
  });
});
