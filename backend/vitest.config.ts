import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`.
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    // `unit` : services avec fakes, sans base ; `e2e` : sur la vraie base (DATABASE_URL), parcours HTTP (`test/e2e/`)
    // et adaptateurs Drizzle testés directement (`test/integration/`).
    projects: [
      { extends: true, test: { name: 'unit', include: ['test/unit/**/*.spec.ts'] } },
      { extends: true, test: { name: 'e2e', include: ['test/e2e/**/*.e2e-spec.ts', 'test/integration/**/*.int-spec.ts'] } },
    ],
    // `npm run test:cov` : les deux projets, sur tout `src/` (badge du README), 100 % exigé sauf les branches
    // que le compilateur ajoute aux décorateurs Nest (métadonnées d'injection, jamais prises à l'exécution).
    // Hors couverture : le démarrage du serveur et les tables (déclarations lues par Drizzle ; leurs clés étrangères
    // sont vérifiées par les migrations et par les suppressions en cascade des e2e).
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/**/*.table.ts'],
      reporter: ['text', 'json-summary'],
      thresholds: { statements: 100, functions: 100, lines: 100 },
    },
  },
});
