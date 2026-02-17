import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Proxy API requests to backend during development
          '/api': {
            target: env.VITE_API_URL || 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks(id) {
              // Core React libraries
              if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
                return 'react-vendor';
              }

              // Icons library
              if (id.includes('node_modules/lucide-react')) {
                return 'icons';
              }

              // Screen components (lazy loaded by route)
              if (id.includes('/components/Screen')) {
                const match = id.match(/Screen(\d+)_/);
                if (match) {
                  return `screen-${match[1]}`;
                }
              }

              // Firebase (if used)
              if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
                return 'firebase';
              }

              // Other large dependencies
              if (id.includes('node_modules/')) {
                return 'vendor';
              }
            }
          }
        },
        chunkSizeWarningLimit: 600,
        minify: 'esbuild',
        target: 'es2020',
        cssCodeSplit: true,
        sourcemap: false, // Disable sourcemaps in production for smaller bundles
        reportCompressedSize: true
      },
      optimizeDeps: {
        include: ['react', 'react-dom', 'lucide-react']
        // Removed '@google/genai' from here - will be lazy loaded
      }
    };
});
