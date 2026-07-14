import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import { imagetools } from 'vite-imagetools'
import { defineConfig } from 'vite'
import craxConfig from './.crax/config.mjs'

// Directive-less local image imports (e.g. `import x from "./photo.jpg"`, no `?w=…`
// query) get converted to the first entry of `crax.config.mjs`'s `images.formats`.
// vite-imagetools only supports a single output format for a plain (non-`?as=picture`)
// import, so we can't apply the whole `formats` array here — explicit query
// directives (`?format=webp;avif&as=picture`) on an individual import always win,
// see .crax/image/usage.md.
const defaultImageFormat = craxConfig.images.formats[0] ?? 'webp'

export default defineConfig({
  // appType: 'spa' enables history API fallback — hard reloads on any route work in dev
  appType: 'spa',
  plugins: [
    mdx(),
    react(),
    tailwindcss(),
    imagetools({
      defaultDirectives: new URLSearchParams({ format: defaultImageFormat }),
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@crax': path.resolve(__dirname, './.crax'),
    },
  },
})
