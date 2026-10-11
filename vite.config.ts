import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    modules: { localsConvention: "camelCaseOnly" },
  },
  build: {
    rollupOptions: {
      // два приложения: публичный сайт (SSR + гидратация) и админ-панель /admin
      input: {
        index: fileURLToPath(new URL("./index.html", import.meta.url)),
        admin: fileURLToPath(new URL("./admin.html", import.meta.url)),
      },
    },
  },
});
