import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  base: "/React/",
  plugins: [react(), svgr({ include: "**/*.svg" })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});