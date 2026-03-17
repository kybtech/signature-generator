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
      expect(html).toContain(testAssets.bglLogo);
      expect(html).toContain(testAssets.websiteIcon);
      expect(html).toContain(testAssets.linkedinIcon);
      expect(html).toContain(testAssets.instagramIcon);

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
      const photoImgCount = (html.match(/src="data:image\/png/g) || []).length;
      // Should have 3 PNG images (www, linkedin, instagram) but no personal photo
      expect(photoImgCount).toBe(3);

      // Check that company logo is still present
      expect(html).toContain(testAssets.companyLogo);
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

    it('should use inline data URIs for all images', () => {
      const html = generateSignatureHtml(testSignatureData.withPhoto, testAssets);

      // Check that NO image src attributes use external URLs
      expect(html).not.toMatch(/src="https?:\/\//);
      expect(html).not.toMatch(/src='https?:\/\//);

      // Check that data URIs are present
      expect(html).toMatch(/src="data:image\//g);

      // Count data URI occurrences (should have 6: photo + company logo + bgl + 3 social icons)
      const dataUriCount = (html.match(/src="data:image\//g) || []).length;
      expect(dataUriCount).toBe(6);
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
  });
});
