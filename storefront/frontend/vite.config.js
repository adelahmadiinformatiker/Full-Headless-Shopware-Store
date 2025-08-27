import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    server: { proxy: { "/api": "http://localhost:4000" } },
  },
  define: {
    "process.env": process.env,
  },
  // server: {
  //   open: true,
  //   historyApiFallback: true,
  // },
});
