import type { SignatureData, SignatureAssets } from '@/types/signature';

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

/**
 * Formats phone number for tel: link (removes spaces and special chars except +)
 */
function formatPhoneForTel(phone: string): string {
  return phone.replace(/[^+\d]/g, '');
}

/**
 * Generates email signature HTML based on user data and assets
 *
 * @param data - User signature data (name, title, phone, email, optional photo)
 * @param assets - Company assets as data URIs (logos and icons)
 * @returns Complete HTML string for email signature
 */
export function generateSignatureHtml(data: SignatureData, assets: SignatureAssets): string {
  const escapedName = escapeHtml(data.name);
  const escapedTitle = escapeHtml(data.title);
  const escapedPhone = escapeHtml(data.phone);
  const escapedEmail = escapeHtml(data.email);

  const phoneForTel = formatPhoneForTel(data.phone);

  // Build the photo cell HTML - only include personal photo if provided
  const photoImgHtml = data.photoDataUri
    ? `<img
          src="${data.photoDataUri}" alt="${escapedName}" width="80"
          style="display: block; border: 0; width: 80px; max-width: 80px; height: auto; margin: 0 auto;"> `
    : '';

  return `<div><br>--<br></div>
<div><br></div>
<table cellpadding="0" cellspacing="0" border="0"
  style="border-collapse: collapse; width: 100%; max-width: 860px; font-family: Arial, Helvetica, sans-serif; color: #333333; padding-top: 12px;">
  <tbody>
    <tr>
      <td style="padding: 0 18px 0 0; vertical-align: top; width: 98px; text-align: center;" align="center">${photoImgHtml}<img
          src="${assets.companyLogo}" alt="Trusted Carrier" width="80"
          style="display: block; border: 0; width: 80px; max-width: 80px; height: auto; margin: 8px auto 0 auto;"><br>
      </td>
      <td style="padding: 0; vertical-align: top;">
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
          <tbody>
            <tr>
              <td
                style="padding: 0 0 2px 0; font-family: Arial, Helvetica, sans-serif; font-size: 15px; line-height: 18px; font-weight: 700; color: #1c3940;">
                ${escapedName}<br></td>
            </tr>
            <tr>
              <td
                style="padding: 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 18px; color: #4b4b4b;">
                ${escapedTitle}<br></td>
            </tr>
            <tr>
              <td
                style="padding: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 18px; color: #4b4b4b;">
                <div>Trusted Carrier Logistik GmbH<br></div>
                <div>Initiative by <a data-ik="ik-secure" rel="noopener noreferrer" href="https://www.bgl-ev.de/"
                    style="color: #1c3940; text-decoration: none; display: inline-block; vertical-align: middle;"
                    title="BGL e.V."><img src="${assets.bglLogo}" alt="BGL e.V." width="13" height="13"
                      style="display: inline-block; width: 1em; height: 1em; vertical-align: -0.12em; border: 0;"></a><br>
                </div>
              </td>
            </tr>
            <tr>
              <td
                style="padding: 0 0 3px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 18px; color: #1c3940;">
                <a data-ik="ik-secure" rel="noopener noreferrer" href="tel:${phoneForTel}"
                  style="color: #1c3940; text-decoration: none;">${escapedPhone}</a><br>
              </td>
            </tr>
            <tr>
              <td
                style="padding: 0 0 3px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 18px; color: #1c3940;">
                <a href="mailto:${escapedEmail}"
                  style="color: #1c3940; text-decoration: none;">${escapedEmail}</a><br>
              </td>
            </tr>
            <tr>
              <td
                style="padding: 0 0 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 18px; color: #1c3940;">
                <a data-ik="ik-secure" rel="noopener noreferrer" href="https://trustedcarrier.net/"
                  style="color: #1c3940; text-decoration: none; font-weight: bold;">www.trusted-carrier.net</a><br>
              </td>
            </tr>
            <tr>
              <td style="padding: 0;">
                <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                  <tbody>
                    <tr>
                      <td style="padding: 0 6px 0 0;"><a data-ik="ik-secure" rel="noopener noreferrer"
                          href="https://trustedcarrier.net/" style="text-decoration: none;"><img
                            src="${assets.websiteIcon}" alt="Website" width="22"
                            style="display: block; border: 0; width: 22px; height: 22px;"></a><br></td>
                      <td style="padding: 0 6px 0 0;"><a data-ik="ik-secure" rel="noopener noreferrer"
                          href="https://de.linkedin.com/company/trusted-carrier-logistik-gmbh"
                          style="text-decoration: none;"><img src="${assets.linkedinIcon}"
                            alt="LinkedIn" width="22"
                            style="display: block; border: 0; width: 22px; height: 22px;"></a><br></td>
                      <td style="padding: 0;"><a data-ik="ik-secure" rel="noopener noreferrer"
                          href="https://www.instagram.com/trustedcarrier/" style="text-decoration: none;"><img
                            src="${assets.instagramIcon}" alt="Instagram" width="22"
                            style="display: block; border: 0; width: 22px; height: 22px;"></a><br></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 10px 0 0 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">
          <tbody>
            <tr>
              <td style="border-top: 1px solid #1c3940; font-size: 0; line-height: 0;">&nbsp;<br></td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="2"
        style="padding: 10px 0 0 0; font-family: Arial, Helvetica, sans-serif; font-size: 10px; line-height: 16px; color: #5a5a5a;">
        Trusted Carrier Logistik GmbH • Baierbrunner Straße 21 • 81378 München • Initiative by BGL<br></td>
    </tr>
  </tbody>
</table>`;
}
