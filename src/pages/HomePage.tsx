// v4.0 HomePage — 深色主题 + 弥散光球
// 所有 inline style 已迁移至 CSS Module
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestEngine } from '../hooks/useTestEngine';
import styles from '../styles/pages/HomePage.module.css';

const GEN = 'ABCD';

function buildFakeSession() {
  const sessionId = 'local-' + Date.now().toString(36);
  const randomizedOptions = Array.from({ length: 18 }, (_, i) => ({
    question_id: i + 1,
    options: GEN.split('').map(c => ({ id: c, text: '' })),
  }));
  return {
    sessionId,
    randomizedOptions,
    participantCount: 54892,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  };
}

/** Phase 3: 从 URL 解析 PK 参数并存储到 sessionStorage */
function parsePkParams(): { pk: string; pkSession: string } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const pk = params.get('pk');
    const pkSession = params.get('pkSession');
    if (pk && pkSession) {
      sessionStorage.setItem('pk_inviter', JSON.stringify({ pk, pkSession }));
      if (window.history.replaceState) {
        window.history.replaceState({}, '', window.location.pathname);
      }
      return { pk, pkSession };
    }
  } catch { /* ignore */ }
  return null;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { startTest } = useTestEngine();

  useEffect(() => {
    parsePkParams();
  }, []);

  const handleStart = () => {
    try {
      const session = buildFakeSession();
      startTest(session);
      navigate('/test/0');
    } catch (e) {
      alert('启动失败: ' + String(e));
    }
  };

  return (
    <div className={styles.page}>
      {/* 弥散光球 — 使用 animations.css 全局动画类 */}
      <div className={styles.diffuseOrchestra}>
        <div className={`${styles.diffuseOrb1} diffuse-orb-1`} />
        <div className={`${styles.diffuseOrb2} diffuse-orb-2`} />
        <div className={`${styles.diffuseOrb3} diffuse-orb-3`} />
      </div>

      <div className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>跑者类型测试</h1>
          <p className={styles.subtitle}>找到属于你的跑者类型</p>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaItem}>⏱️ 4-5分钟</span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>📝 18道题</span>
        </div>

        <p className={styles.participants}>
          已有 <strong>5.4万</strong> 人测过
        </p>

        <button
          className={styles.startBtn}
          onClick={handleStart}
        >
          🚀 开始测试
        </button>
      </div>

      <div className={styles.footer}>
        <span className={styles.brand}>
          跑者类型测试 · v5.4
        </span>
      </div>
    </div>
  );
}
