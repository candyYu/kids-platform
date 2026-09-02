import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const BUILD_ID = Date.now().toString()

export default defineConfig(({ command }) => ({
  define: {
    'import.meta.env.VITE_BUILD_ID': JSON.stringify(
      command === 'build' ? BUILD_ID : 'dev'
    ),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5176,
    host: '127.0.0.1',
    strictPort: true,
    open: false,
  },
  base: '/math/',
}))
