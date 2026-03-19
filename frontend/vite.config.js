// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ai': 'http://localhost:4000',
      '/auth': 'http://localhost:4000',
      '/upload': 'http://localhost:4000',
      '/health': 'http://localhost:4000',
    },
  },
});
