import { useState } from 'react';
import { copyToClipboard } from '@/utils/clipboardUtils';
import './SignatureOutput.css';

interface SignatureOutputProps {
  html: string;
}

export default function SignatureOutput({ html }: SignatureOutputProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copyMessage, setCopyMessage] = useState('');

  const handleCopy = async () => {
    try {
      // Debug: log what we're about to copy
      console.log('[Copy] HTML length:', html.length);
      console.log('[Copy] HTML preview (first 300 chars):', html.substring(0, 300));
      console.log('[Copy] Contains remote URL?:', html.includes('https://trustedcarrier.net/darkgreen.svg'));
      console.log('[Copy] Contains data URI?:', html.includes('data:image/svg+xml'));

      await copyToClipboard(html);
      setCopyStatus('success');
      setCopyMessage('Copied to clipboard!');
      setTimeout(() => {
        setCopyStatus('idle');
        setCopyMessage('');
      }, 3000);
    } catch (error) {
      setCopyStatus('error');
      setCopyMessage(error instanceof Error ? error.message : 'Failed to copy');
      setTimeout(() => {
        setCopyStatus('idle');
        setCopyMessage('');
      }, 5000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signature-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isDisabled = !html || html.trim() === '';
  const sizeKB = html ? (new Blob([html]).size / 1024).toFixed(1) : '0';

  return (
    <div className="signature-output">
      <h2>Export Signature</h2>
      {!isDisabled && <p className="size-info">Size: {sizeKB} KB</p>}
      <div className="button-group">
        <button onClick={handleCopy} disabled={isDisabled} className="btn btn-primary" aria-label="Copy to clipboard">
          📋 Copy to Clipboard
        </button>
        <button
          onClick={handleDownload}
          disabled={isDisabled}
          className="btn btn-secondary"
          aria-label="Download as HTML file"
        >
          💾 Download HTML
        </button>
      </div>
      {copyMessage && <p className={`status-message ${copyStatus}`}>{copyMessage}</p>}
      {!isDisabled && (
        <div className="instructions">
          <h3>How to use:</h3>
          <ol>
            <li>Click "Copy to Clipboard" to copy the signature HTML</li>
            <li>Open your email client settings (Gmail, Outlook, etc.)</li>
            <li>Paste the HTML into your signature settings</li>
            <li>Save and test by sending yourself an email</li>
          </ol>
        </div>
      )}
    </div>
  );
}
