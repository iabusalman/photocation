import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    rollupOptions: {
      output: {
        // Keep the core runtime (React + router) in one stable, cacheable
        // vendor chunk. framer-motion is intentionally NOT listed here: it is
        // only imported by the lazily-loaded Analyze page, so leaving it to
        // Vite's automatic splitting keeps it in the async graph and off the
        // initial (mobile) load instead of being preloaded by the entry.
        manualChunks: {
          react: ["react", "react-dom", "wouter"],
        },
      },
    },
  },
});
