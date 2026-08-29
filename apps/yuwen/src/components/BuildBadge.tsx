// 版本号显示：让用户一眼看到当前 build 是哪个时间戳
// import.meta.env.VITE_BUILD_ID 由 vite.config.ts 的 define 在 build 时注入
// dev 模式下显示 "dev"
// 显示格式：v1788007023841 · 08-29 12:37
// 时间戳转成"MM-DD HH:MM"，人看得懂，也能定位"是不是今天改的"
export function BuildBadge({ className = '' }: { className?: string }) {
  const buildId = import.meta.env.VITE_BUILD_ID || 'unknown'
  // 时间戳后 8-13 位是毫秒（Date.now() 返回 13 位）
  // 取前 10 位当 Unix 秒，转本地时间
  const ts = buildId.length >= 10 ? parseInt(buildId.slice(0, 10), 10) * 1000 : null
  const time = ts ? new Date(ts) : null
  const timeStr = time
    ? `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
    : ''
  // dev 模式：buildId = 'dev'，不显示数字
  const display = buildId === 'dev' ? 'dev' : (timeStr ? `v${buildId.slice(0, 10)} · ${timeStr}` : `v${buildId}`)
  return (
    <div
      className={`text-[10px] text-pig-400/70 text-center font-mono tracking-wide select-all ${className}`}
      title={`build id: ${buildId}`}
      aria-label="当前构建版本号"
    >
      {display}
    </div>
  )
}
