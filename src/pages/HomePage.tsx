import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestEngine } from '../hooks/useTestEngine';
import { getOrCreateSession } from '../hooks/useSession';
import PrivacyLink from '../components/PrivacyLink';
import styles from '../styles/pages/HomePage.module.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { state, startTest } = useTestEngine();
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

  // 当 state 变为 testing 时跳转（确保 Context 已更新）
  useEffect(() => {
    if (state.phase === 'testing' && pendingRef.current) {
      pendingRef.current = false;
      navigate('/test/0');
    }
  }, [state.phase, navigate]);

  const handleStart = async () => {
    if (pendingRef.current) return; // 防止重复点击
    let session = (window as any).__session;
    if (!session) {
      session = await getOrCreateSession();
      (window as any).__session = session;
    }
    pendingRef.current = true;
    startTest(session);
    // navigate 由上面的 useEffect 处理
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
