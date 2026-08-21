'use client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

export default function LoginCard({ title = "Welcome to CJC Lost & Found", subtitle = "Sign in with your institutional Google account" }) {
  const { signIn, signInAsDev, loading } = useAuth();
  const [rickrolling, setRickrolling] = useState(false);

  function intercept() {
    setRickrolling(true);
  }

  useEffect(() => {
    if (!rickrolling) return;
    const timer = setTimeout(() => {
      setRickrolling(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, [rickrolling]);

  return (
    <div className="login-card">
      <div className="login-logo">
        <img src="/cjc-logo-transparent.png?v=2" alt="CJC Logo" style={{ height: 64, width: 'auto', display: 'inline-block' }} />
      </div>

      <h1>{title}</h1>
      <p className="login-subtitle">{subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={intercept} className="google-btn">
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
        <button onClick={intercept} className="btn btn-default" style={{ width: '100%', padding: '10px', fontSize: 13, opacity: 0.7 }}>
          Developer Mode Bypass
        </button>
      </div>

      <p className="login-hint">Only @g.cjc.edu.ph emails are allowed</p>

      {rickrolling && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.92)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
        }}>
          <iframe
            width="100%"
            height="315"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&controls=0"
            title="Rickroll"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{ maxWidth: 480, borderRadius: 12, boxShadow: '0 0 60px rgba(255,80,80,0.4)' }}
          ></iframe>
        </div>
      )}

      <style jsx>{`
        .login-card {
          background: var(--canvas-subtle);
          border: 1px solid var(--border-default);
          border-radius: 16px;
          padding: 48px 40px;
          max-width: 420px;
          width: 100%;
          text-align: center;
          margin: 0 auto;
        }

        .login-logo {
          margin-bottom: 24px;
        }

        h1 {
          font-size: 22px;
          font-weight: 700;
          color: var(--fg-default);
          margin-bottom: 8px;
          letter-spacing: -0.3px;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--fg-muted);
          margin-bottom: 28px;
        }

        .login-loading {
          padding: 20px;
          display: flex;
          justify-content: center;
        }

        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 10px 20px;
          background: var(--canvas-inset);
          border: 1px solid var(--border-default);
          border-radius: 8px;
          color: var(--fg-default);
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .google-btn:hover {
          background: var(--border-muted);
          border-color: var(--fg-subtle);
        }

        .google-icon {
          flex-shrink: 0;
        }

        .login-hint {
          font-size: 13px;
          color: var(--fg-subtle);
          margin-top: 20px;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px 16px;
            border-radius: 12px;
          }
          .login-logo {
            margin-bottom: 14px;
          }
          .login-logo img {
            height: 52px !important;
          }
          h1 {
            font-size: 17px;
          }
          .login-subtitle {
            font-size: 12px;
            margin-bottom: 18px;
          }
          .google-btn {
            padding: 9px 16px;
            font-size: 13px;
          }
          .login-hint {
            font-size: 11px;
            margin-top: 14px;
          }
        }
      `}</style>
    </div>
  );
}
