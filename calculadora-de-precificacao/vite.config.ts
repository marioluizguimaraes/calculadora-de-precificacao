/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT) || 5173,
      strictPort: true,
      open: false,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    build: {
      target: 'es2022',
      sourcemap: mode !== 'production',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      css: true,
      passWithNoTests: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**', 'src/**/*.d.ts', 'src/main.tsx'],
        thresholds: {
          // O motor de cálculo precisa de cobertura alta: erro ali é erro de preço.
          'src/features/pricing/engine/**': { lines: 90, functions: 90, branches: 85 },
        },
      },
    },
  };
});
