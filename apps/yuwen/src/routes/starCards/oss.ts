// 摘星卡真人示范录音地址（家长为 14 课录的整卡朗读，存 OSS）。
// 生产直连 OSS 域名（页面 Referer=candyYu.github.io 在防盗链白名单内）；
// dev 走 vite 的 /oss-proxy 同源代理（代理改写 Referer），否则 localhost 直连 403。
const OSS_DOMAIN =
  (import.meta.env.VITE_OSS_PUBLIC_DOMAIN as string | undefined) ||
  'https://kids-platform.oss-cn-hangzhou.aliyuncs.com'

export function starCardAudioUrl(lesson: number): string {
  const key = `star-cards/audio/star-card-l${String(lesson).padStart(2, '0')}.m4a`
  if (import.meta.env.DEV) return `/oss-proxy/${key}`
  return `${OSS_DOMAIN.replace(/\/$/, '')}/${key}`
}
