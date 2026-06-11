import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { mkMotion } from '../src/vite/plugin.ts'

export default defineConfig({
  root: __dirname,
  base: './',
  build: {
    outDir: '../dist-docs',
    emptyOutDir: true,
  },
  resolve: {
    alias: [
      { find: '@luanlu/mk-motion/vue', replacement: resolve(__dirname, '../src/vue/index.ts') },
      { find: '@luanlu/mk-motion/css', replacement: resolve(__dirname, '../src/style.css') },
      { find: '@luanlu/mk-motion/motion', replacement: resolve(__dirname, '../src/motion-entry.ts') },
      { find: '@luanlu/mk-motion', replacement: resolve(__dirname, '../src/index.ts') },
      { find: 'mk-motion/vue', replacement: resolve(__dirname, '../src/vue/index.ts') },
      { find: 'mk-motion/css', replacement: resolve(__dirname, '../src/style.css') },
      { find: 'mk-motion/motion', replacement: resolve(__dirname, '../src/motion-entry.ts') },
      { find: 'mk-motion', replacement: resolve(__dirname, '../src/index.ts') },
      { find: 'mk-css', replacement: resolve(__dirname, '../src/components') },
    ],
  },
  optimizeDeps: {
    exclude: ['@luanlu/mk-motion', 'mk-motion', 'mk-css'],
  },
  plugins: [vue(), mkMotion({ importStyle: true })],
})
