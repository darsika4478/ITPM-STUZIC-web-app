import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  envDir: '../backend',
  plugins: [react(),tailwindcss(),],
  server: {
    proxy: {
      '/api/jiosaavan': {
        target: 'https://www.jiosaavan.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jiosaavan/, '/api.php'),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://www.jiosaavan.com/',
        },
      },
    },
  },
})
