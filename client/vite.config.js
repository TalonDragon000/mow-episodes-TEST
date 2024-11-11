import { defineConfig } from "vite";

export default defineConfig({
  server: {
    open: true,
    port: 5174, // Explicitly set port
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true
      }
    }
  },
  build: {
    outDir: "dist",
  },
});
