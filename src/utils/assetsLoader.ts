/**
 * Pre-loaded company assets as data URIs for email signature
 */
import type { SignatureAssets } from '@/types/signature';

// Import assets - Vite will handle these as base64 data URIs
import companyLogoUrl from '@/assets/darkgreen.svg?url';
import bglLogoUrl from '@/assets/bgl.svg?url';
import websiteIconUrl from '@/assets/www.png?url';
import linkedinIconUrl from '@/assets/linkedin.png?url';
import instagramIconUrl from '@/assets/instagram.png?url';

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
 */
export async function loadSignatureAssets(): Promise<SignatureAssets> {
  const [companyLogo, bglLogo, websiteIcon, linkedinIcon, instagramIcon] = await Promise.all([
    fetchAsDataUri(companyLogoUrl),
    fetchAsDataUri(bglLogoUrl),
    fetchAsDataUri(websiteIconUrl),
    fetchAsDataUri(linkedinIconUrl),
    fetchAsDataUri(instagramIconUrl),
  ]);

  return {
    companyLogo,
    bglLogo,
    websiteIcon,
    linkedinIcon,
    instagramIcon,
  };
}
