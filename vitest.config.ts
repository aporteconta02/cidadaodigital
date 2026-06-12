import { defineConfig, mergeConfig } from 'vitest/config';
import { defineConfig as defineLovableConfig } from "@lovable.dev/vite-tanstack-config";
import react from '@vitejs/plugin-react';
import path from 'path';

export default mergeConfig(
  defineLovableConfig({
    tanstackStart: {
      server: { entry: "server" },
    },
  }),
  defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/tests/setup.ts',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  })
);
