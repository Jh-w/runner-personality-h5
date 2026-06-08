// ResultPage - 跑步人格测试结果页
// PRD §7.1 信息层级 + Phase 2 入场动画、雷达图、粒子效果
// Phase 3: PK Banner + PK CTA + PK URL生成

import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPersonalityByTypeId } from '../engine/personalities';
import { useTestEngine } from '../hooks/useTestEngine';
import CanvasRenderer, { renderShareCard } from '../components/CanvasRenderer';
import BestBuddy from '../components/BestBuddy';
import { findBestBuddy } from '../engine/buddyMatching';
import ShareSheet from '../components/ShareSheet';
import KeywordTags from '../components/KeywordTags';
import PrivacyLink from '../components/PrivacyLink';
import RadarChart from '../components/RadarChart';
import ParticleBackground from '../components/ParticleBackground';
import PkCard from '../components/PkCard';
import { renderPkCard } from '../components/PkCanvasRenderer';
import { useToast } from '../components/Toast';
import { useEntranceAnimation } from '../hooks/useEntranceAnimation';
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
      // Use global toast
      const Toast = (await import('../components/Toast')).showToast;
      Toast('PK链接已复制！发给好友来测吧');
    } catch {
      // fallback
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

  // ─── 入场动画 Hook ─────────────────────────────────

  const heroVisible = useEntranceAnimation(200);
  const emojiVisible = useEntranceAnimation(300);
  const nameVisible = useEntranceAnimation(500);
  const quoteVisible = useEntranceAnimation(600);
  const tagVisible = useEntranceAnimation(700);
  const roastVisible = useEntranceAnimation(950);
  const radarVisible = useEntranceAnimation(1100);
  const buddyVisible = useEntranceAnimation(1350);
  const trait0 = useEntranceAnimation(1600);
  const trait1 = useEntranceAnimation(1750);
  const trait2 = useEntranceAnimation(1900);
  const actionsVisible = useEntranceAnimation(2000);
  const wechatVisible = useEntranceAnimation(2100);

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

  // 最佳搭档（v3.1 Phase1）
  const bestBuddy = useMemo(() => findBestBuddy(personality.code), [personality.code]);

  return (
    <div className={`page ${styles.page}`} style={{
      background: `linear-gradient(180deg, ${color}18 0%, ${color}06 40%, #f8f9fa 100%)`,
    }}>
      {/* Phase 2 模块五：背景粒子 */}
      <ParticleBackground color={color} />

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

      {/* 1. Hero Card：背景展开 + Emoji + 名称 + 金句 */}
      <div
        className={`${styles.hero} ${heroVisible ? styles.heroExpanded : ''}`}
        style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
      >
        <span className={`${styles.heroEmoji} ${emojiVisible ? styles.visible : ''}`}>
          {personality.emoji}
        </span>
        <h1 className={`${styles.heroNameModule} ${nameVisible ? styles.visible : ''}`}>
          {personality.name}
        </h1>
        {personality.quote && (
          <p className={`${styles.quoteSection} ${quoteVisible ? styles.visible : ''}`}>
            「{personality.quote}」
          </p>
        )}
      </div>

      {/* 2. 关键词标签 */}
      <div
        className={tagVisible ? styles.visible : styles.entranceModule}
        style={{ width: 'calc(100% - 32px)', margin: '0 auto' }}
      >
        <KeywordTags keywords={personality.keywords} color={color} />
      </div>

      {/* 3. 吐槽区 */}
      <div className={`${styles.roastCard} ${roastVisible ? styles.visible : styles.entranceModule}`}>
        <div className={styles.roastQuote}>
          「{personality.roast}」
        </div>
      </div>

      {/* 3.5 Phase 2 模块三：四维雷达图 */}
      {radarVisible && (
        <RadarChart
          dimensionScores={personality.dimensionScores}
          color={color}
          animate={true}
          visible={radarVisible}
        />
      )}

      {/* 4. 最佳跑团搭档（v3.1 Phase1） */}
      {bestBuddy && buddyVisible && (
        <BestBuddy bestBuddy={bestBuddy} userColor={color} />
      )}

      {/* Phase 3: 「和好友 PK」CTA */}
      {!pkResult && buddyVisible && (
        <div className={styles.pkCta} onClick={handlePkShare}>
          <div className={styles.pkCtaText}>⚔️ 和好友 PK，看谁是「天选跑搭子」</div>
          <div className={styles.pkCtaSub}>生成你们的专属对比卡片 →</div>
        </div>
      )}

      {/* 5. 核心特征 */}
      <div className={`${styles.section} ${trait0 ? styles.visible : styles.entranceModule}`}>
        <h2 className={styles.sectionTitle}>核心特征</h2>
        <ol className={styles.traitList}>
          {personality.traits.map((trait, i) => {
            const traitVisible = i === 0 ? trait0 : i === 1 ? trait1 : trait2;
            return (
              <li
                key={i}
                className={`${styles.traitItem} ${traitVisible ? styles.visible : styles.entranceModule}`}
              >
                <span className={styles.traitIcon}>📌</span>
                <span>{trait}</span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* 6. 操作按钮 */}
      <div className={`${styles.actions} ${actionsVisible ? styles.visible : styles.entranceModule}`}>
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

      {/* 7. 公众号关注引导 */}
      <div
        className={`${styles.wechatCard} ${wechatVisible ? styles.visible : styles.entranceModule}`}
        style={{ borderColor: `${color}40` }}
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
