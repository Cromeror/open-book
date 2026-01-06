import { defineConfig } from 'vitest/config';
import path from 'path';

const rootDir = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  test: {
    name: 'api-e2e',
    environment: 'node',
    root: rootDir,
    include: ['src/**/*.spec.ts', 'src/**/*.e2e-spec.ts'],
    globalSetup: ['src/support/global-setup.ts'],
    setupFiles: ['src/support/test-setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
