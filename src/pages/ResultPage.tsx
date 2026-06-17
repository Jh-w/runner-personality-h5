// ResultPage - 跑步人格测试结果页
// v4.0: 深色主题 + 人格渐变 Hero + 毛玻璃卡片 + stagger 入场
// PRD §7.1 信息层级 + Phase 2+3

import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPersonalityByTypeId } from '../engine/personalities';
import { useTestEngine } from '../hooks/useTestEngine';
import CanvasRenderer, { renderShareCard } from '../components/CanvasRenderer';
import { findBestBuddy } from '../engine/buddyMatching';
import ShareSheet from '../components/ShareSheet';
import KeywordTags from '../components/KeywordTags';
import PrivacyLink from '../components/PrivacyLink';
import RadarChart from '../components/RadarChart';
import PkCard from '../components/PkCard';
import DiffuseBackground from '../components/DiffuseBackground';
import TypeIllustration from '../components/TypeIllustration';
import GlassCard from '../components/GlassCard';
import { renderPkCard } from '../components/PkCanvasRenderer';
import { useToast } from '../components/Toast';
import { getTypeColorTokens, getTypeGlowValue } from '../utils/typeColorMap';
import wechatQrPlaceholder from '../assets/wechat-qr-placeholder.png';
import { calculatePkResult } from '../engine/pkMatching';
import { getStoredPkParams, clearPkParams, generatePkUrl } from '../utils/pkUrlParams';
import type { PersonalityTypeId, PersonalityResult, PkResult } from '../engine/types';
import type { PersonalityCode } from '../engine/types';
import styles from '../styles/pages/ResultPage.module.css';

