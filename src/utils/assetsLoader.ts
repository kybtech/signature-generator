/**
 * Pre-loaded company assets as data URIs for email signature
 */
import type { SignatureAssets } from '@/types/signature';

// Import assets - Vite will handle these as base64 data URIs
import companyLogoUrl from '@/assets/darkgreen.svg?url';
// Note: BGL logo and social media icons are not imported here as they use remote URLs
// to reduce HTML size (see signatureTemplate.ts)

/**
 * Fetches an asset and converts it to a data URI
 */
async function fetchAsDataUri(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Loads all company assets as data URIs
 * This is called once when the app starts to convert all assets to inline data URIs
 * Note: BGL logo and social media icons use remote URLs and are not loaded here
 */
export async function loadSignatureAssets(): Promise<SignatureAssets> {
  const [companyLogo] = await Promise.all([fetchAsDataUri(companyLogoUrl)]);

  return {
    companyLogo,
  };
}
