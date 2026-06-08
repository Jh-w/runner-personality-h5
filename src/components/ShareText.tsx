// ShareText - 展示微信/小红书分享文案，带复制按钮
import { useState, useMemo } from 'react';
import type { PersonalityResult } from '../engine/types';
import { generateAllShareTexts, type ShareText as ShareTextItem } from '../engine/shareText';
import { showToast } from './Toast';
import styles from '../styles/components/ShareText.module.css';

interface ShareTextProps {
  personality: PersonalityResult;
}

export default function ShareText({ personality }: ShareTextProps) {
  const texts = useMemo(() => generateAllShareTexts(personality), [personality]);
  const [activeTab, setActiveTab] = useState<'wechat' | 'xiaohongshu'>('wechat');

  const currentText = texts.find(t => t.platform === activeTab) as ShareTextItem;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentText.text);
      showToast('文案已复制');
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'wechat' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('wechat')}
          aria-label="微信文案"
        >
          💬 微信
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'xiaohongshu' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('xiaohongshu')}
          aria-label="小红书文案"
        >
          📕 小红书
        </button>
      </div>

      <div className={styles.textPreview}>
        <p className={styles.text}>{currentText.text}</p>
      </div>

      <button
        className={styles.copyBtn}
        onClick={handleCopy}
        aria-label="复制分享文案"
      >
        📋 复制文案
      </button>
    </div>
  );
}
