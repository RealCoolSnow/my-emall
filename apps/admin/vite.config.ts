import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
  },
  resolve: {
    alias: {
      '@': '/src',
      shared: '../../packages/shared/src',
      coupons: '../../packages/coupons/src',
    },
  },
});
