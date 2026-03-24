import type { SignatureData, SignatureAssets } from '@/types/signature';
import { generateSignatureHtml } from './signatureTemplate';
import { optimizeSvgDataUri } from './svgOptimization';
import { minifyHtml } from './htmlMinification';
import { compressImage } from './imageCompression';

export interface OptimizationOptions {
  maxSizeKB: number; // 0 = unlimited
  data: SignatureData;
  assets: SignatureAssets;
}

export interface OptimizationResult {
  html: string;
  sizeBytes: number;
  optimizationsApplied: string[];
  withinBudget: boolean;
  targetBytes: number;
}

/**
 * Calculates the byte size of a string (for HTML content).
 * Uses Blob to get accurate UTF-8 byte count.
 */
function getByteSize(str: string): number {
  return new Blob([str]).size;
}

/**
 * Optimizes a signature to fit within a size budget.
 * Applies optimizations in priority order: SVG optimization, HTML minification, photo compression.
 *
 * @param options - Optimization options including size budget and signature data
 * @returns Optimization result with final HTML and metadata
 */
export async function optimizeSignature(options: OptimizationOptions): Promise<OptimizationResult> {
  const { maxSizeKB, data, assets } = options;
  const targetBytes = maxSizeKB * 1024;
  const optimizationsApplied: string[] = [];

  // If maxSizeKB is 0, skip all optimization
  if (maxSizeKB === 0) {
    const html = generateSignatureHtml(data, assets);
    return {
      html,
      sizeBytes: getByteSize(html),
      optimizationsApplied: [],
      withinBudget: true,
      targetBytes: 0,
    };
  }

  // Step 1: Generate initial HTML
  let currentData = { ...data };
  let currentAssets = { ...assets };
  let html = generateSignatureHtml(currentData, currentAssets);
  let size = getByteSize(html);

  // If already within budget, return immediately
  if (size <= targetBytes) {
    return {
      html,
      sizeBytes: size,
      optimizationsApplied,
      withinBudget: true,
      targetBytes,
    };
  }

  // Step 2: Apply SVG optimization (company logo)
  if (currentAssets.companyLogo?.startsWith('data:image/svg+xml')) {
    try {
      const optimizedLogo = optimizeSvgDataUri(currentAssets.companyLogo);
      currentAssets = { ...currentAssets, companyLogo: optimizedLogo };
      html = generateSignatureHtml(currentData, currentAssets);
      const newSize = getByteSize(html);
      if (newSize < size) {
        size = newSize;
        optimizationsApplied.push('SVG optimization');
        if (size <= targetBytes) {
          return {
            html,
            sizeBytes: size,
            optimizationsApplied,
            withinBudget: true,
            targetBytes,
          };
        }
      }
    } catch (error) {
      console.warn('SVG optimization failed:', error);
    }
  }

  // Step 3: Apply HTML minification
  try {
    const minifiedHtml = await minifyHtml(html);
    const newSize = getByteSize(minifiedHtml);
    if (newSize < size) {
      html = minifiedHtml;
      size = newSize;
      optimizationsApplied.push('HTML minification');
      if (size <= targetBytes) {
        return {
          html,
          sizeBytes: size,
          optimizationsApplied,
          withinBudget: true,
          targetBytes,
        };
      }
    }
  } catch (error) {
    console.warn('HTML minification failed:', error);
  }

  // Step 4: Progressive photo compression (if photo exists)
  if (currentData.photoDataUri) {
    console.log('[Optimization] Starting photo compression...');
    console.log('[Optimization] Current size:', size, 'bytes, target:', targetBytes, 'bytes');
    const qualityLevels = [90, 80, 70, 60, 50];
    const originalPhotoUri = currentData.photoDataUri; // Store in const to satisfy TypeScript

    for (const quality of qualityLevels) {
      try {
        console.log(`[Optimization] Attempting compression at quality ${quality}...`);
        const compressedPhoto = await compressImage(originalPhotoUri, quality);
        console.log(
          `[Optimization] Compression succeeded. Original length: ${originalPhotoUri.length}, New length: ${compressedPhoto.length}`
        );
        currentData = { ...currentData, photoDataUri: compressedPhoto };
        html = generateSignatureHtml(currentData, currentAssets);

        // Re-apply HTML minification after photo change
        html = await minifyHtml(html);

        const newSize = getByteSize(html);
        console.log(`[Optimization] New signature size after quality ${quality}: ${newSize} bytes`);
        if (newSize < size) {
          size = newSize;
          const optimizationMsg = `Photo compression (quality: ${quality})`;
          // Replace previous compression message or add new one
          const prevCompressionIndex = optimizationsApplied.findIndex((opt) => opt.startsWith('Photo compression'));
          if (prevCompressionIndex !== -1) {
            optimizationsApplied[prevCompressionIndex] = optimizationMsg;
          } else {
            optimizationsApplied.push(optimizationMsg);
          }

          if (size <= targetBytes) {
            console.log(`[Optimization] ✅ Target achieved at quality ${quality}`);
            return {
              html,
              sizeBytes: size,
              optimizationsApplied,
              withinBudget: true,
              targetBytes,
            };
          }
        }
      } catch (error) {
        console.error(`[Optimization] ❌ Photo compression at quality ${quality} failed:`, error);
      }
    }
  }

  // If we got here, we couldn't meet the budget
  return {
    html,
    sizeBytes: size,
    optimizationsApplied,
    withinBudget: false,
    targetBytes,
  };
}
