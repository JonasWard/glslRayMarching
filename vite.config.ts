import dns from 'node:dns';
import { defineConfig } from 'vite';
dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  build: {
    outDir: './build',
  },
  base: '/glsl-ray-marching/',
  resolve: {
    alias: {
      src: '/src',
    },
  },
});
