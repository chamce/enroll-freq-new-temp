import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";
import { defineConfig } from "vite";
import { globalConst } from "vite-plugin-global-const";

const wrapperUrl = "https://irserver2.eku.edu/libraries/remote/wrapper.cjs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    eslint(),
    globalConst({
      wrapperUrl,
    }),
  ],
  build: { outDir: "Y:/Reports/pc/daytodayenrollment/", copyPublicDir: false, emptyOutDir: false },
  base: "",
});
