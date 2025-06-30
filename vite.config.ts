import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      strict: false
    },
    hmr: {
      overlay: true
    }
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
  optimizeDeps: {
    include: [
      '@dnd-kit/core',
      '@dnd-kit/sortable',
      '@dnd-kit/utilities',
      'papaparse',
      'recharts'
    ],
  },
  build: {
    commonjsOptions: {
      include: [/@dnd-kit\/.*/, /node_modules/],
    },
  },
}));
