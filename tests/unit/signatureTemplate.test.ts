import { describe, it, expect } from 'vitest';
import { generateSignatureHtml } from '@/utils/signatureTemplate';
import { testSignatureData, testAssets } from '../fixtures/testSignatureData';

describe('signatureTemplate', () => {
  describe('generateSignatureHtml', () => {
    it('should generate HTML with all fields filled including photo', () => {
      const html = generateSignatureHtml(testSignatureData.withPhoto, testAssets);

      // Check that all data is present in the HTML
      expect(html).toContain(testSignatureData.withPhoto.name);
      expect(html).toContain(testSignatureData.withPhoto.title);
      expect(html).toContain(testSignatureData.withPhoto.phone);
      expect(html).toContain(testSignatureData.withPhoto.email);
      expect(html).toContain(testSignatureData.withPhoto.photoDataUri!);

      // Check that assets are included
      expect(html).toContain(testAssets.companyLogo);
      // BGL logo and social media icons should use remote URLs
      expect(html).toContain('https://trustedcarrier.net/bgl.svg');
      expect(html).toContain('https://www.trustedcarrier.net/www.png');
      expect(html).toContain('https://www.trustedcarrier.net/linkedin.png');
      expect(html).toContain('https://www.trustedcarrier.net/instagram.png');

      // Check structural elements
      expect(html).toContain('<table');
      expect(html).toContain('Trusted Carrier Logistik GmbH');
      expect(html).toContain('www.trusted-carrier.net');
    });

    it('should generate HTML without photo when photoDataUri is not provided', () => {
      const html = generateSignatureHtml(testSignatureData.withoutPhoto, testAssets);

      // Check that all data is present
      expect(html).toContain(testSignatureData.withoutPhoto.name);
      expect(html).toContain(testSignatureData.withoutPhoto.title);
      expect(html).toContain(testSignatureData.withoutPhoto.phone);
      expect(html).toContain(testSignatureData.withoutPhoto.email);

      // Check that photo section is handled properly (no personal photo img tag)
      // Should have no PNG data URIs since social media icons use remote URLs
      const photoImgCount = (html.match(/src="data:image\/png/g) || []).length;
      expect(photoImgCount).toBe(0);

      // Check that company logo is still present
      expect(html).toContain(testAssets.companyLogo);

      // Check that BGL logo and social media icons use remote URLs
      expect(html).toContain('https://trustedcarrier.net/bgl.svg');
      expect(html).toContain('https://www.trustedcarrier.net/www.png');
      expect(html).toContain('https://www.trustedcarrier.net/linkedin.png');
      expect(html).toContain('https://www.trustedcarrier.net/instagram.png');
    });

    it('should escape HTML special characters to prevent XSS', () => {
      const html = generateSignatureHtml(testSignatureData.withSpecialChars, testAssets);

      // Check that script tags are escaped
      expect(html).not.toContain('<script>');
      expect(html).toContain('&lt;script&gt;');
      expect(html).toContain('alert(&quot;xss&quot;)');

      // Check that other special chars are escaped
      expect(html).toContain('&amp;');
      expect(html).toContain('&quot;Chief&quot;');

      // But structural HTML should remain
      expect(html).toContain('<table');
      expect(html).toContain('</table>');
    });

    it('should use remote URLs for social media icons to reduce HTML size', () => {
      const html = generateSignatureHtml(testSignatureData.withPhoto, testAssets);

      // BGL logo and social media icons should use remote URLs from trustedcarrier.net
      expect(html).toContain('src="https://trustedcarrier.net/bgl.svg"');
      expect(html).toContain('src="https://www.trustedcarrier.net/www.png"');
      expect(html).toContain('src="https://www.trustedcarrier.net/linkedin.png"');
      expect(html).toContain('src="https://www.trustedcarrier.net/instagram.png"');

      // Count data URI occurrences (should have 2: photo + company logo)
      // BGL logo and social media icons should NOT use data URIs
      const dataUriCount = (html.match(/src="data:image\//g) || []).length;
      expect(dataUriCount).toBe(2);
    });

    it('should maintain proper email signature structure with tables', () => {
      const html = generateSignatureHtml(testSignatureData.withPhoto, testAssets);

      // Check for table structure
      expect(html).toContain('cellpadding="0"');
      expect(html).toContain('cellspacing="0"');
      expect(html).toContain('border="0"');
      expect(html).toContain('border-collapse: collapse');

      // Check for proper layout structure
      expect(html).toContain('vertical-align: top');
      expect(html).toContain('font-family: Arial, Helvetica, sans-serif');

      // Check for footer section
      expect(html).toContain('Baierbrunner Straße 21');
      expect(html).toContain('81378 München');
    });

    it('should format phone number as clickable tel: link', () => {
      const html = generateSignatureHtml(testSignatureData.withPhoto, testAssets);

      expect(html).toContain('href="tel:+491712900239"');
      expect(html).toContain('+49 171 2900 239');
    });

    it('should format email as clickable mailto: link', () => {
      const html = generateSignatureHtml(testSignatureData.withPhoto, testAssets);

      expect(html).toContain('href="mailto:karlheinz.toni@trustedcarrier.net"');
      expect(html).toContain('karlheinz.toni@trustedcarrier.net');
    });

    it('should include all social media links with proper hrefs', () => {
      const html = generateSignatureHtml(testSignatureData.withPhoto, testAssets);

      // Website link
      expect(html).toContain('href="https://trustedcarrier.net/"');

      // LinkedIn link
      expect(html).toContain('href="https://de.linkedin.com/company/trusted-carrier-logistik-gmbh"');

      // Instagram link
      expect(html).toContain('href="https://www.instagram.com/trustedcarrier/"');

      // BGL link
      expect(html).toContain('href="https://www.bgl-ev.de/"');
    });

    it('should use remote URL for company logo when provided', () => {
      const remoteLogoUrl = 'https://trustedcarrier.net/darkgreen.svg';
      const assetsWithRemoteUrl = {
        ...testAssets,
        companyLogo: remoteLogoUrl,
      };

      const html = generateSignatureHtml(testSignatureData.withPhoto, assetsWithRemoteUrl);

      // Should contain the remote URL
      expect(html).toContain(`src="${remoteLogoUrl}"`);
    });

    it('should support photo as remote URL instead of data URI', () => {
      const photoUrl = 'https://example.com/photo.jpg';
      const dataWithPhotoUrl = {
        ...testSignatureData.withPhoto,
        photoDataUri: photoUrl,
      };

      const html = generateSignatureHtml(dataWithPhotoUrl, testAssets);

      // Should contain the remote photo URL
      expect(html).toContain(`src="${photoUrl}"`);
      expect(html).toContain(`alt="${testSignatureData.withPhoto.name}"`);
    });

    it('should handle mixed data URIs and remote URLs', () => {
      const remoteLogoUrl = 'https://trustedcarrier.net/darkgreen.svg';
      const remotePhotoUrl = 'https://example.com/photo.jpg';

      const dataWithRemotePhoto = {
        ...testSignatureData.withPhoto,
        photoDataUri: remotePhotoUrl,
      };

      const assetsWithRemoteUrl = {
        ...testAssets,
        companyLogo: remoteLogoUrl,
      };

      const html = generateSignatureHtml(dataWithRemotePhoto, assetsWithRemoteUrl);

      // Should contain both remote URLs
      expect(html).toContain(`src="${remoteLogoUrl}"`);
      expect(html).toContain(`src="${remotePhotoUrl}"`);

      // Should still contain remote URLs for BGL logo and social media icons
      expect(html).toContain('https://trustedcarrier.net/bgl.svg');
      expect(html).toContain('https://www.trustedcarrier.net/www.png');
      expect(html).toContain('https://www.trustedcarrier.net/linkedin.png');
      expect(html).toContain('https://www.trustedcarrier.net/instagram.png');
    });
  });
});
