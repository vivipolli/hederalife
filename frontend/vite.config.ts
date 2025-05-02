import { defineConfig } from 'vite'
import { nodePolyfills } from "vite-plugin-node-polyfills";

import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ["process", "stream", "util", "buffer", "events"],
      globals: {
        process: true,
        Buffer: true,
      },
    }),
  ],
  define: {
    "process.env": {},
    global: "globalThis",
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
    },
  },
});