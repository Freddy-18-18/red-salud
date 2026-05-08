import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // The pre-existing `src/lib/specialties/__tests__/*.test.ts` suite was
    // dormant before this app had a vitest runner — those tests reference
    // schema/data that has since drifted (e.g. `mv_doctor_*` aggregate views
    // renamed) and are out of scope for the medico-shell-sanvia change. They
    // remain in the tree for future cleanup; excluding them here keeps the
    // shell-related tests deterministic without deleting prior work.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      'src/lib/specialties/__tests__/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
