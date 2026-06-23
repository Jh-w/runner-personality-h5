// ResultPage - 跑步人格测试结果页
// v5.1: 统一暖米白主题 + emoji Hero + 结构精简
// Hero → 简单解读 → 该类型的特点(维度+风味) → 社交标语 → 操作按钮

import { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPersonalityByTypeId } from '../engine/personalities';
import { useTestEngine } from '../hooks/useTestEngine';
import CanvasRenderer, { renderShareCard } from '../components/CanvasRenderer';
import ShareSheet from '../components/ShareSheet';
import KeywordTags from '../components/KeywordTags';
import PrivacyLink from '../components/PrivacyLink';
import GlassCard from '../components/GlassCard';
import { useToast } from '../components/Toast';
import { calculateFlavor, getAllFlavorCards } from '../engine/flavorScoring';
import type { PersonalityTypeId, PersonalityResult, Answer } from '../engine/types';
import styles from '../styles/pages/ResultPage.module.css';

export default function ResultPage() {
  const navigate = useNavigate();
  const { typeId: typeIdParam } = useParams<{ typeId: string }>();
  const { state, reset } = useTestEngine();
  const { ToastContainer } = useToast();

  const [shareVisible, setShareVisible] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [imageError, setImageError] = useState(false);
  const generatingRef = useRef(false);

  const typeId = Number(typeIdParam) as PersonalityTypeId;

  const personality: PersonalityResult | null = useMemo(() => {
    try {
      return getPersonalityByTypeId(typeId);
    } catch {
      return null;
    }
  }, [typeId]);

  // Canvas pre-generate callback
  const handleCanvasGenerated = useCallback((blob: Blob) => {
    setImageBlob(blob);
  }, []);

  // Share button
  const handleShare = useCallback(async () => {
    if (!personality) return;
    setShareVisible(true);

    if (!imageBlob && !generatingRef.current) {
      generatingRef.current = true;
      try {
        const blob = await renderShareCard(personality);
        setImageBlob(blob);
      } catch {
        setImageError(true);
      } finally {
        generatingRef.current = false;
      }
    }
  }, [personality, imageBlob]);

  // Retry
  const handleRetry = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : null;

  // v4.3: 风味标签卡片
  const flavorCards = useMemo(() => {
    const answers = Object.values(state.answers) as Answer[];
    if (answers.length === 0) return null;
    try {
      const flavor = calculateFlavor(answers);
      return getAllFlavorCards(flavor);
    } catch {
      return null;
    }
  }, [state.answers]);

  if (!personality) {
    return (
      <div className={`page ${styles.page}`}>
        <div className={styles.error}>
          <p>未找到人格数据</p>
          <button className="btn-primary" onClick={handleRetry}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`page ${styles.page}`}>
      {/* 隐藏 Canvas 预生成器 */}
      <CanvasRenderer personality={personality} onGenerated={handleCanvasGenerated} />

      {/* ═══════════ 1. Hero 区（含荒诞标签） ═══════════ */}
      <div className={styles.hero}>
        <p className={styles.heroLabel}>你的跑者类型是：</p>
        <div className={styles.heroEmoji}>{personality.emoji}</div>
        <h1 className={styles.heroName}>{personality.name}</h1>
        {personality.englishName && (
          <p className={styles.heroEnglish}>{personality.englishName}</p>
        )}
        {personality.hook && (
          <p className={styles.heroHook}>{personality.hook}</p>
        )}
        <div className={styles.heroKeywords}>
          <KeywordTags keywords={personality.keywords} color={personality.color} />
        </div>
      </div>

      {/* ═══════════ 2. 简单解读（脱口秀吐槽） ═══════════ */}
      <GlassCard className={styles.roastCard}>
        <h2 className={styles.sectionTitle}>简单解读</h2>
        <div className={styles.roastText}>{personality.roast}</div>
      </GlassCard>

      {/* ═══════════ 3. 该类型的特点（五维度速写 + 风味标签） ═══════════ */}
      <GlassCard className={styles.traitsCard}>
        <h2 className={styles.sectionTitle}>该类型的特点</h2>

        {/* 五维度速写 */}
        {personality.dimensionComments && (
          <div className={styles.dimensionList}>
            <div className={styles.dimensionItem}>
              <p>{personality.dimensionComments.motivation}</p>
            </div>
            <div className={styles.dimensionItem}>
              <p>{personality.dimensionComments.social}</p>
            </div>
            <div className={styles.dimensionItem}>
              <p>{personality.dimensionComments.style}</p>
            </div>
            <div className={styles.dimensionItem}>
              <p>{personality.dimensionComments.ritual}</p>
            </div>
            <div className={styles.dimensionItem}>
              <p>{personality.dimensionComments.expression}</p>
            </div>
          </div>
        )}

        {/* 风味标签 — 融入统一卡片风格 */}
        {flavorCards && (
          <div className={styles.flavorInline}>
            <div className={styles.flavorItem}>
              <span className={styles.flavorEmoji}>{flavorCards.time.emoji}</span>
              <span className={styles.flavorLabel}>{flavorCards.time.title}</span>
              <span className={styles.flavorDesc}>{flavorCards.time.body}</span>
            </div>
            <div className={styles.flavorItem}>
              <span className={styles.flavorEmoji}>{flavorCards.injury.emoji}</span>
              <span className={styles.flavorLabel}>{flavorCards.injury.title}</span>
              <span className={styles.flavorDesc}>{flavorCards.injury.body}</span>
            </div>
            <div className={styles.flavorItem}>
              <span className={styles.flavorEmoji}>{flavorCards.diet.emoji}</span>
              <span className={styles.flavorLabel}>{flavorCards.diet.title}</span>
              <span className={styles.flavorDesc}>{flavorCards.diet.body}</span>
            </div>
          </div>
        )}
      </GlassCard>

      {/* ═══════════ 4. 社交标语 ═══════════ */}
      {personality.shareTagline && (
        <div className={styles.tagline}>
          <p>{personality.shareTagline}</p>
        </div>
      )}

      {/* ═══════════ 5. 操作按钮 ═══════════ */}
      <div className={styles.actions}>
        <button
          className={`btn-primary ${styles.shareBtn}`}
          onClick={handleShare}
          disabled={imageError}
          aria-label="生成分享图片"
        >
          生成我的跑步人格分享给跑友
        </button>
        <button className="btn-secondary" onClick={handleRetry} aria-label="再测一次">
          再测一次
        </button>
      </div>

      {/* 分享弹窗 */}
      <ShareSheet
        visible={shareVisible}
        imageUrl={imageUrl}
        personality={personality}
        onClose={() => setShareVisible(false)}
      />

      <ToastContainer />
      <PrivacyLink />
    </div>
  );
}
