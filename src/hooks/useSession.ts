// Session管理 - 获取随机化选项和session_id

import type { SessionData, RandomizedQuestion } from '../engine/types';
import { questions } from '../engine/questions';

const SESSION_KEY = 'rp_session';
const SCF_URL = 'https://api.runningtype.cn/api/session/init';
const SESSION_TTL = 30 * 60 * 1000; // 30分钟

/** Fisher-Yates洗牌 */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 客户端生成session（降级方案） */
function generateLocalSession(): SessionData {
  const sessionId = 'rp_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  const randomizedOptions: RandomizedQuestion[] = questions.map(q => {
    const shuffled = shuffle(q.options);
    return {
      question_id: q.id,
      options: shuffled.map(o => ({ id: o.id, text: o.text })),
    };
  });

  return {
    sessionId,
    randomizedOptions,
    participantCount: 54892, // 预估值
    expiresAt: new Date(Date.now() + SESSION_TTL).toISOString(),
  };
}

/** 从SCF获取session（优先），2s硬超时 + 500ms AbortSignal，失败时降级 */
async function fetchSession(): Promise<SessionData> {
  const controller = new AbortController();
  const hardTimeout = setTimeout(() => controller.abort(), 2000);

  try {
    const resp = await fetch(SCF_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(hardTimeout);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (json.code === 0 && json.data) {
      return {
        sessionId: json.data.session_id,
        randomizedOptions: json.data.randomized_options,
        participantCount: json.data.participant_count || 54892,
        expiresAt: json.data.expires_at,
      };
    }
    throw new Error('Invalid response');
  } catch {
    clearTimeout(hardTimeout);
    console.log('SCF unavailable, using local session');
    return generateLocalSession();
  }
}

/** 获取或恢复session */
export async function getOrCreateSession(): Promise<SessionData> {
  // 检查是否有缓存的session
  try {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      const session: SessionData = JSON.parse(cached);
      const expiresAt = new Date(session.expiresAt).getTime();
      if (Date.now() < expiresAt) {
        return session;
      }
    }
  } catch { /* ignore parse error */ }

  // 获取新session
  const session = await fetchSession();
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch { /* sessionStorage may be full */ }
  return session;
}

/** 清除session */
export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}
