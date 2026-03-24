import { useState, useEffect, ChangeEvent } from 'react';
import type { SignatureData } from '@/types/signature';
import { loadImageAsDataUri } from '@/utils/imageUtils';
import './SignatureForm.css';

interface SignatureFormProps {
  onChange: (data: SignatureData) => void;
  initialData?: SignatureData;
}

const DEFAULT_COMPANY_LOGO_URL = 'https://trustedcarrier.net/darkgreen.svg';

export default function SignatureForm({ onChange, initialData }: SignatureFormProps) {
  const [formData, setFormData] = useState<SignatureData>({
    name: initialData?.name || '',
    title: initialData?.title || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    photoDataUri: initialData?.photoDataUri,
    useRemoteUrls: initialData?.useRemoteUrls || false,
    companyLogoUrl: initialData?.companyLogoUrl || DEFAULT_COMPANY_LOGO_URL,
    maxSizeKB: initialData?.maxSizeKB ?? 80, // Default to 80KB
  });

  const [photoError, setPhotoError] = useState<string>('');
  const [photoLoading, setPhotoLoading] = useState(false);

  // Keep track of URL inputs separately to preserve them when toggling
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>(DEFAULT_COMPANY_LOGO_URL);

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? (value === '' ? 0 : parseInt(value, 10)) : value;
    setFormData((prev) => ({ ...prev, [name]: parsedValue }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const useRemoteUrls = e.target.checked;

    if (useRemoteUrls) {
      // Switching to remote URLs
      setFormData((prev) => ({
        ...prev,
        useRemoteUrls: true,
        companyLogoUrl: companyLogoUrl,
        photoDataUri: photoUrl || undefined,
      }));
    } else {
      // Switching back to file upload
      setFormData((prev) => ({
        ...prev,
        useRemoteUrls: false,
        companyLogoUrl: undefined,
        photoDataUri: undefined,
      }));
    }
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

  const handlePhotoUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPhotoUrl(url);
    setFormData((prev) => ({ ...prev, photoDataUri: url || undefined }));
  };

  const handleCompanyLogoUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setCompanyLogoUrl(url);
    setFormData((prev) => ({ ...prev, companyLogoUrl: url }));
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
        <label htmlFor="useRemoteUrls">
          <input
            type="checkbox"
            id="useRemoteUrls"
            name="useRemoteUrls"
            checked={formData.useRemoteUrls}
            onChange={handleCheckboxChange}
          />{' '}
          Use remote URLs
        </label>
        <small className="help-text">Use remote image URLs instead of embedding images</small>
      </div>

      {!formData.useRemoteUrls && (
        <div className="form-group">
          <label htmlFor="maxSizeKB">
            Max signature size (KB)
            <small className="field-hint">0 = unlimited (default: 80)</small>
          </label>
          <input
            type="number"
            id="maxSizeKB"
            name="maxSizeKB"
            min="0"
            step="1"
            value={formData.maxSizeKB ?? 80}
            onChange={handleInputChange}
          />
        </div>
      )}

      {formData.useRemoteUrls ? (
        <>
          <div className="form-group">
            <label htmlFor="companyLogoUrl">Company Logo URL</label>
            <input
              type="url"
              id="companyLogoUrl"
              name="companyLogoUrl"
              value={companyLogoUrl}
              onChange={handleCompanyLogoUrlChange}
              placeholder="https://trustedcarrier.net/darkgreen.svg"
            />
            <small className="help-text">URL to the company logo image</small>
          </div>

          <div className="form-group">
            <label htmlFor="photoUrl">Photo URL (optional)</label>
            <input
              type="url"
              id="photoUrl"
              name="photoUrl"
              value={photoUrl}
              onChange={handlePhotoUrlChange}
              placeholder="https://example.com/photo.jpg"
            />
            <small className="help-text">URL to your photo</small>
            {photoUrl && (
              <div className="photo-preview">
                <img src={photoUrl} alt="Preview" />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="form-group">
          <label htmlFor="photo">Photo (optional)</label>
          <input
            type="file"
            id="photo"
            name="photo"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml"
            onChange={handlePhotoChange}
          />
          <small className="help-text">PNG, JPEG, or SVG. Max 5MB.</small>
          {photoLoading && <p className="loading-text">Loading photo...</p>}
          {photoError && <p className="error-text">{photoError}</p>}
          {formData.photoDataUri && !photoError && (
            <div className="photo-preview">
              <img src={formData.photoDataUri} alt="Preview" />
            </div>
          )}
        </div>
      )}
    </form>
  );
}
