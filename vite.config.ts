import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react({
      // Enable SWC for faster builds
      jsxRuntime: 'automatic'
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    // Remove debugger statements in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  optimizeDeps: {
    include: [
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'papaparse',
      'recharts',
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      'lucide-react'
    ],
    exclude: ['@stagewise/toolbar-react', '@stagewise-plugins/react']
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          icons: ['lucide-react'],
          animation: ['framer-motion'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
        // Optimize chunk size
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const extType = assetInfo.name?.split('.').pop();
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType!)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      },
      external: (id) => {
        // Exclude development-only dependencies from production build
        if (mode === 'production' && (id.includes('@stagewise') || id.includes('lovable-tagger'))) {
          return true;
        }
        return false;
      }
    },
    commonjsOptions: {
      include: [/@dnd-kit\/.*/, /node_modules/],
    },
  },
  // CSS optimization
  css: {
    devSourcemap: mode === 'development',
  },
}));
