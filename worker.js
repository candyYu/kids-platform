// 子路径 SPA fallback：/music/* -> /music/index.html，/yuwen/* -> /yuwen/index.html
// 静态资源（assets/ 下的 js/css/图片）由 ASSETS 直接返回，不进 worker
// 根路径 / 走默认（dist/index.html）

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    let fallback = null;
    if (path === "/music" || path.startsWith("/music/")) {
      fallback = "/music/index.html";
    } else if (path === "/yuwen" || path.startsWith("/yuwen/")) {
      fallback = "/yuwen/index.html";
    }

    if (fallback) {
      // 先尝试真实文件（如 /music/assets/xxx.js）
      const assetResp = await env.ASSETS.fetch(request);
      if (assetResp.status !== 404) return assetResp;
      // 404 时回退到子应用 index.html
      return env.ASSETS.fetch(new URL(fallback, request.url));
    }

    // 根路径及其他：交给 ASSETS，Workers 内置 SPA handling
    return env.ASSETS.fetch(request);
  },
};
