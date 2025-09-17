import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  base: './',
  resolve: {
    alias: {
      // Replace Node.js modules with empty objects for browser compatibility
      'fs': 'data:text/javascript,export default {}',
      'fs/promises': 'data:text/javascript,export default {}',
      'path': 'data:text/javascript,export default {}',
      'url': 'data:text/javascript,export default {}',
      'util': 'data:text/javascript,export default {}',
      'assert': 'data:text/javascript,export default {}',
      'os': 'data:text/javascript,export default {}',
      'crypto': 'data:text/javascript,export default {}',
      'tty': 'data:text/javascript,export default {}',
      'perf_hooks': 'data:text/javascript,export default {}',
      'vm': 'data:text/javascript,export default {}',
      'child_process': 'data:text/javascript,export default {}',
      'module': 'data:text/javascript,export default {}',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          'react-icons': ['react-icons'],
          
          // PDF and document libraries
          'pdf-vendor': ['jspdf', 'html2canvas', 'jspdf-autotable'],
          
          // Chart libraries
          'chart-vendor': ['recharts'],
        },
      },
    },
  },
})
