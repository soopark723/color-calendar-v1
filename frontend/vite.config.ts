import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Vite is scoped to the frontend folder; allow imports from ../shared.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared")
    }
  },
  server: {
    port: 3000, // Frontend runs on port 3000
    proxy: {
      // Proxy /api requests to backend
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    },
    fs: {
      allow: [path.resolve(__dirname, "..")]
    }
  }
});