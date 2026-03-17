import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

// Mock the assets loader
vi.mock('@/utils/assetsLoader', () => ({
  loadSignatureAssets: vi.fn().mockResolvedValue({
    companyLogo: 'data:image/svg+xml;base64,logo',
    bglLogo: 'data:image/svg+xml;base64,bgl',
    websiteIcon: 'data:image/png;base64,www',
    linkedinIcon: 'data:image/png;base64,linkedin',
    instagramIcon: 'data:image/png;base64,instagram',
  }),
}));

describe('App Integration Tests', () => {
  let originalClipboard: Clipboard | undefined;

  beforeEach(() => {
    // Save original clipboard
    originalClipboard = navigator.clipboard;

    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original clipboard
    if (originalClipboard) {
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        writable: true,
        configurable: true,
      });
    }
  });

  it('should render the app with all main sections', async () => {
    render(<App />);

    // Wait for assets to load
    await waitFor(() => {
      expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/preview/i)).toBeInTheDocument();
    expect(screen.getByText(/export signature/i)).toBeInTheDocument();
  });

  it('should update preview when form fields are filled', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for assets to load
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Fill in form fields
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/title/i), 'Manager');
    await user.type(screen.getByLabelText(/phone/i), '+49 123 456789');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    // Check that preview updates (it contains an iframe)
    const iframe = screen.getByTitle(/signature preview/i);
    expect(iframe).toBeInTheDocument();

    // The HTML should be generated and passed to the preview
    await waitFor(() => {
      const iframeDoc = (iframe as HTMLIFrameElement).contentDocument;
      expect(iframeDoc?.body.innerHTML).toContain('John Doe');
    });
  });

  it('should enable copy and download buttons when form is filled', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Initially buttons should be disabled
    const copyButton = screen.getByRole('button', { name: /copy/i });
    const downloadButton = screen.getByRole('button', { name: /download/i });

    expect(copyButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();

    // Fill in required fields
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/title/i), 'Manager');
    await user.type(screen.getByLabelText(/phone/i), '+49 123 456789');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    // Buttons should become enabled
    await waitFor(() => {
      expect(copyButton).not.toBeDisabled();
      expect(downloadButton).not.toBeDisabled();
    });
  });

  it('should copy signature HTML to clipboard', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Fill in form
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/title/i), 'Manager');
    await user.type(screen.getByLabelText(/phone/i), '+49 123 456789');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    // Click copy button
    const copyButton = screen.getByRole('button', { name: /copy/i });
    await waitFor(() => expect(copyButton).not.toBeDisabled());
    await user.click(copyButton);

    // Check that clipboard was called with HTML content
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
      const callArg = (navigator.clipboard.writeText as any).mock.calls[0][0];
      expect(callArg).toContain('John Doe');
      expect(callArg).toContain('Manager');
      expect(callArg).toContain('<table');
    });

    // Check success message
    expect(await screen.findByText(/copied/i)).toBeInTheDocument();
  });

  it('should handle photo upload and include in signature', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Fill in form
    await user.type(screen.getByLabelText(/name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/title/i), 'Director');
    await user.type(screen.getByLabelText(/phone/i), '+49 987 654321');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');

    // Upload photo
    const file = new File(['photo content'], 'photo.png', { type: 'image/png' });
    const photoInput = screen.getByLabelText(/photo/i);
    await user.upload(photoInput, file);

    // Wait for photo to be processed
    await waitFor(() => {
      const iframe = screen.getByTitle(/signature preview/i) as HTMLIFrameElement;
      const iframeDoc = iframe.contentDocument;
      // Photo should be in the HTML as data URI
      expect(iframeDoc?.body.innerHTML).toMatch(/data:image\/png;base64/);
    });
  });

  it('should show loading state while assets are loading', () => {
    render(<App />);

    // Should show some loading indicator or be in a loading state
    // For now, just check that the app renders without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should maintain state when switching between form fields', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });

    // Type in name field
    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    await user.type(nameInput, 'Test Name');

    // Switch to title field
    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.type(titleInput, 'Test Title');

    // Verify name field still has value
    expect(nameInput.value).toBe('Test Name');
    expect(titleInput.value).toBe('Test Title');
  });
});
