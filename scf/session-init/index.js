// 跑步人格测试 - Session初始化
// 腾讯云SCF函数: GET /api/session/init
// 运行时: Node.js 18

import crypto from 'crypto';

// 8道题的原始选项（与前端questions.ts保持同步）
const QUESTIONS = [
  { id: 1, options: ['A', 'B', 'C', 'D'] },
  { id: 2, options: ['A', 'B', 'C', 'D'] },
  { id: 3, options: ['A', 'B', 'C', 'D'] },
  { id: 4, options: ['A', 'B', 'C', 'D'] },
  { id: 5, options: ['A', 'B', 'C', 'D'] },
  { id: 6, options: ['A', 'B', 'C', 'D'] },
  { id: 7, options: ['A', 'B', 'C', 'D'] },
  { id: 8, options: ['A', 'B', 'C', 'D'] },
];

// Fisher-Yates洗牌
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 全局计数器（注意：SCF冷启动会重置，生产环境需Redis）
let participantCount = 54892;

export async function main_handler(event) {
  try {
    const sessionId = 'rp_' + crypto.randomBytes(8).toString('hex');
    
    const randomizedOptions = QUESTIONS.map(q => ({
      question_id: q.id,
      options: shuffle(q.options),
    }));

    participantCount++;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        code: 0,
        data: {
          session_id: sessionId,
          randomized_options: randomizedOptions,
          participant_count: participantCount,
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        },
        timestamp: Math.floor(Date.now() / 1000),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        code: 500,
        message: '服务暂时不可用，请稍后重试',
        timestamp: Math.floor(Date.now() / 1000),
      }),
    };
  }
}
