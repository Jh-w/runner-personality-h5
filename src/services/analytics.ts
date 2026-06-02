// 埋点服务 - MVP阶段为stub
// 生产环境接入神策SDK后替换此文件

type EventName =
  | 'page_view' | 'test_start' | 'question_view' | 'question_answer'
  | 'test_complete' | 'result_view' | 'share_click' | 'share_success'
  | 'cta_click' | 'cta_landing' | 'test_restart' | 'error_occur';

interface AnalyticsEvent {
  event: EventName;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

const eventQueue: AnalyticsEvent[] = [];
const BATCH_SIZE = 5;
const BATCH_INTERVAL = 5000; // 5秒批量上报
const PROXY_URL = 'https://sensors-proxy.runningtype.cn/api/analytics/proxy';

let flushTimer: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (eventQueue.length === 0) return;
  const batch = eventQueue.splice(0, BATCH_SIZE);
  // 使用sendBeacon确保页面关闭时也能上报
  try {
    const payload = JSON.stringify({ events: batch });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(PROXY_URL, payload);
    } else {
      // fallback: fetch with keepalive
      fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => { /* 静默失败 */ });
    }
  } catch { /* 埋点失败不影响主流程 */ }
  if (eventQueue.length > 0) {
    flushTimer = setTimeout(flush, BATCH_INTERVAL);
  }
}

export function track(event: EventName, properties?: Record<string, unknown>) {
  eventQueue.push({
    event,
    properties,
    timestamp: Date.now(),
  });
  console.log(`[Analytics] ${event}`, properties || ''); // MVP阶段用console.log代替

  if (eventQueue.length >= BATCH_SIZE && !flushTimer) {
    flushTimer = setTimeout(flush, 0);
  } else if (!flushTimer) {
    flushTimer = setTimeout(flush, BATCH_INTERVAL);
  }
}

/** 页面卸载时确保上报 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (flushTimer) clearTimeout(flushTimer);
    flush();
  });
}
