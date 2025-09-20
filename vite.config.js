import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "localhost", // or "0.0.0.0" if you want LAN access
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // fixes issues in OneDrive/WSL
    },
    hmr: {
      host: "localhost",
      protocol: "ws",
      port: 5173,
    },
  },
});
