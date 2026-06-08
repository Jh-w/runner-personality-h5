// 分享文案自动生成 — PRD v3.0 §9.4
// 微信 + 小红书两套文案模板

import type { PersonalityResult } from './types';

export type SharePlatform = 'wechat' | 'xiaohongshu';

export interface ShareText {
  platform: SharePlatform;
  text: string;
}

/**
 * 根据人格结果和平台生成分享文案
 */
export function generateShareText(personality: PersonalityResult, platform: SharePlatform): string {
  switch (platform) {
    case 'wechat':
      return generateWechatText(personality);
    case 'xiaohongshu':
      return generateXiaohongshuText(personality);
  }
}

/**
 * 生成所有平台的分享文案
 */
export function generateAllShareTexts(personality: PersonalityResult): ShareText[] {
  return [
    { platform: 'wechat', text: generateWechatText(personality) },
    { platform: 'xiaohongshu', text: generateXiaohongshuText(personality) },
  ];
}

// ─── 微信/朋友圈文案模板 ──────────────────────────

function generateWechatText(personality: PersonalityResult): string {
  const [k1, k2] = personality.keywords;
  return `我的跑步人格是【${personality.name}】！#${k1} #${k2}\n测测你是什么跑步人格 →`;
}

// ─── 小红书文案模板 ───────────────────────────────

function generateXiaohongshuText(personality: PersonalityResult): string {
  return `测出了跑步人格！我是【${personality.name}】🏃\n#跑步人格测试 #跑步 #${personality.name}`;
}
