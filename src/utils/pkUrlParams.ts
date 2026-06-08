// pkUrlParams.ts — PK URL 参数工具
// v3.3-Phase3: URL参数解析、存储、清除、生成

/** URL 中的 PK 参数 */
export interface PkUrlParams {
  pk: string;
  pkSession: string;
}

const STORAGE_KEY = 'pk_inviter';

/** 从当前 URL 解析 PK 参数 */
export function parsePkParams(): PkUrlParams | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const pk = params.get('pk');
    const pkSession = params.get('pkSession');
    if (pk && pkSession) return { pk, pkSession };
  } catch { /* ignore */ }
  return null;
}

/** 存储 PK 邀请信息到 sessionStorage（跨页面保持） */
export function storePkParams(params: PkUrlParams): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch { /* ignore */ }
}

/** 读取已存储的 PK 参数 */
export function getStoredPkParams(): PkUrlParams | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** 清除 PK 参数（PK 卡片已生成后） */
export function clearPkParams(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch { /* ignore */ }
}

/** 生成带 PK 参数的分享链接 */
export function generatePkUrl(inviterCode: string, inviterSessionId: string): string {
  const base = window.location.origin + window.location.pathname;
  return `${base}?pk=${inviterCode}&pkSession=${inviterSessionId}`;
}
