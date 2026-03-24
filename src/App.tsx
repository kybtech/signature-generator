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
        <section className="explainer-section">
          <div className="explainer-content">
            <h2>How Email Signatures Work</h2>

            <p>
              Email is a historically grown service. Nowadays we generally send complex MIME encapsulated mails with
              HTML content as the main body. But there are a number of constraints because between the big silos
              (Google, Outlook, Apple) and small ISPs, plus different Mail clients (Webmail, desktop clients like
              Outlook, Thunderbird, mobile clients) they all handle e.g. images and signatures a bit different.
            </p>

            <p>Signatures are generally just something that is appended to an email.</p>

            <p>
              Images in HTML generally reference the image file, usually on an external server, but many email systems
              do not show them by default, as accessing such resources would allow the sender to track the email
              recipient. Exceptions: Google and Apple that use a sophisticated Proxy architecture that decouples the
              access to the images from reading the email.
            </p>

            <p>
              So there exists an option to embed images as the "location" (url) information in HTML directly. Problem
              solved. Not so fast. Our Webmail provider has a limit of roughly 80KB for the HTML that we can upload for
              the signature block. So this signature block will compress any images you upload to this limit by default
              to create a signature block that fits this limit. (And yes it priotizes your Photo, then our logo, and all
              the other images.)
            </p>

            <p>
              Last but least, if your Mail client allows to edit your signature with a Rich-Text HTML editor (and not
              upload a HTML file) you probably are looking for the "view/edit source" button in the styling options, so
              you can see the HTML "code" directly, delete what is there and then paste what this generator has
              generated.
            </p>

            <h3>Capabilities</h3>
            <ul>
              <li>
                <strong>Default: ksuite webmail mode</strong> - Generate a HTML signature block up to 80KB
              </li>
              <li>
                <strong>Change the signature size</strong> - If you have a different mail client that needs different
                sizes or can handle bigger signatures
              </li>
              <li>
                <strong>Special cases/odd cases</strong> - You know what you are doing → use remote URLs. That will
                allow you to generate a signature block that uses remote urls → these will look not nice by default in
                most cases.
              </li>
            </ul>
          </div>
        </section>

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
