import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
// 每次 build 给 sw.js 注入唯一时间戳，确保 sw 缓存名变化
// → 激活时自动清掉旧 cache → 浏览器下次拿新代码
// vite 的 public/ 文件不经过 generateBundle，必须在 closeBundle 后改 dist 文件
function injectBuildIdPlugin() {
    var outDir = 'dist';
    return {
        name: 'inject-build-id-into-sw',
        apply: 'build',
        configResolved: function (config) {
            outDir = config.build.outDir || 'dist';
        },
        closeBundle: function () {
            var swPath = path.resolve(outDir, 'sw.js');
            if (!fs.existsSync(swPath)) {
                console.warn("[sw.js] \u672A\u627E\u5230 ".concat(swPath, "\uFF0C\u8DF3\u8FC7\u6CE8\u5165"));
                return;
            }
            var buildId = Date.now().toString();
            var original = fs.readFileSync(swPath, 'utf-8');
            if (!original.includes('__BUILD_ID__')) {
                console.warn("[sw.js] ".concat(swPath, " \u91CC\u6CA1\u627E\u5230 __BUILD_ID__ \u5360\u4F4D\u7B26\uFF0C\u8DF3\u8FC7\u6CE8\u5165"));
                return;
            }
            var updated = original.replace(/__BUILD_ID__/g, buildId);
            fs.writeFileSync(swPath, updated, 'utf-8');
            console.log("[sw.js] \u6CE8\u5165 build id: ".concat(buildId, " \u2192 ").concat(swPath));
        },
    };
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
});
