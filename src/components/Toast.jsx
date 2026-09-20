'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { IconAlert, IconCheckCircle, IconClose, IconInfo } from './Icons';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback((message, type = 'info', ttl = 4200) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, message, type }]);
    if (ttl > 0) setTimeout(() => dismiss(id), ttl);
    return id;
  }, [dismiss]);

  const api = {
    push,
    dismiss,
    success: (m) => push(m, 'success'),
    error: (m) => push(m, 'error', 6000),
    info: (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite" aria-relevant="additions">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="status">
            {t.type === 'success' ? <IconCheckCircle /> : t.type === 'error' ? <IconAlert /> : <IconInfo />}
            <span>{t.message}</span>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <IconClose />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
