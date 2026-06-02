// 跑步人格测试 - 神策埋点代理
// 腾讯云SCF函数: POST /api/analytics/proxy
// 用于微信WebView环境代理第三方SDK请求

// 频率限制: 同session_id 100次/分钟
const rateLimit = new Map();
const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟

// 神策数据接收端点
const SENSORS_ENDPOINT = 'https://sensors-data.example.com/sa?project=default';

function checkRateLimit(sessionId) {
  const now = Date.now();
  const record = rateLimit.get(sessionId);
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimit.set(sessionId, { count: 1, windowStart: now });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }
  record.count++;
  return true;
}

export async function main_handler(event) {
  try {
    const body = JSON.parse(event.body || '{}');
    const { events, session_id } = body;

    if (!events || !Array.isArray(events)) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ code: 400, message: 'Invalid events format' }),
      };
    }

    // 频率限制检查
    if (session_id && !checkRateLimit(session_id)) {
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ code: 429, message: 'Rate limit exceeded' }),
      };
    }

    // 转发到神策（简化版，生产环境需要完整转发逻辑）
    try {
      const resp = await fetch(SENSORS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: events }),
        signal: AbortSignal.timeout(2000),
      });

      if (!resp.ok) {
        return {
          statusCode: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ code: 502, message: 'Upstream analytics service unavailable' }),
        };
      }

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ code: 0, message: 'ok' }),
      };
    } catch {
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ code: 502, message: 'Upstream analytics service unreachable' }),
      };
    }
  } catch {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ code: 500, message: 'Internal server error' }),
    };
  }
}
