import { useEffect, useRef } from 'react';
import './SignaturePreview.css';

interface SignaturePreviewProps {
  html: string;
}

export default function SignaturePreview({ html }: SignaturePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Write the HTML content to the iframe
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, Helvetica, sans-serif;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `);
    iframeDoc.close();
  }, [html]);

  return (
    <div className="signature-preview">
      <h2>Preview</h2>
      <div className="preview-container">
        <iframe ref={iframeRef} title="Signature Preview" sandbox="allow-same-origin" />
      </div>
    </div>
  );
}
