import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: /^react-native$/, replacement: "react-native-web" }],
    extensions: [
      ".web.mjs",
      ".mjs",
      ".web.js",
      ".js",
      ".web.jsx",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
    ],
  },
  define: { __DEV__: JSON.stringify(process.env.NODE_ENV !== "production") },
  server: {
    // One LAN endpoint for browser and phone; backends stay on loopback.
    proxy: {
      "^/api/(user(?:/|$)|approvals(?:/|$)|cede(?:/|$))": {
        target: "http://127.0.0.1:8080",
      },
      "^/api/(sync(?:/|$)|consumer(?:/|$)|consumer-confirm(?:/|$))": {
        target: "http://127.0.0.1:8090",
      },
      "/api": { target: "http://127.0.0.1:8070" },
      "/usuario-location": { target: "http://127.0.0.1:8070" },
      "/users": { target: "http://127.0.0.1:5000" },
      "/attachments": { target: "http://127.0.0.1:5000" },
      "/socket.io": { target: "http://127.0.0.1:5000", ws: true },
    },
  },
});
