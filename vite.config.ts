import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  // When running `vite preview` after build, you can proxy /api to your live Worker
  // Set env var VITE_API_PROXY to your Worker URL, e.g., https://your-subdomain.workers.dev
  preview: {
    proxy: process.env.VITE_API_PROXY
      ? {
          "/api": {
            target: process.env.VITE_API_PROXY,
            changeOrigin: true,
          },
        }
      : undefined,
  },
});
