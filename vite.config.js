
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(here, "src"),
      },
      {
        find: /^lucide-react$/,
        replacement: path.resolve(here, "src/libs/lucide-react.jsx"),
      },
      {
        find: "lucide-react-upstream",
        replacement: path.resolve(here, "node_modules/lucide-react"),
      },
      {
        find: /^recharts$/,
        replacement: path.resolve(here, "src/libs/recharts.jsx"),
      },
      {
        find: "recharts-upstream",
        replacement: path.resolve(here, "node_modules/recharts"),
      },
    ],
  },

  server: {
    host: "0.0.0.0",
    port: 5173,

    proxy: {
      "/api": {
        target: process.env.VITE_API_PROXY || "https://entrepreneur-desk-backend.onrender.com",
        changeOrigin: true,
      },
    },
  },
});

