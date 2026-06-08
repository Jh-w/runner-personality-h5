// 跑步人格测试 v3.0 - Session初始化
// 腾讯云SCF函数: GET /api/session/init
// 运行时: Node.js 18
// 同步前端 questions.ts 新四维框架 8道题

import crypto from 'crypto';

// 8道题的原始选项（与前端 questions.ts 保持同步）
// 选项格式: { id: 'A', text: '...' }
const QUESTIONS = [
  { id: 1, options: [
    { id: 'A', text: '打开日历找时间补跑，不能让曲线掉下来' },
    { id: 'B', text: '看了3秒，然后关掉，该吃吃该喝喝' },
    { id: 'C', text: '截图发跑团群：「兄弟们这周卷不动了」' },
    { id: 'D', text: '已经卸载Runkeeper了，数据焦虑不存在的' },
  ]},
  { id: 2, options: [
    { id: 'A', text: '加速超过去，然后假装不经意地说「嘿刚才没看到你」' },
    { id: 'B', text: '保持自己节奏，终点线就是终点线' },
    { id: 'C', text: '追上去一起跑，聊两句' },
    { id: 'D', text: '走走跑跑，反正都到终点了' },
  ]},
  { id: 3, options: [
    { id: 'A', text: '秒回「我来」，已经在穿鞋了' },
    { id: 'B', text: '看到但不回，自己去跑，路线更自由' },
    { id: 'C', text: '看心情，如果路线满意就去' },
    { id: 'D', text: '开免打扰，周日早上是神圣的独跑时间' },
  ]},
  { id: 4, options: [
    { id: 'A', text: '和跑友聊天，互相吐槽刚才谁崩了' },
    { id: 'B', text: '掏出手机看数据，配速、心率、步频逐一复盘' },
    { id: 'C', text: '拍照/拍视频，准备发小红书或朋友圈' },
    { id: 'D', text: '一个人安静坐着，感受多巴胺' },
  ]},
  { id: 5, options: [
    { id: 'A', text: '装备已经摆好：衣服、袜子、能量胶、号码簿，像军训查寝一样整齐' },
    { id: 'B', text: '路线已经在脑中跑了一遍，包括哪段加速哪段放松' },
    { id: 'C', text: '明天再说，起床看心情决定跑哪里' },
    { id: 'D', text: '设了闹钟但大概率会关掉继续睡' },
  ]},
  { id: 6, options: [
    { id: 'A', text: '打开Excel，开始规划日程' },
    { id: 'B', text: '收藏，然后继续刷手机' },
    { id: 'C', text: '截图保存，虽然知道自己不会跟' },
    { id: 'D', text: '转发给朋友：「一起？」然后两个人都不了了之' },
  ]},
  { id: 7, options: [
    { id: 'A', text: '拍照发朋友圈/小红书，配文「感谢这双鞋陪我跑过的XXX公里」' },
    { id: 'B', text: '洗干净放鞋柜，偶尔还会穿' },
    { id: 'C', text: '直接扔垃圾桶，去店里买双新的' },
    { id: 'D', text: '什么退役？穿到烂为止，跑鞋哪有退役的说法' },
  ]},
  { id: 8, options: [
    { id: 'A', text: '逛遍每个展位，能量胶、盐丸、压缩袜全部补货' },
    { id: 'B', text: '领完号码簿就走，多一分钟都不待' },
    { id: 'C', text: '主要看有没有联名款/限量版周边' },
    { id: 'D', text: '找个角落坐着研究明天的赛道地图' },
  ]},
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
