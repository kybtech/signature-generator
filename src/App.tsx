import { useState, useEffect, useCallback } from 'react';
import SignatureForm from './components/SignatureForm';
import SignaturePreview from './components/SignaturePreview';
import SignatureOutput from './components/SignatureOutput';
import { generateSignatureHtml } from './utils/signatureTemplate';
import { optimizeSignature, type OptimizationResult } from './utils/sizeBudget';
import { loadSignatureAssets } from './utils/assetsLoader';
import type { SignatureData, SignatureAssets } from './types/signature';
import './App.css';

// Main application component for email signature generator
function App() {
  const [signatureData, setSignatureData] = useState<SignatureData>({
    name: '',
    title: '',
    phone: '',
    email: '',
  });
  const [assets, setAssets] = useState<SignatureAssets | null>(null);
  const [signatureHtml, setSignatureHtml] = useState<string>('');
  const [optimizationInfo, setOptimizationInfo] = useState<OptimizationResult | null>(null);
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
      // If using remote URLs, override the company logo with the remote URL
      const effectiveAssets =
        signatureData.useRemoteUrls && signatureData.companyLogoUrl
          ? { ...assets, companyLogo: signatureData.companyLogoUrl }
          : assets;

      // Debug logging to help verify remote URLs feature
      if (signatureData.useRemoteUrls) {
        console.log('[Remote URLs] Mode enabled');
        console.log('[Remote URLs] Company logo URL:', signatureData.companyLogoUrl);
        console.log('[Remote URLs] Effective logo:', effectiveAssets.companyLogo.substring(0, 100));
      }

      // Check if we need optimization
      const maxSize = signatureData.maxSizeKB ?? 0;

      if (maxSize === 0 || signatureData.useRemoteUrls) {
        // No optimization needed
        const html = generateSignatureHtml(signatureData, effectiveAssets);
        setSignatureHtml(html);
        setOptimizationInfo(null);
      } else {
        // Apply space-conscious optimization
        optimizeSignature({
          maxSizeKB: maxSize,
          data: signatureData,
          assets: effectiveAssets,
        })
          .then((result) => {
            setSignatureHtml(result.html);
            setOptimizationInfo(result);
          })
          .catch((error) => {
            console.error('Optimization failed:', error);
            // Fallback to unoptimized
            const html = generateSignatureHtml(signatureData, effectiveAssets);
            setSignatureHtml(html);
            setOptimizationInfo(null);
          });
      }
    } else {
      setSignatureHtml('');
      setOptimizationInfo(null);
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

        {optimizationInfo && (
          <section className="optimization-section">
            <div className={`optimization-info ${optimizationInfo.withinBudget ? 'success' : 'warning'}`}>
              <h3>Optimization Info</h3>
              <p>
                Signature size: <strong>{(optimizationInfo.sizeBytes / 1024).toFixed(1)} KB</strong>
                {optimizationInfo.targetBytes > 0 && ` / ${(optimizationInfo.targetBytes / 1024).toFixed(0)} KB`}
              </p>
              {optimizationInfo.optimizationsApplied.length > 0 && (
                <p>Optimizations applied: {optimizationInfo.optimizationsApplied.join(', ')}</p>
              )}
              {!optimizationInfo.withinBudget && (
                <p className="warning-text">
                  ⚠️ Signature exceeds target size. Consider reducing image size or using remote URLs.
                </p>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 Trusted Carrier Logistik GmbH</p>
      </footer>
    </div>
  );
}

export default App;
