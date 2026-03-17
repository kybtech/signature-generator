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
    const mockWriteText = vi.fn().mockResolvedValue(undefined);

    // Override the global mock for this test
    Object.assign(navigator.clipboard, { writeText: mockWriteText });

    render(<SignatureOutput html={testHtml} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(testHtml);
    });
  });

  it('should show success message after successful copy', async () => {
    const user = userEvent.setup();
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator.clipboard, { writeText: mockWriteText });

    render(<SignatureOutput html={testHtml} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/copied/i)).toBeInTheDocument();
    });
  });

  it('should show error message when copy fails', async () => {
    const user = userEvent.setup();

    // Mock clipboard failure for this specific test
    const mockWriteText = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.assign(navigator.clipboard, { writeText: mockWriteText });

    render(<SignatureOutput html={testHtml} />);

    const copyButton = screen.getByRole('button', { name: /copy/i });
    await user.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText(/permission denied/i)).toBeInTheDocument();
    });
  });

  it('should trigger download when download button is clicked', async () => {
    const user = userEvent.setup();

    // Mock URL and document methods
    const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
    const mockRevokeObjectURL = vi.fn();
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock link click
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement');

    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const anchor = originalCreateElement('a') as HTMLAnchorElement;
        anchor.click = mockClick;
        return anchor;
      }
      return originalCreateElement(tagName);
    });

    render(<SignatureOutput html={testHtml} />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    createElementSpy.mockRestore();
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

    let capturedFilename = '';
    const originalCreateElement = document.createElement.bind(document);
    const createElementSpy = vi.spyOn(document, 'createElement');

    createElementSpy.mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const anchor = originalCreateElement('a') as HTMLAnchorElement;
        Object.defineProperty(anchor, 'download', {
          set: (value: string) => {
            capturedFilename = value;
          },
          get: () => capturedFilename,
          configurable: true,
        });
        anchor.click = vi.fn();
        return anchor;
      }
      return originalCreateElement(tagName);
    });

    render(<SignatureOutput html={testHtml} />);

    const downloadButton = screen.getByRole('button', { name: /download/i });
    await user.click(downloadButton);

    await waitFor(() => {
      expect(capturedFilename).toMatch(/signature.*\.html/);
    });

    createElementSpy.mockRestore();
  });
});
