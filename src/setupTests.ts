import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock clipboard API globally for all tests
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(''),
  },
  writable: true,
  configurable: true,
});
