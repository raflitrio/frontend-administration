// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    allowedHosts: [
      ".trycloudflare.com",
    ],
    host: true,
    port: 5173,
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // ✅ React & React DOM + React Router (wajib)
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'axios'
          ],

          // 💥 PDF Generation - sangat besar!
          jspdf: [
            'jspdf',
            'jspdf-autotable'
          ],

          // 💥 Excel Export - sangat besar!
          xlsx: ['xlsx'],

          // ✅ UI Components
          ui: [
            'swiper',
            'react-toastify',
            'lucide-react'
          ],

          // ✅ Jika nanti pakai utility seperti lodash, date-fns, dll — tambahkan di sini
          // utils: ['lodash', 'date-fns'],
        }
      }
    },

    // ⚠️ OPSIONAL: Naikkan batas warning sementara waktu (jika masih muncul)
    // chunkSizeWarningLimit: 1200,

    // 🔍 Tambahkan visualizer untuk analisis (opsional tapi sangat direkomendasikan)
    // Akan buka stats.html setelah build selesai
    // plugins: [
    //   react(),
    //   visualizer({ open: true }),
    // ]
  }
});