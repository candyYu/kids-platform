import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// yuwen 没有自己的 sw.js（用 web 主门户的），但也注入 build id 让 UI 显示
// 跟 web 的 sw.js 不同源，所以这里独立算一个 timestamp（用户主要在 yuwen 看）
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
    port: 5175,
    host: '127.0.0.1',
    strictPort: true,
    open: false,
    // 与 web 同款：OSS bucket Referer 防盗链只放行 candyYu.github.io，
    // dev 页面来自 127.0.0.1 直连会 403，走同源代理改写 Referer。
    proxy: {
      '/oss-proxy': {
        target: 'https://kids-platform.oss-cn-hangzhou.aliyuncs.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/oss-proxy/, ''),
        headers: { Referer: 'https://candyYu.github.io/' },
      },
    },
  },
  base: '/yuwen/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
}))
