import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/404.html',
          dest: '.'
        },
        {
          src: 'public/auth-callback.html',
          dest: '.'
        },
        {
          src: 'public/HasstreioLogo.png',
          dest: '.'
        },
        {
          src: 'public/favicon.png',
          dest: '.'
        }
      ]
    })
  ],
  base: '/JamesTransportes/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
