export const testSignatureData = {
  withPhoto: {
    name: 'Karlheinz Toni',
    title: 'Managing Director',
    phone: '+49 171 2900 239',
    email: 'karlheinz.toni@trustedcarrier.net',
    photoDataUri:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  },
  withoutPhoto: {
    name: 'Max Mustermann',
    title: 'Logistics Coordinator',
    phone: '+49 89 12345678',
    email: 'max.mustermann@trustedcarrier.net',
  },
  withSpecialChars: {
    name: 'Hans <script>alert("xss")</script> Müller',
    title: 'Manager & "Chief" Officer',
    phone: '+49 171 2900 239',
    email: 'hans.mueller@trustedcarrier.net',
  },
};

export const testAssets = {
  companyLogo: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
  // Note: BGL logo and social media icons use remote URLs and are not included here
};
