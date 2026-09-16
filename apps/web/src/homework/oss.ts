// OSS 公共地址：生产直连 OSS 域名；dev 走 vite 同源代理（代理改写 Referer 过防盗链）。
// 只有公开域名，没有任何密钥。
const DOMAIN = (import.meta.env.VITE_OSS_PUBLIC_DOMAIN || '').replace(/\/$/, '')

export function ossUrl(key: string): string {
  return `${DOMAIN}/${key.replace(/^\//, '')}`
}

// 作业文本要求"改完立刻生效"：加分钟级 cache-bust，配合 OSS 的 no-cache 头，
// pad 每次打开/停留刷新拿到的都是最新文件。
export function homeworkUrl(): string {
  const bust = Math.floor(Date.now() / 60000)
  return `${ossUrl('homework/homework.txt')}?t=${bust}`
}
