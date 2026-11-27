import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
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

      allowedHosts: [
        "entrepreneurdesk.co",
        "www.entrepreneurdesk.co",
      ],

      proxy: {
        "/api": {
          target:
            env.VITE_API_PROXY ||
            "https://api.entrepreneurdesk.co",
          changeOrigin: true,
          secure: true,
        },
      },
    },
  };
});