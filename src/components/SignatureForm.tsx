import { useState, useEffect, ChangeEvent } from 'react';
import type { SignatureData } from '@/types/signature';
import { loadImageAsDataUri } from '@/utils/imageUtils';
import './SignatureForm.css';

interface SignatureFormProps {
  onChange: (data: SignatureData) => void;
  initialData?: SignatureData;
}

export default function SignatureForm({ onChange, initialData }: SignatureFormProps) {
  const [formData, setFormData] = useState<SignatureData>({
    name: initialData?.name || '',
    title: initialData?.title || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    photoDataUri: initialData?.photoDataUri,
  });

  const [photoError, setPhotoError] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError('');

    if (!file) {
      setFormData((prev) => ({ ...prev, photoDataUri: undefined }));
      return;
    }

    setPhotoLoading(true);

    try {
      const dataUri = await loadImageAsDataUri(file);
      setFormData((prev) => ({ ...prev, photoDataUri: dataUri }));
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Failed to load image');
      setFormData((prev) => ({ ...prev, photoDataUri: undefined }));
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <form className="signature-form">
      <h2>Personal Information</h2>

      <div className="form-group">
        <label htmlFor="name">
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          placeholder="e.g., Karlheinz Toni"
        />
      </div>

      <div className="form-group">
        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          placeholder="e.g., Managing Director"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">
          Phone <span className="required">*</span>
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          required
          placeholder="e.g., +49 171 2900 239"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          placeholder="e.g., name@trustedcarrier.net"
        />
      </div>

      <div className="form-group">
        <label htmlFor="photo">Photo (optional)</label>
        <input type="file" id="photo" name="photo" accept="image/png,image/jpeg,image/jpg,image/svg+xml" onChange={handlePhotoChange} />
        <small className="help-text">PNG, JPEG, or SVG. Max 5MB.</small>
        {photoLoading && <p className="loading-text">Loading photo...</p>}
        {photoError && <p className="error-text">{photoError}</p>}
        {formData.photoDataUri && !photoError && (
          <div className="photo-preview">
            <img src={formData.photoDataUri} alt="Preview" />
          </div>
        )}
      </div>
    </form>
  );
}
