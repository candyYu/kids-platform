// 版本号显示：让用户一眼看到当前 build 是哪个时间戳（与 math/yuwen 同款）
export function BuildBadge({ className = '' }: { className?: string }) {
  const buildId = import.meta.env.VITE_BUILD_ID || 'unknown'
  const ts = buildId.length >= 10 ? parseInt(buildId.slice(0, 10), 10) * 1000 : null
  const time = ts ? new Date(ts) : null
  const timeStr = time
    ? `${String(time.getMonth() + 1).padStart(2, '0')}-${String(time.getDate()).padStart(2, '0')} ${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`
    : ''
  const display = buildId === 'dev' ? 'dev' : (timeStr ? `v${buildId.slice(0, 10)} · ${timeStr}` : `v${buildId}`)
  return (
    <div
      className={`text-[10px] text-sky-600/60 text-center font-mono tracking-wide select-all ${className}`}
      title={`build id: ${buildId}`}
      aria-label="当前构建版本号"
    >
      {display}
    </div>
  )
}
