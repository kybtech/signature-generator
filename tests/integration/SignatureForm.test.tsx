import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignatureForm from '@/components/SignatureForm';
import type { SignatureData } from '@/types/signature';

describe('SignatureForm', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('should render all input fields', () => {
    render(<SignatureForm onChange={mockOnChange} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/photo/i)).toBeInTheDocument();
  });

  it('should call onChange when name field changes', async () => {
    const user = userEvent.setup();
    render(<SignatureForm onChange={mockOnChange} />);

    const nameInput = screen.getByLabelText(/name/i);
    await user.type(nameInput, 'John Doe');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.name).toBe('John Doe');
  });

  it('should call onChange when title field changes', async () => {
    const user = userEvent.setup();
    render(<SignatureForm onChange={mockOnChange} />);

    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Manager');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.title).toBe('Manager');
  });

  it('should call onChange when phone field changes', async () => {
    const user = userEvent.setup();
    render(<SignatureForm onChange={mockOnChange} />);

    const phoneInput = screen.getByLabelText(/phone/i);
    await user.type(phoneInput, '+49 171 1234567');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.phone).toBe('+49 171 1234567');
  });

  it('should call onChange when email field changes', async () => {
    const user = userEvent.setup();
    render(<SignatureForm onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'test@trustedcarrier.net');

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.email).toBe('test@trustedcarrier.net');
  });

  it('should show validation error for required fields', async () => {
    const user = userEvent.setup();
    render(<SignatureForm onChange={mockOnChange} />);

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;

    // Focus and blur without entering value
    await user.click(nameInput);
    await user.tab();

    // Check if field is marked as required
    expect(nameInput.required).toBe(true);
  });

  it('should validate email format', () => {
    render(<SignatureForm onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    expect(emailInput.type).toBe('email');
  });

  it('should validate phone format', () => {
    render(<SignatureForm onChange={mockOnChange} />);

    const phoneInput = screen.getByLabelText(/phone/i) as HTMLInputElement;
    expect(phoneInput.type).toBe('tel');
  });

  it('should accept photo upload', async () => {
    const user = userEvent.setup();
    render(<SignatureForm onChange={mockOnChange} />);

    const file = new File(['dummy content'], 'photo.png', { type: 'image/png' });
    const photoInput = screen.getByLabelText(/photo/i) as HTMLInputElement;

    await user.upload(photoInput, file);

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
    });

    // Check that photo was processed
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.photoDataUri).toBeDefined();
  });

  it('should show error for invalid photo file type', async () => {
    const user = userEvent.setup();
    render(<SignatureForm onChange={mockOnChange} />);

    const file = new File(['dummy content'], 'document.pdf', { type: 'application/pdf' });
    const photoInput = screen.getByLabelText(/photo/i) as HTMLInputElement;

    await user.upload(photoInput, file);

    await waitFor(() => {
      expect(screen.getByText(/invalid file type/i)).toBeInTheDocument();
    });
  });

  it('should populate fields with initial data', () => {
    const initialData: SignatureData = {
      name: 'Test User',
      title: 'Test Title',
      phone: '+49 123 456',
      email: 'test@example.com',
    };

    render(<SignatureForm onChange={mockOnChange} initialData={initialData} />);

    expect((screen.getByLabelText(/name/i) as HTMLInputElement).value).toBe('Test User');
    expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe('Test Title');
    expect((screen.getByLabelText(/phone/i) as HTMLInputElement).value).toBe('+49 123 456');
    expect((screen.getByLabelText(/email/i) as HTMLInputElement).value).toBe('test@example.com');
  });
});
