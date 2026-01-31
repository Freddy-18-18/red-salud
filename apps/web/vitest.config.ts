import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '.next/',
        'src-tauri/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'test/',
      ],
    },
    testTimeout: 30000, // 30 seconds for property tests
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
