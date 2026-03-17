import { useState, useEffect, useCallback } from 'react';
import SignatureForm from './components/SignatureForm';
import SignaturePreview from './components/SignaturePreview';
import SignatureOutput from './components/SignatureOutput';
import { generateSignatureHtml } from './utils/signatureTemplate';
import { loadSignatureAssets } from './utils/assetsLoader';
import type { SignatureData, SignatureAssets } from './types/signature';
import './App.css';

function App() {
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: '',
    title: '',
    phone: '',
    email: '',
  });
  const [assets, setAssets] = useState<SignatureAssets | null>(null);
  const [signatureHtml, setSignatureHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>('');

  // Load assets on mount
  useEffect(() => {
    loadSignatureAssets()
      .then((loadedAssets) => {
        setAssets(loadedAssets);
        setIsLoading(false);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Failed to load assets');
        setIsLoading(false);
      });
  }, []);

  // Generate HTML whenever data or assets change
  useEffect(() => {
    if (!assets) return;

    // Only generate if all required fields are filled
    if (signatureData.name && signatureData.title && signatureData.phone && signatureData.email) {
      const html = generateSignatureHtml(signatureData, assets);
      setSignatureHtml(html);
    } else {
      setSignatureHtml('');
    }
  }, [signatureData, assets]);

  const handleFormChange = useCallback((data: SignatureData) => {
    setSignatureData(data);
  }, []);

  if (isLoading) {
    return (
      <div className="app loading">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading assets...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="app error">
        <div className="error-container">
          <h1>Error</h1>
          <p>{loadError}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Email Signature Generator</h1>
        <p className="subtitle">Trusted Carrier Logistik GmbH</p>
      </header>

      <main className="app-main">
        <section className="form-section">
          <SignatureForm onChange={handleFormChange} />
        </section>

        <section className="preview-section">
          <SignaturePreview html={signatureHtml} />
        </section>

        <section className="output-section">
          <SignatureOutput html={signatureHtml} />
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Trusted Carrier Logistik GmbH</p>
      </footer>
    </div>
  );
}

export default App;
