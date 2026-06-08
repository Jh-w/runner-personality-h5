import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestEngine } from '../hooks/useTestEngine';
import { getOrCreateSession } from '../hooks/useSession';
import PrivacyLink from '../components/PrivacyLink';
import styles from '../styles/pages/HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { startTest } = useTestEngine();
  const [participantCount, setParticipantCount] = useState<number>(54892);
  const pendingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    getOrCreateSession().then(session => {
      if (!cancelled) {
        setParticipantCount(session.participantCount);
        (window as any).__session = session;
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleStart = async () => {
    if (pendingRef.current) return; // 防止重复点击
    pendingRef.current = true;      // 先锁住，避免 await 期间重复触发

    try {
      let session = (window as any).__session;
      if (!session) {
        session = await getOrCreateSession();
        (window as any).__session = session;
      }
      startTest(session);
      // 直接导航，不依赖 useEffect 的 phase 监听（避免竞态）
      navigate('/test/0');
    } catch {
      // 极端情况：getOrCreateSession 彻底失败，重置锁
      pendingRef.current = false;
    }
  };

  const formatCount = (n: number) => {
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    return n.toLocaleString();
  };

  return (
    <div className={styles.page}>
      <div className={styles.trackOverlay} />

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.emoji}>🏃</span>
            <span>跑步人格测试</span>
          </h1>
          <p className={styles.subtitle}>找到属于你的跑步人设</p>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaItem}>⏱️ 3分钟</span>
          <span className={styles.metaDivider}>·</span>
          <span className={styles.metaItem}>📝 8道题</span>
        </div>

        <p className={styles.participants}>
          已有 <strong>{formatCount(participantCount)}</strong> 人测过
        </p>

        <button
          className={styles.startBtn}
          onClick={handleStart}
          aria-label="开始测试"
        >
          🚀 开始测试
        </button>
      </main>

      <footer className={styles.footer}>
        <span className={styles.brand}>跑步人格测试</span>
      </footer>

      <PrivacyLink />
    </div>
  );
}
