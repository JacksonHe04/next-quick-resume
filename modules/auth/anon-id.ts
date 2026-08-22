/**
 * 访客的浏览器级匿名身份（device id）。
 *
 * 未登录用户访问 /resumes 时，由 proxy.ts 下发一个持久化的 UUID cookie
 * （sayless_anon，HttpOnly、一年有效期）。该值只作为「设备级」数据隔离键：
 * 访客创建的简历落库时记录 guest_device_id = 该 UUID，userId 仍是 FK 安全
 * 的 DEMO_USER_ID；后续同浏览器再次访问时，凭同一 UUID 找回并续编同一份
 * 简历，不同设备 / 浏览器之间互不可见。
 *
 * 安全模型：UUID 本身是 122 bit 的 bearer token，与登录 cookie 同信任级别；
 * 服务端只接受符合 UUID 格式的值，杜绝把 userId 之类字符串当作设备 id 注入。
 */

export const ANON_COOKIE_NAME = "sayless_anon";
export const ANON_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

// 严格 UUID（宽松匹配各版本 v1-v8 均可接受；生成侧使用 v4）
const ANON_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidAnonRawId(value: string): boolean {
  return ANON_UUID_PATTERN.test(value);
}

/**
 * 从路由处理器收到的 Request 中读取匿名设备 id（API 路由用）。
 * 无 cookie / 格式非法一律返回 null。
 */
export function readAnonRawIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    if (name !== ANON_COOKIE_NAME) continue;
    const value = part.slice(index + 1).trim();
    return isValidAnonRawId(value) ? value : null;
  }
  return null;
}
