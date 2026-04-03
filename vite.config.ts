import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "./",
  server: {
    host: "0.0.0.0",
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: false,
      workbox: {
        globPatterns: ["**/*.{js,css,html}"],
      },
    }),
  ],
});
