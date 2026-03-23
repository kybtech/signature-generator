export interface SignatureData {
  name: string;
  title: string;
  phone: string;
  email: string;
  photoDataUri?: string; // Optional photo as data URI or URL
  useRemoteUrls?: boolean; // Whether to use remote URLs instead of data URIs
  companyLogoUrl?: string; // Remote URL for company logo (when useRemoteUrls is true)
}

export interface SignatureAssets {
  companyLogo: string; // data URI or remote URL
  // Note: BGL logo and social media icons (website, linkedin, instagram) are hardcoded as remote URLs
  // in signatureTemplate.ts to reduce HTML size
}
