// ShareSheet - 底部弹窗分享组件
import { useEffect, useRef } from 'react';
import type { PersonalityResult } from '../engine/types';
import ShareText from './ShareText';
import styles from '../styles/components/ShareSheet.module.css';
import { showToast } from './Toast';

interface ShareSheetProps {
  visible: boolean;
  imageUrl: string | null;
  personality: PersonalityResult;
  onClose: () => void;
  shareUrl?: string;
}

export default function ShareSheet({ visible, imageUrl, personality, onClose, shareUrl }: ShareSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // 点击遮罩关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // 保存图片
  const handleSaveImage = async () => {
    if (!imageUrl) return;
    try {
      const blob = await fetch(imageUrl).then(r => r.blob());
      const file = new File([blob], 'running-personality.jpg', { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '我的跑步人格' });
        showToast('已保存到相册');
      } else {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'running-personality.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('图片已保存');
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'running-personality.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('图片已保存');
      }
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    const url = shareUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('链接已复制');
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  // ESC 关闭
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        ref={sheetRef}
        className={`${styles.sheet} ${visible ? styles.sheetVisible : ''}`}
      >
        <div className={styles.handle} />

        <h3 className={styles.title}>分享我的跑步人格</h3>

        {imageUrl && (
          <div className={styles.preview}>
            <img src={imageUrl} alt="分享卡片预览" className={styles.previewImg} />
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleSaveImage} aria-label="保存图片到相册">
            <span className={styles.actionIcon}>📥</span>
            <span className={styles.actionLabel}>保存图片到相册</span>
          </button>

          <button className={styles.actionBtn} onClick={handleCopyLink} aria-label="复制链接">
            <span className={styles.actionIcon}>🔗</span>
            <span className={styles.actionLabel}>复制链接</span>
          </button>
        </div>

        {/* 分享文案复制 */}
        <div className={styles.shareTextSection}>
          <ShareText personality={personality} />
        </div>

        <button className={styles.cancelBtn} onClick={onClose} aria-label="取消">
          取消
        </button>
      </div>
    </div>
  );
}
