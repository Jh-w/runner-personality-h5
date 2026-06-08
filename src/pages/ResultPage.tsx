// ResultPage - 跑步人格测试结果页
// PRD §7.1 信息层级: 人格名称→关键词→吐槽→特征→分享按钮→公众号引导→再测+隐私
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
import { useToast } from '../components/Toast';
import wechatQrPlaceholder from '../assets/wechat-qr-placeholder.png';
import type { PersonalityTypeId, PersonalityResult } from '../engine/types';
import styles from '../styles/pages/ResultPage.module.css';

export default function ResultPage() {
  const navigate = useNavigate();
  const { typeId: typeIdParam } = useParams<{ typeId: string }>();
  const { reset } = useTestEngine();
  const { ToastContainer } = useToast();

  const [shareVisible, setShareVisible] = useState(false);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [, setImageGenerating] = useState(false);
  const [imageError, setImageError] = useState(false);
  const generatingRef = useRef(false);

  // 从 URL path param 获取 typeId
  const typeId = Number(typeIdParam) as PersonalityTypeId;

  const personality: PersonalityResult | null = useMemo(() => {
    try {
      return getPersonalityByTypeId(typeId);
    } catch {
      return null;
    }
  }, [typeId]);

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

    // 如果没有预生成，强制生成
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

  // 再测一次
  const handleRetry = useCallback(() => {
    reset();
    navigate('/');
  }, [reset, navigate]);

  // 图片 URL（用于预览）
  const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : null;

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
      {/* 隐藏 Canvas 预生成器 */}
      <CanvasRenderer personality={personality} onGenerated={handleCanvasGenerated} />

      {/* 1. 顶部：Emoji + 名称 */}
      <div className={styles.hero} style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <span className={styles.heroEmoji}>{personality.emoji}</span>
        <h1 className={styles.heroName}>{personality.name}</h1>
        {personality.quote && (
          <p className={styles.quoteSection}>「{personality.quote}」</p>
        )}
      </div>

      {/* 2. 关键词标签 */}
      <KeywordTags keywords={personality.keywords} color={color} />

      {/* 3. 吐槽区 */}
      <div className={styles.roastCard}>
        <div className={styles.roastQuote}>
          「{personality.roast}」
        </div>
      </div>

      {/* 3.5 最佳跑团搭档（v3.1 Phase1） */}
      {bestBuddy && <BestBuddy bestBuddy={bestBuddy} userColor={color} />}

      {/* 4. 核心特征 */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>核心特征</h2>
        <ol className={styles.traitList}>
          {personality.traits.map((trait, i) => (
            <li key={i} className={styles.traitItem}>
              <span className={styles.traitIcon}>📌</span>
              <span>{trait}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 5. 操作按钮 */}
      <div className={styles.actions}>
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

      {/* 6. 公众号关注引导 */}
      <div className={styles.wechatCard} style={{ borderColor: `${color}40` }}>
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

      {/* Toast 容器 */}
      <ToastContainer />

      <PrivacyLink />
    </div>
  );
}
