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
    emptyOutDir: false,
    lib: {
      entry: {
        motion: resolve(__dirname, 'src/motion-entry.ts'),
        vue: resolve(__dirname, 'src/vue/index.ts'),
        vite: resolve(__dirname, 'src/vite/plugin.ts'),
        resolver: resolve(__dirname, 'src/vite/resolver.ts'),
        nuxt: resolve(__dirname, 'src/nuxt/module.ts'),
        stability: resolve(__dirname, 'src/stability.ts'),
        legacy: resolve(__dirname, 'src/legacy.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: 'entries',
    },
    rollupOptions: {
      external: ['vue', 'vite', '@nuxt/kit'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'entries.css'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    cssCodeSplit: false,
  },
  plugins: [
    vue(),
    dts({
      tsconfigPath: './tsconfig.entries.json',
      entryRoot: 'src',
      outDir: 'dist',
      copyDtsFiles: true,
      skipDiagnostics: true,
      include: [
        'src/types.d.ts',
        'src/motion-entry.ts',
        'src/legacy.ts',
        'src/vue/index.ts',
        'src/vue/composables/**/*.ts',
        'src/vite/**/*.ts',
        'src/nuxt/**/*.ts',
        'src/components-vue/**/*.ts',
        'src/components-vue/**/*.vue',
      ],
    }),
  ],
})
