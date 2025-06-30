import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3001,
    fs: {
      strict: false
    },
    hmr: {
      overlay: true
    },
    // Only disable cache in development
    headers: mode === 'development' ? {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    } : {}
  },
  plugins: [
    react(),
    // Temporarily disabled to fix React Fragment warnings
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure TypeScript files are not included as assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp', '**/*.ico', '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.otf'],
  optimizeDeps: {
    include: [
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'papaparse',
      'recharts',
      'react-router-dom',
      'framer-motion',
      '@tanstack/react-query'
    ],
  },
  define: {
    // Define process for browser compatibility
    'process.env': {},
    'global': 'globalThis',
  },
  build: {
    // Enable production optimizations
    minify: 'terser',
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,

    // Prevent inlining of JavaScript files as data URLs
    assetsInlineLimit: 0,

    // Advanced code splitting configuration
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        // Create separate chunks for vendors and core functionality
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI framework (large bundle)
          'radix-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-navigation-menu'
          ],

          // Form and input components
          'forms': [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-switch',
            '@radix-ui/react-slider'
          ],

          // Data visualization
          'charts': ['recharts'],

          // Animations and interactions
          'motion': ['framer-motion'],

          // Data management
          'data': ['@tanstack/react-query', '@supabase/supabase-js', 'papaparse'],

          // Internationalization
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector', 'i18next-http-backend'],

          // Drag and drop functionality
          'dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],

          // Date utilities
          'date': ['date-fns', 'react-day-picker'],

          // Utility libraries
          'utils': ['clsx', 'tailwind-merge', 'class-variance-authority']
        },



        // Ensure all chunks are .js files
        chunkFileNames: (chunkInfo) => {
          return 'assets/js/[name]-[hash].js';
        },
        entryFileNames: (chunkInfo) => {
          return 'assets/js/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          // Force all assets to have proper extensions
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;

          // If it's a .tsx file somehow, treat it as .js
          if (assetInfo.name.endsWith('.tsx')) {
            return `assets/js/[name]-[hash].js`;
          }

          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },

      // External dependencies that should not be bundled
      external: ['node:fs', 'node:path']
    },

    // Terser configuration for optimal minification
    ...(mode === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      }
    }),

    commonjsOptions: {
      include: [/@dnd-kit\/.*/, /node_modules/],
    },

    // Enable source maps for production debugging but make them hidden
    sourcemap: mode === 'production' ? 'hidden' : true,

    // Target modern browsers for better optimization
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13']
  },

  // CSS optimization
  css: {
    devSourcemap: mode === 'development'
  },

  // Preview server configuration for production testing
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  }
}));
