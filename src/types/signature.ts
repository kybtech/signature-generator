export interface SignatureData {
  name: string;
  title: string;
  phone: string;
  email: string;
  photoDataUri?: string; // Optional photo as data URI
}

export interface SignatureAssets {
  companyLogo: string; // data URI
  bglLogo: string; // data URI
  websiteIcon: string; // data URI
  linkedinIcon: string; // data URI
  instagramIcon: string; // data URI
}
