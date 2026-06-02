// Toast 提示组件 - 自动消失
import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/components/Toast.module.css';

export interface ToastOptions {
  message: string;
  duration?: number;
}

let toastId = 0;

// 全局 toast 管理器
type ToastListener = (options: ToastOptions & { id: number }) => void;
const listeners: Set<ToastListener> = new Set();

export function showToast(message: string, duration = 2000) {
  const id = ++toastId;
  listeners.forEach(fn => fn({ message, duration, id }));
}

export function useToast() {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);

  useEffect(() => {
    const listener: ToastListener = (options) => {
      setToasts(prev => [...prev, options]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== options.id));
      }, options.duration ?? 2000);
    };
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const ToastContainer = useCallback(() => (
    <div className={styles.container}>
      {toasts.map(t => (
        <div key={t.id} className={styles.toast}>
          {t.message}
        </div>
      ))}
    </div>
  ), [toasts]);

  return { ToastContainer, showToast };
}
