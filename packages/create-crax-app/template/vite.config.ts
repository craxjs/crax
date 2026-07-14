import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import { imagetools } from 'vite-imagetools'
import { defineConfig } from 'vite'

export default defineConfig({
  // appType: 'spa' enables history API fallback — hard reloads on any route work in dev
  appType: 'spa',
  plugins: [mdx(), react(), tailwindcss(), imagetools()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@crax': path.resolve(__dirname, './.crax'),
    },
  },
})
