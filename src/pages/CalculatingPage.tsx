import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestEngine } from '../hooks/useTestEngine';
import PrivacyLink from '../components/PrivacyLink';
import styles from '../styles/pages/CalculatingPage.module.css';

const LOADING_MESSAGES = [
  '正在计算你的维度得分...',
  '正在匹配你的人格类型...',
  '正在分析你的跑步偏好...',
  '正在翻你的鞋柜...',
  '正在检查你的跑步App...',
  '正在回顾你的跑团聊天记录...',
  '正在调取你的运动手表数据...',
  '正在生成你的专属人格卡...',
];

export default function CalculatingPage() {
  const navigate = useNavigate();
  const { state, setResult } = useTestEngine();
  const [messageIndex, setMessageIndex] = useState(0);
  const doneRef = useRef(false);

  // Guard: redirect if not in calculating phase
  useEffect(() => {
    if (state.phase === 'idle') {
      navigate('/', { replace: true });
      return;
    }
    if (state.phase === 'testing') {
      navigate(`/test/${state.currentQuestionIndex}`, { replace: true });
      return;
    }
    if (state.phase === 'completed' && state.result) {
      navigate(`/result/${state.result.typeId}`, { replace: true });
      return;
    }
  }, [state.phase, navigate, state.currentQuestionIndex, state.result]);

  // Rotate loading messages every 400ms
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // After 2 seconds, calculate result and navigate
  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;

    const timer = setTimeout(() => {
      if (state.phase === 'calculating') {
        setResult();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [setResult, state.phase]);

  // Watch for result being set and navigate
  useEffect(() => {
    if (state.phase === 'completed' && state.result) {
      navigate(`/result/${state.result.typeId}`, { replace: true });
    }
  }, [state.phase, state.result, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.runnerTrack}>
        <span className={styles.runner}>🏃‍♂️</span>
      </div>

      <div className={styles.content}>
        <div className={styles.ring}>
          <span className={styles.ringEmoji}>🏃</span>
        </div>
        <p className={styles.message} key={messageIndex}>
          {LOADING_MESSAGES[messageIndex]}
        </p>
      </div>

      <PrivacyLink />
    </div>
  );
}
