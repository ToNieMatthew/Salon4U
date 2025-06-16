import { defineConfig } from "vite";
import { resolve } from 'path';

import vue from "@vitejs/plugin-vue";

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'), // Set up alias for src directory
    },
  },

  plugins: [vue()],  server: {
    port: 5173,

    strictPort: true,
    host: "localhost", // 🔥 Dodaj to, jeśli go nie masz
  },
  base: "./", // Relative paths for Cloud Storage hosting
});
