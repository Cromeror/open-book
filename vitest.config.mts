import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['apps/**/*.spec.ts', 'apps/**/*.test.ts', 'libs/**/*.spec.ts', 'libs/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*-e2e/**', '**/e2e/**'],
    setupFiles: ['./apps/api/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['apps/api/src/**/*.ts', 'libs/**/*.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts',
        '**/*.d.ts',
        '**/migrations/**',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@openbook/shared': path.resolve(__dirname, './libs/shared/src'),
      '@openbook/api': path.resolve(__dirname, './apps/api/src'),
      '@openbook/web': path.resolve(__dirname, './apps/web/src'),
    },
  },
});
