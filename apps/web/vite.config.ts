import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss(), TanStackRouterVite({ quoteStyle: 'single' }), react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
