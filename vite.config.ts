import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import dts from 'vite-plugin-dts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'UseKeep',
      fileName: 'use-keep',
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: ['react', 'use-sync-external-store'],
      output: {
        globals: {
          react: 'React',
          'use-sync-external-store': 'useSyncExternalStore'
        }
      }
    }
  }
})