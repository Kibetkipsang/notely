import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000, // check every 1 second instead of very frequently
    ignored: ['**/node_modules/**', '**/prisma/**', '**/logs/**', '**/backend/**'],
    },
    proxy: {
      // Proxy all /api requests to your backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
