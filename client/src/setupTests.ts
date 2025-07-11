import '@testing-library/jest-dom';
import 'reflect-metadata';

// Polyfill for TextEncoder and TextDecoder
import { TextDecoder, TextEncoder } from 'util';

// Cast to any to resolve type conflicts between Node.js and browser types
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Mock window.matchMedia for next-themes and other components that use it
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the env constants module to avoid import.meta issues
jest.mock('@/core/constants/env.ts', () => ({
  BACKEND_URL: 'http://localhost:3000',
  TOKEN_SECRET: 'test-secret',
}));

// Mock the axios-client to avoid import.meta issues
jest.mock('@/core/network/axios-client.ts', () => ({
  default: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  })),
}));

// Mock import.meta for Vite environment variables
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_BACKEND_URL: 'http://localhost:3000',
        VITE_TOKEN_SECRET: 'test-secret',
      },
    },
  },
});

// Mock modules that might cause issues in tests
jest.mock('crypto-js', () => ({
  AES: {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
  },
  enc: {
    Utf8: {},
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock;
