import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    server: {
      host: "0.0.0.0",
      port: 3001,
      fs: {
        strict: false
      },
      hmr: {
        overlay: true
      },
      headers: isProduction ? {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(),
      isProduction && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html'
      })
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
        '@tanstack/react-query',
        '@supabase/supabase-js'
      ],
    },
    define: {
      // Define process for browser compatibility
      'process.env': {},
      'global': 'globalThis',
    },
    build: {
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      terserOptions: isProduction ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        format: {
          comments: false,
        },
      } : {},
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
          chunkFileNames: () => 'assets/js/[name]-[hash].js',
          entryFileNames: () => 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (/\.(woff|woff2|eot|ttf|otf)$/.test(name ?? '')) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          manualChunks: {
            // Group vendor libraries into a single chunk
            'vendor': [
              'react',
              'react-dom',
              'react-router-dom',
              'framer-motion',
              '@tanstack/react-query',
              '@supabase/supabase-js'
            ],
            // Group UI libraries
            'ui': [
              'lucide-react',
              '@radix-ui/react-slot',
              '@radix-ui/react-dialog'
            ],
            'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          },
        },
        treeshake: {
          preset: 'recommended',
        },
        external: ['node:fs', 'node:path']
      },
      target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
      outDir: 'dist'
    },

    // CSS optimization
    css: {
      devSourcemap: mode === 'development'
    },

    // Preview server configuration for production testing
    preview: {
      port: 8080,
      host: '0.0.0.0'
    }
  };
});
