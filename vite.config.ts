import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  resolve: {
    alias: [
      { find: 'mk-css', replacement: resolve(__dirname, 'src/components') },
    ],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MotionKit',
      fileName: (format) => {
        if (format === 'umd') return 'mk-motion.umd.cjs'
        return 'mk-motion.js'
      },
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    },
    cssCodeSplit: false
  },
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      copyDtsFiles: true,
      exclude: ['src/__tests__/**'],
    })
  ]
})
