// 临时调试 toast —— 屏幕底部弹一条，3 秒后消失
// 验证完之后会删除
let toastEl: HTMLDivElement | null = null

export function showDebugToast(msg: string, color: 'green' | 'orange' | 'red' = 'green') {
  if (typeof document === 'undefined') return
  if (toastEl) {
    toastEl.remove()
    toastEl = null
  }
  const colors = {
    green: '#10b981',
    orange: '#f59e0b',
    red: '#ef4444',
  }
  toastEl = document.createElement('div')
  toastEl.textContent = msg
  toastEl.style.cssText = `
    position: fixed; left: 8px; right: 8px; bottom: 16px;
    padding: 12px 16px;
    background: ${colors[color]};
    color: white;
    font-size: 14px;
    font-weight: 600;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 99999;
    text-align: center;
    font-family: monospace;
  `
  document.body.appendChild(toastEl)
  setTimeout(() => {
    if (toastEl) {
      toastEl.remove()
      toastEl = null
    }
  }, 3000)
}
