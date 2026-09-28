import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['test/unit/**/*.spec.ts'],
    // `npm run test:cov` : tout `src/`, même les fichiers qu'aucun test n'importe (badge du README).
    coverage: { include: ['src/**/*.ts'], reporter: ['text-summary', 'json-summary'] },
  },
});
