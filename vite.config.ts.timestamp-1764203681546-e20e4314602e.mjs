// vite.config.ts
import legacy from "file:///E:/My%20Stuff/BBCI/ziro/bbci-fe/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
import react from "file:///E:/My%20Stuff/BBCI/ziro/bbci-fe/node_modules/@vitejs/plugin-react/dist/index.js";
import WindiCSS from "file:///E:/My%20Stuff/BBCI/ziro/bbci-fe/node_modules/vite-plugin-windicss/dist/index.mjs";
import { defineConfig } from "file:///E:/My%20Stuff/BBCI/ziro/bbci-fe/node_modules/vite/dist/node/index.js";
var vite_config_default = defineConfig({
  plugins: [react(), legacy(), WindiCSS({ preflight: false })],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts"
  },
  build: {
    target: ["esnext"],
    // ✅ ensures BigInt support
    chunkSizeWarningLimit: 3e3,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: void 0
      }
    }
  },
  esbuild: {
    target: "esnext",
    // ✅ force esbuild to allow BigInt
    supported: {
      "bigint": true
      // ✅ explicitly enable BigInt literals
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxNeSBTdHVmZlxcXFxCQkNJXFxcXHppcm9cXFxcYmJjaS1mZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRTpcXFxcTXkgU3R1ZmZcXFxcQkJDSVxcXFx6aXJvXFxcXGJiY2ktZmVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L015JTIwU3R1ZmYvQkJDSS96aXJvL2JiY2ktZmUvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XHJcblxyXG5pbXBvcnQgbGVnYWN5IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1sZWdhY3lcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xyXG5pbXBvcnQgV2luZGlDU1MgZnJvbSBcInZpdGUtcGx1Z2luLXdpbmRpY3NzXCI7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBsZWdhY3koKSwgV2luZGlDU1Moe3ByZWZsaWdodDpmYWxzZX0pXSwgXHJcbiAgXHJcbiAgdGVzdDoge1xyXG4gICAgZ2xvYmFsczogdHJ1ZSxcclxuICAgIGVudmlyb25tZW50OiBcImpzZG9tXCIsXHJcbiAgICBzZXR1cEZpbGVzOiBcIi4vc3JjL3NldHVwVGVzdHMudHNcIixcclxuICB9LFxyXG4gYnVpbGQ6IHtcclxuICAgIHRhcmdldDogWydlc25leHQnXSwgLy8gXHUyNzA1IGVuc3VyZXMgQmlnSW50IHN1cHBvcnRcclxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMzAwMCxcclxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBlc2J1aWxkOiB7XHJcbiAgICB0YXJnZXQ6ICdlc25leHQnLCAvLyBcdTI3MDUgZm9yY2UgZXNidWlsZCB0byBhbGxvdyBCaWdJbnRcclxuICAgIHN1cHBvcnRlZDoge1xyXG4gICAgICAnYmlnaW50JzogdHJ1ZSwgLy8gXHUyNzA1IGV4cGxpY2l0bHkgZW5hYmxlIEJpZ0ludCBsaXRlcmFsc1xyXG4gICAgfSxcclxuICB9LFxyXG4gIFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUVBLE9BQU8sWUFBWTtBQUNuQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxjQUFjO0FBQ3JCLFNBQVMsb0JBQW9CO0FBRzdCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsT0FBTyxHQUFHLFNBQVMsRUFBQyxXQUFVLE1BQUssQ0FBQyxDQUFDO0FBQUEsRUFFeEQsTUFBTTtBQUFBLElBQ0osU0FBUztBQUFBLElBQ1QsYUFBYTtBQUFBLElBQ2IsWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNELE9BQU87QUFBQSxJQUNKLFFBQVEsQ0FBQyxRQUFRO0FBQUE7QUFBQSxJQUNqQix1QkFBdUI7QUFBQSxJQUN2QixRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsUUFBUTtBQUFBO0FBQUEsSUFDUixXQUFXO0FBQUEsTUFDVCxVQUFVO0FBQUE7QUFBQSxJQUNaO0FBQUEsRUFDRjtBQUVGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
