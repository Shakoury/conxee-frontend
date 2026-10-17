import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target:
          process.env.BUKCZ_DEV_API_TARGET ||
          'https://bukcz-api.13.61.98.162.sslip.io',
        changeOrigin: false,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
});
