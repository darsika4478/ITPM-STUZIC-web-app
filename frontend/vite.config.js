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
      },
    },
  },
})
