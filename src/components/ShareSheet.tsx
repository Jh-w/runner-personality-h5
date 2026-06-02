// ShareSheet - 底部弹窗分享组件
import { useEffect, useRef } from 'react';
import styles from '../styles/components/ShareSheet.module.css';
import { showToast } from './Toast';

interface ShareSheetProps {
  visible: boolean;
  imageUrl: string | null;
  onClose: () => void;
  shareUrl?: string;
}

export default function ShareSheet({ visible, imageUrl, onClose, shareUrl }: ShareSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // 点击遮罩关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // 保存图片
  const handleSaveImage = async () => {
    if (!imageUrl) return;
    try {
      // 尝试使用 Web Share API（支持文件分享的浏览器）
      const blob = await fetch(imageUrl).then(r => r.blob());
      const file = new File([blob], 'running-personality.jpg', { type: 'image/jpeg' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '我的跑步人格' });
        showToast('已保存到相册');
      } else {
        // fallback: 下载
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = 'running-personality.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('图片已保存');
      }
    } catch (err) {
      // 用户取消分享不算错误
      if (err instanceof Error && err.name !== 'AbortError') {
        // fallback download
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
          <button className={styles.actionBtn} onClick={handleSaveImage}>
            <span className={styles.actionIcon}>📥</span>
            <span className={styles.actionLabel}>保存图片到相册</span>
          </button>

          <button className={styles.actionBtn} onClick={handleCopyLink}>
            <span className={styles.actionIcon}>🔗</span>
            <span className={styles.actionLabel}>复制链接</span>
          </button>
        </div>

        <button className={styles.cancelBtn} onClick={onClose}>
          取消
        </button>
      </div>
    </div>
  );
}
