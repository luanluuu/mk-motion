import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { mkMotion } from '@luanlu/mk-motion/vite'

export default defineConfig({
  root: __dirname,
  base: './',
  build: {
    outDir: '../dist-docs',
    emptyOutDir: true,
  },
  optimizeDeps: {
    exclude: ['@luanlu/mk-motion'],
  },
  plugins: [vue(), mkMotion({ importStyle: true })],
})
