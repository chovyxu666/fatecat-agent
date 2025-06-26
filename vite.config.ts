

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://192.168.124.212:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // 代理所有其他非静态资源请求到后端服务器
      '^(?!/src|/@|/node_modules|/public|/__vite|/favicon.ico).*': {
        target: 'http://192.168.124.212:5000',
        changeOrigin: true
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

