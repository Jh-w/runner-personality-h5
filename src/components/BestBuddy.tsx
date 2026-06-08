// BestBuddy - 最佳跑团搭档卡片组件（PRD v3.1 Phase1）
import { useCallback } from 'react';
import type { BestBuddy as BestBuddyType } from '../engine/types';
import { useToast } from './Toast';
import styles from '../styles/pages/ResultPage.module.css';

interface BestBuddyProps {
  bestBuddy: BestBuddyType;
  userColor: string;
}

export default function BestBuddy({ bestBuddy, userColor }: BestBuddyProps) {
  const { showToast } = useToast();

  const handleCta = useCallback(async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/?ref=${bestBuddy.typeId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('链接已复制，发给TA来测！');
    } catch {
      // 降级：使用传统方式
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast('链接已复制，发给TA来测！');
    }
  }, [bestBuddy.typeId, showToast]);

  const buddyColor = userColor;

  return (
    <div className={styles.buddySection}>
      <h2 className={styles.buddyTitle}>🤝 你的最佳跑团搭档</h2>
      <div
        className={styles.buddyCard}
        style={{
          '--buddy-color': buddyColor,
          '--buddy-cta-bg': buddyColor,
        } as React.CSSProperties}
      >
        <span className={styles.buddyEmoji}>{bestBuddy.emoji}</span>
        <span className={styles.buddyName}>{bestBuddy.name}</span>
        <p className={styles.buddyQuote}>「{bestBuddy.quote}」</p>
        <p className={styles.buddyDescription}>{bestBuddy.pairDescription}</p>
        <button
          className={styles.buddyCta}
          onClick={handleCta}
          aria-label="喊TA来测"
        >
          📣 喊TA来测
        </button>
      </div>
    </div>
  );
}