export default function ResultPage() {
  const navigate = useNavigate();
  const { typeId: typeIdParam } = useParams<{ typeId: string }>();
  const { state, reset } = useTestEngine();
  const { ToastContainer } = useToast();

  const [shareVisible, setShareVisible] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [, setImageGenerating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const generatingRef = useRef(false);

  // Phase 3: PK 状态
  const [pkResult, setPkResult] = useState<PkResult | null>(null);
  const [pkCardBlob, setPkCardBlob] = useState<Blob | null>(null);
  const [pkPreviewVisible, setPkPreviewVisible] = useState(false);
  const pkProcessedRef = useRef(false);

  // 从 URL path param 获取 typeId
  const typeId = Number(typeIdParam) as PersonalityTypeId;

  const personality: PersonalityResult | null = useMemo(() => {
    try {
      return getPersonalityByTypeId(typeId);
    } catch {
      return null;
    }
  }, [typeId]);

  // Phase 3: 检测 PK 参数并计算匹配度
  useMemo(() => {
    if (!personality || pkProcessedRef.current) return;
    const pkParams = getStoredPkParams();
    if (!pkParams) return;

    pkProcessedRef.current = true;
    const result = calculatePkResult(pkParams.pk as PersonalityCode, personality.code as PersonalityCode);
    if (result) {
      setPkResult(result);
      // 后台预生成 PK 卡片
      renderPkCard(result).then(blob => {
        setPkCardBlob(blob);
      }).catch(() => { /* ignore */ });
    }
    // 清除 sessionStorage（仅使用一次）
    clearPkParams();
  }, [personality]);

  // CanvasRenderer 预生成回调
  const handleCanvasGenerated = useCallback((blob: Blob) => {
    setImageBlob(blob);
    setImageGenerating(false);
    setImageError(false);
  }, []);

  // 点击分享按钮
  const handleShare = useCallback(async () => {
    if (!personality) return;
    setShareVisible(true);

    if (!imageBlob && !generatingRef.current) {
      generatingRef.current = true;
      setImageGenerating(true);
      try {
        const blob = await renderShareCard(personality);
        setImageBlob(blob);
        setImageGenerating(false);
      } catch {
        setImageError(true);
        setImageGenerating(false);
      } finally {
        generatingRef.current = false;
      }
    }
  }, [personality, imageBlob]);

  // Phase 3: 「和好友 PK」CTA — 生成链接并复制
  const handlePkShare = useCallback(async () => {
    if (!personality || !state.sessionId) return;
    const url = generatePkUrl(personality.code, state.sessionId);
    try {
      await navigator.clipboard.writeText(url);
      const Toast = (await import('../components/Toast')).showToast;
      Toast('PK链接已复制！发给好友来测吧');
    } catch {
      const Toast = (await import('../components/Toast')).showToast;
      Toast('PK链接已生成，请手动复制分享');
    }
  }, [personality, state.sessionId]);

  // Phase 3: 查看PK完整卡片
  const handleViewPkCard = useCallback(() => {
    setPkPreviewVisible(true);
  }, []);

  // Phase 3: 保存PK卡片
  const handleSavePkImage = useCallback(async () => {
    if (!pkCardBlob) return;
    const url = URL.createObjectURL(pkCardBlob);
    try {
      const blob = await fetch(url).then(r => r.blob());
      const file = new File([blob], 'running-pk.jpg', { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: '跑步人格PK' });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'running-pk.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      const Toast = (await import('../components/Toast')).showToast;
      Toast('PK卡片已保存');
    } catch {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'running-pk.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [pkCardBlob]);

  // 再测一次
  const handleRetry = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  // 图片 URL
  const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : null;
  const pkImageUrl = pkCardBlob ? URL.createObjectURL(pkCardBlob) : null;

  if (!personality) {
    return (
      <div className={`page ${styles.page}`}>
        <div className={styles.error}>
          <p>未找到人格数据 😢</p>
          <button className="btn-primary" onClick={handleRetry}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const color = personality.color;
  const code = personality.code as PersonalityCode;
  const colorTokens = getTypeColorTokens(code);
  const glowColor = getTypeGlowValue(code);

  // 最佳搭档（v3.1 Phase1）
  const bestBuddy = useMemo(() => findBestBuddy(personality.code), [personality.code]);

  return (
    <div className={`page ${styles.page}`}>
      {/* v4.0 弥散光球背景 */}
      <DiffuseBackground glowColor={glowColor} />

      {/* 隐藏 Canvas 预生成器 */}
      <CanvasRenderer personality={personality} onGenerated={handleCanvasGenerated} />

      {/* Phase 3: PK Banner（如果有pkResult）*/}
      {pkResult && (
        <PkCard
          pkResult={pkResult}
          onViewFullCard={handleViewPkCard}
          onSaveImage={handleSavePkImage}
        />
      )}

      {/* ═══ 1. Hero 区：人格专属渐变 + heroReveal 动画 ═══ */}
      <div
        className={`${styles.hero} ${styles.heroReveal}`}
        style={{
          background: `var(${colorTokens.gradientVar})`,
        }}
      >
        {/* v4.1: Hook 开屏暴击金句 */}
        {personality.hook && (
          <p className={styles.heroHook}>「{personality.hook}」</p>
        )}
        <div className={styles.heroIllustration}>
          <TypeIllustration animalImg={personality.animalImg} animalEmoji={personality.animalEmoji} animalName={personality.animalName} size={200} color={color} />
        </div>
        <h1 className={styles.heroName}>
          {personality.name}
        </h1>
        {personality.quote && (
          <p className={styles.heroQuote}>
            「{personality.quote}」
          </p>
        )}
      </div>

      {/* ═══ 2. 关键词标签 — 48px gap ═══ */}
      <div
        className={styles.tagSection}
        style={{ animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '80ms' }}
      >
        <KeywordTags keywords={personality.keywords} color={color} />
      </div>

      {/* ═══ 3. 吐槽卡片 — 毛玻璃 + 48px gap ═══ */}
      <GlassCard
        className={styles.roastCard}
        style={{ animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '160ms' }}
      >
        <div className={styles.roastQuote}>
          「{personality.roast}」
        </div>
      </GlassCard>

      {/* ═══ 4. v4.1 维度解读 — 跑者成分解析 ═══ */}
      {personality.dimensionComments && (
        <GlassCard
          className={styles.dimensionSection}
          style={{ animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '200ms' }}
        >
          <h2 className={styles.dimensionTitle}>🔍 你的跑者成分解析</h2>
          <div className={styles.dimensionGrid}>
            <div className={styles.dimensionItem}>
              <span className={styles.dimensionLabel}>
                💥 竞技驱动 · {personality.dimensionScores.motivation < 0 ? '偏竞技' : '偏体验'}
              </span>
              <p className={styles.dimensionComment}>{personality.dimensionComments.motivation}</p>
            </div>
            <div className={styles.dimensionItem}>
              <span className={styles.dimensionLabel}>
                👥 社交模式 · {personality.dimensionScores.social < 0 ? '偏独狼' : '偏社群'}
              </span>
              <p className={styles.dimensionComment}>{personality.dimensionComments.social}</p>
            </div>
            <div className={styles.dimensionItem}>
              <span className={styles.dimensionLabel}>
                🎨 跑步风格 · {personality.dimensionScores.style < 0 ? '偏计划' : '偏随性'}
              </span>
              <p className={styles.dimensionComment}>{personality.dimensionComments.style}</p>
            </div>
            <div className={styles.dimensionItem}>
              <span className={styles.dimensionLabel}>
                🎒 仪式感 · {personality.dimensionScores.ritual < 0 ? '偏装备' : '偏极简'}
              </span>
              <p className={styles.dimensionComment}>{personality.dimensionComments.ritual}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* ═══ 5. 四维雷达图 — 48px gap ═══ */}
      <div style={{ width: '100%', animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '240ms' }}>
        <RadarChart
          dimensionScores={personality.dimensionScores}
          color={color}
          animate={true}
          visible={true}
        />
      </div>

      {/* ═══ 6. 最佳跑团搭档 — 32px gap ═══ */}
      {bestBuddy && (
        <div
          className={styles.buddySection}
          style={{ animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '320ms' }}
        >
          <h2 className={styles.buddyTitle}>🤝 你的最佳跑团搭档</h2>
          <div
            className={styles.buddyCard}
            style={{
              '--buddy-color': color,
              '--buddy-cta-bg': color,
            } as React.CSSProperties}
          >
            <span className={styles.buddyEmoji}>{bestBuddy.emoji}</span>
            <span className={styles.buddyName}>{bestBuddy.name}</span>
            <p className={styles.buddyQuote}>「{bestBuddy.quote}」</p>
            <p className={styles.buddyDescription}>{bestBuddy.pairDescription}</p>
            <button
              className={styles.buddyCta}
              onClick={async () => {
                const { showToast } = await import('../components/Toast');
                const shareUrl = `${window.location.origin}${window.location.pathname}#/?ref=${bestBuddy.typeId}`;
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  showToast('链接已复制，发给TA来测！');
                } catch {
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
              }}
              aria-label="喊TA来测"
            >
              📣 喊TA来测
            </button>
          </div>
        </div>
      )}

      {/* Phase 3: 「和好友 PK」CTA */}
      {!pkResult && bestBuddy && (
        <div style={{ width: 'calc(100% - 32px)', margin: 'var(--sp-lg) auto 0', animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '400ms' }}>
          <div
            style={{
              padding: '16px',
              background: 'var(--glass-bg)',
              border: '1px dashed var(--glass-border)',
              borderRadius: '12px',
              textAlign: 'center',
              cursor: 'pointer',
            }}
            onClick={handlePkShare}
          >
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--brand-primary)' }}>
              ⚔️ 和好友 PK，看谁是「天选跑搭子」
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              生成你们的专属对比卡片 →
            </div>
          </div>
        </div>
      )}

      {/* ═══ 6. 核心特征 — 毛玻璃卡片 ═══ */}
      <GlassCard
        className={styles.section}
        style={{ animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '480ms' }}
      >
        <h2 className={styles.sectionTitle}>核心特征</h2>
        <ol className={styles.traitList}>
          {personality.traits.map((trait, i) => (
            <li key={i} className={styles.traitItem}>
              <span className={styles.traitIcon}>📌</span>
              <span>{trait}</span>
            </li>
          ))}
        </ol>
      </GlassCard>

      {/* ═══ 7. 操作按钮 — 40px gap ═══ */}
      <div
        className={styles.actions}
        style={{ animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '560ms' }}
      >
        <button
          className={`btn-primary ${styles.shareBtn}`}
          onClick={handleShare}
          disabled={imageError}
          aria-label="生成分享图片"
        >
          📤 生成我的跑步人格分享给跑友
        </button>
        <button className="btn-secondary" onClick={handleRetry} aria-label="再测一次">
          🔄 再测一次
        </button>
      </div>

      {/* ═══ 8. 公众号关注引导 — 毛玻璃 ═══ */}
      <div
        className={styles.wechatCard}
        style={{ animation: 'staggerFadeUp 500ms var(--ease-standard) both', animationDelay: '640ms' }}
      >
        <p className={styles.wechatText}>
          📱 关注「跑步人格测试」
        </p>
        <p className={styles.wechatSubText}>
          获取完整16型解读 + 跑者专属内容
        </p>
        <div className={styles.wechatQrPlaceholder}>
          <img
            src={wechatQrPlaceholder}
            alt="关注跑步人格测试公众号"
            width={160}
            height={160}
            style={{ borderRadius: 12, display: 'block' }}
          />
        </div>
        <p className={styles.wechatHint}>👆 长按识别关注</p>
      </div>

      {/* 分享弹窗 */}
      <ShareSheet
        visible={shareVisible}
        imageUrl={imageUrl}
        personality={personality}
        onClose={() => setShareVisible(false)}
      />

      {/* Phase 3: PK 卡片全屏预览 */}
      {pkPreviewVisible && pkImageUrl && (
        <div className={styles.pkPreview} onClick={() => setPkPreviewVisible(false)}>
          <button className={styles.pkCloseBtn} onClick={() => setPkPreviewVisible(false)}>✕</button>
          <img src={pkImageUrl} alt="PK对比卡片" className={styles.pkPreviewImg} />
          <div className={styles.pkPreviewActions}>
            <button className="btn-primary" onClick={handleSavePkImage}>💾 保存到相册</button>
            <button className="btn-secondary" onClick={() => setPkPreviewVisible(false)}>关闭</button>
          </div>
        </div>
      )}

      {/* Toast 容器 */}
      <ToastContainer />

      <PrivacyLink />
    </div>
  );
}
