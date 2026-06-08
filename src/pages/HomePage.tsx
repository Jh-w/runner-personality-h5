// v3.3-Phase3 HomePage — self-contained, zero external API dependency
// Uses inline styles ONLY to eliminate CSS module as a failure point
// Phase 3: PK URL参数检测 + 12题
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestEngine } from '../hooks/useTestEngine';

const GEN = 'ABCD';

function buildFakeSession() {
  // Generate a deterministic session without SCF API call
  const sessionId = 'local-' + Date.now().toString(36);
  // Build randomized options for 12 questions (fallback: A-B-C-D order)
  const randomizedOptions = Array.from({ length: 12 }, (_, i) => ({
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
      // 清除URL中的pk参数，避免分享出去
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

  // Phase 3: 检测URL中的PK参数
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      textAlign: 'center',
      padding: 24,
      gap: 20,
    }}>
      <div>
        <h1 style={{ fontSize: 32, margin: 0, fontWeight: 800 }}>🏃 跑步人格测试</h1>
        <p style={{ fontSize: 16, opacity: 0.85, marginTop: 8 }}>找到属于你的跑步人设</p>
      </div>

      <div style={{ fontSize: 14, opacity: 0.7 }}>
        ⏱️ 4-5分钟 · 📝 12道题
      </div>

      <p style={{ fontSize: 14, opacity: 0.8 }}>
        已有 <strong>5.4万</strong> 人测过
      </p>

      <button
        onClick={handleStart}
        style={{
          padding: '18px 56px',
          fontSize: 22,
          fontWeight: 700,
          background: '#fff',
          color: '#ff6b35',
          border: 'none',
          borderRadius: 16,
          cursor: 'pointer',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          transition: 'transform 0.15s',
        }}
        onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
        onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        🚀 开始测试
      </button>

      <p style={{ fontSize: 12, opacity: 0.5, marginTop: 40 }}>
        跑步人格测试 · v3.3-{Date.now().toString(36)}
      </p>
    </div>
  );
}
