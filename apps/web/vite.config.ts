// import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { livestoreDevtoolsPlugin } from "@livestore/devtools-vite";
import alchemy from "alchemy/cloudflare/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tanstackRouter({}),
    react(),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   manifest: {
    //     name: "dono",
    //     short_name: "dono",
    //     description: "dono - PWA Application",
    //     theme_color: "#0c0c0c",
    //   },
    //   pwaAssets: { disabled: false, config: true },
    //   devOptions: { enabled: true },
    // }),
    livestoreDevtoolsPlugin({
      schemaPath: ["./src/stores/user/index.ts", "./src/stores/novel/index.ts"],
    }),
    alchemy(),
  ],
  worker: {
    format: "es",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
  },
  optimizeDeps: {
    exclude: ["@livestore/adapter-web"],
  },
});
