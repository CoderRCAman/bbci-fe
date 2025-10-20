/// <reference types="vitest" />

import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import WindiCSS from "vite-plugin-windicss";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), legacy(), WindiCSS({preflight:false})], 
  
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
 build: {
    target: ['esnext'], // ✅ ensures BigInt support
    chunkSizeWarningLimit: 3000,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  esbuild: {
    target: 'esnext', // ✅ force esbuild to allow BigInt
    supported: {
      'bigint': true, // ✅ explicitly enable BigInt literals
    },
  },
  
});
