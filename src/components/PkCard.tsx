// PkCard — PK Banner 组件
// v3.3-Phase3: 双人对比卡片，显示匹配度 + 评级 + 解读
import type { PkResult } from '../engine/types';
import styles from '../styles/components/PkCard.module.css';

interface PkCardProps {
  pkResult: PkResult;
  onViewFullCard?: () => void;
  onSaveImage?: () => void;
}

export default function PkCard({ pkResult, onViewFullCard, onSaveImage }: PkCardProps) {
  const stars = '⭐'.repeat(pkResult.rating);

  return (
    <div className={styles.pkBanner}>
      <div className={styles.pkTitle}>
        ⚔️ 你和「{pkResult.nameA}」的 PK 结果
      </div>

      <div className={styles.pkVsRow}>
        {/* 邀请者 */}
        <div className={styles.pkPersona}>
          <div className={styles.pkPersonaIcon}>
            👤
          </div>
          <div className={styles.pkPersonaName}>{pkResult.nameA}</div>
          <div className={styles.pkPersonaCode}>{pkResult.codeA}</div>
        </div>

        {/* 匹配度 */}
        <div className={styles.pkMatch}>
          <div className={styles.pkMatchPercent}>{pkResult.matchPercentage}%</div>
          <div className={styles.pkMatchStars}>{stars}</div>
          <div className={styles.pkMatchLabel}>匹配度</div>
        </div>

        {/* 当前用户 */}
        <div className={styles.pkPersona}>
          <div className={styles.pkPersonaIcon}>
            🫵
          </div>
          <div className={styles.pkPersonaName}>{pkResult.nameB}</div>
          <div className={styles.pkPersonaCode}>{pkResult.codeB}</div>
        </div>
      </div>

      {/* 判定 */}
      <div className={styles.pkJudgment}>{pkResult.judgment}</div>
      <div className={styles.pkDesc}>{pkResult.description}</div>

      {/* 操作按钮 */}
      <div className={styles.pkActions}>
        {onViewFullCard && (
          <button className={`${styles.pkBtn} ${styles.pkBtnPrimary}`} onClick={onViewFullCard}>
            📱 查看完整PK卡片
          </button>
        )}
        {onSaveImage && (
          <button className={`${styles.pkBtn} ${styles.pkBtnSecondary}`} onClick={onSaveImage}>
            💾 保存到相册
          </button>
        )}
      </div>
    </div>
  );
}
