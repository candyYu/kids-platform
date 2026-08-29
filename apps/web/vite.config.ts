import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// 每次 build 给 sw.js 注入唯一时间戳，确保 sw 缓存名变化
// → 激活时自动清掉旧 cache → 浏览器下次拿新代码
// vite 的 public/ 文件不经过 generateBundle，必须在 closeBundle 后改 dist 文件
function injectBuildIdPlugin(): Plugin {
  let outDir = 'dist'
  return {
    name: 'inject-build-id-into-sw',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir || 'dist'
    },
    closeBundle() {
      const swPath = path.resolve(outDir, 'sw.js')
      if (!fs.existsSync(swPath)) {
        console.warn(`[sw.js] 未找到 ${swPath}，跳过注入`)
        return
      }
      const buildId = Date.now().toString()
      const original = fs.readFileSync(swPath, 'utf-8')
      if (!original.includes('__BUILD_ID__')) {
        console.warn(`[sw.js] ${swPath} 里没找到 __BUILD_ID__ 占位符，跳过注入`)
        return
      }
      const updated = original.replace(/__BUILD_ID__/g, buildId)
      fs.writeFileSync(swPath, updated, 'utf-8')
      console.log(`[sw.js] 注入 build id: ${buildId} → ${swPath}`)
    },
  }
}

export default defineConfig({
  plugins: [react(), injectBuildIdPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
    open: true,
  },
  base: '/',
})
