import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { TestEngineProvider } from './hooks/useTestEngine';

const HomePage = lazy(() => import('./pages/HomePage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const CalculatingPage = lazy(() => import('./pages/CalculatingPage'));
const ResultPage = lazy(() => import('./pages/ResultPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));

function LoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary, #f5f0eb)',
      color: 'var(--text-primary, #1a1a2e)',
      fontSize: 'var(--fs-body)',
    }}>
      ⏳ 加载中...
    </div>
  );
}

export default function App() {
  return (
    <TestEngineProvider>
      <HashRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/test/:qid" element={<TestPage />} />
            <Route path="/calculating" element={<CalculatingPage />} />
            <Route path="/result/:typeId" element={<ResultPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </TestEngineProvider>
  );
}
