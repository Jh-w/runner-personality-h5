// 分享文案自动生成 — PRD v3.0 §9.4 + v3.1 Phase1 (quote + buddy)
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
  const hook = personality.hook ? `「${personality.hook}」\n` : '';
  const quote = personality.quote ? `「${personality.quote}」\n` : '';
  const shareTagline = personality.shareTagline ? `${personality.shareTagline}\n` : '';
  const buddy = personality.bestBuddy
    ? `我的最佳跑团搭档是【${personality.bestBuddy.name}】！\n`
    : '';
  return `${hook}${quote}${shareTagline}${buddy}我的跑步人格是【${personality.name}】！#${k1} #${k2}\n测测你是什么跑步人格 →`;
}

// ─── 小红书文案模板 ───────────────────────────────

function generateXiaohongshuText(personality: PersonalityResult): string {
  const tags = personality.keywords.map(k => `#${k}`).join(' ');
  const hook = personality.hook ? `「${personality.hook}」\n` : '';
  const quote = personality.quote ? `「${personality.quote}」\n` : '';
  const shareTagline = personality.shareTagline ? `${personality.shareTagline}\n` : '';
  const buddy = personality.bestBuddy
    ? `@你最想一起跑的跑友，来测测你们是不是最佳跑团搭档！\n`
    : '';
  return `${hook}${quote}测出了跑步人格！我是【${personality.name}】${personality.emoji}\n${shareTagline}${buddy}${tags}\n#跑步人格测试 #跑步`;
}
