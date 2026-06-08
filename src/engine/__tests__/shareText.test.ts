// 分享文案单元测试 — PRD v3.0 §9.4

import { describe, it, expect } from 'vitest';
import { generateShareText, generateAllShareTexts } from '../shareText';
import { getAllPersonalities } from '../personalities';

describe('generateShareText', () => {
  const personalities = getAllPersonalities();

  // ─── 微信文案 ────────────────────────────────────

  describe('wechat', () => {
    it('文案包含人格名称', () => {
      for (const p of personalities) {
        const text = generateShareText(p, 'wechat');
        expect(text).toContain(p.name);
      }
    });

    it('文案包含关键词（至少2个）', () => {
      for (const p of personalities) {
        const text = generateShareText(p, 'wechat');
        expect(text).toContain(`#${p.keywords[0]}`);
        expect(text).toContain(`#${p.keywords[1]}`);
      }
    });

    it('文案包含行动号召「测测你是什么跑步人格」', () => {
      for (const p of personalities) {
        const text = generateShareText(p, 'wechat');
        expect(text).toContain('测测你是什么跑步人格');
      }
    });

    it('赛道卷王微信文案示例', () => {
      const p = personalities[0]; // CSDG
      const text = generateShareText(p, 'wechat');
      expect(text).toContain('我不和别人比');
      expect(text).toContain('我的跑步人格是【赛道卷王】');
      expect(text).toContain('#数据狂魔');
      expect(text).toContain('测测你是什么跑步人格');
    });
  });

  // ─── 小红书文案 ──────────────────────────────────

  describe('xiaohongshu', () => {
    it('文案包含人格名称', () => {
      for (const p of personalities) {
        const text = generateShareText(p, 'xiaohongshu');
        expect(text).toContain(p.name);
      }
    });

    it('文案包含话题标签 #跑步人格测试 #跑步', () => {
      for (const p of personalities) {
        const text = generateShareText(p, 'xiaohongshu');
        expect(text).toContain('#跑步人格测试');
        expect(text).toContain('#跑步');
      }
    });

    it('文案包含人格的关键词标签（至少1个）', () => {
      for (const p of personalities) {
        const text = generateShareText(p, 'xiaohongshu');
        expect(text).toContain(`#${p.keywords[0]}`);
      }
    });

    it('快乐散步跑者小红书文案示例', () => {
      const p = personalities[15]; // EPGM
      const text = generateShareText(p, 'xiaohongshu');
      expect(text).toContain('碳板还是薄底');
      expect(text).toContain('快乐散步跑者');
      expect(text).toContain('#跑步人格测试');
      expect(text).toContain('#跑步');
    });
  });
});

describe('generateAllShareTexts', () => {
  it('返回微信和小红书两个平台的文案', () => {
    const p = getAllPersonalities()[0];
    const texts = generateAllShareTexts(p);
    expect(texts).toHaveLength(2);
    expect(texts[0].platform).toBe('wechat');
    expect(texts[1].platform).toBe('xiaohongshu');
  });

  it('每个平台的文案都包含人格名称', () => {
    const p = getAllPersonalities()[5]; // CGDM
    const texts = generateAllShareTexts(p);
    for (const t of texts) {
      expect(t.text).toContain('团练教官');
    }
  });
});
