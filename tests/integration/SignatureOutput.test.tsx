import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignatureOutput from '@/components/SignatureOutput';

describe('SignatureOutput', () => {
  const testHtml = '<div>Test Signature HTML</div>';

  it('should render copy and download buttons', () => {
    render(<SignatureOutput html={testHtml} />);

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('should copy HTML to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    render(<SignatureOutput html={testHtml} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testHtml);
    });
  });

  it('should show success message after successful copy', async () => {
    const user = userEvent.setup();
    render(<SignatureOutput html={testHtml} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it('should show error message when copy fails', async () => {
    const user = userEvent.setup();

    // Mock clipboard failure
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
      writable: true,
    });

    render(<SignatureOutput html={testHtml} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it('should trigger download when download button is clicked', async () => {
    const user = userEvent.setup();

    // Mock URL.createObjectURL and document.createElement
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    const mockClick = vi.fn();
    const mockRemove = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') {
        element.click = mockClick;
        element.remove = mockRemove;
      }
      return element;
    });

    render(<SignatureOutput html={testHtml} />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it('should disable buttons when HTML is empty', () => {
    render(<SignatureOutput html="" />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    const downloadButton = screen.getByRole('button', { name: /download/i });

    expect(copyButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
  });

  it('should enable buttons when HTML is provided', () => {
    render(<SignatureOutput html={testHtml} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    const downloadButton = screen.getByRole('button', { name: /download/i });

    expect(copyButton).not.toBeDisabled();
    expect(downloadButton).not.toBeDisabled();
  });

  it('should download file with correct filename', async () => {
    const user = userEvent.setup();

    const mockAnchor = document.createElement('a');
    const mockClick = vi.fn();
    mockAnchor.click = mockClick;

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchor;
      }
      return document.createElement(tagName);
    });

    render(<SignatureOutput html={testHtml} />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockAnchor.download).toMatch(/signature.*\.html/);
    });
  });
});
