import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8082,
    host: true, // Izinkan akses network
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001', // Pastikan ke Backend port 3001
        changeOrigin: true,
        secure: false,
      },
    },
    // INI YANG MEMPERBAIKI BLANK PAGE SAAT REFRESH:
    historyApiFallback: true, 
  },
  build: {
    outDir: 'dist',
  },
});