'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginCard from '@/components/LoginCard';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  return (
    <div className="login-page-container">
      {!user && !loading ? (
        <LoginCard />
      ) : user ? (
        <div style={{ textAlign: 'center', marginTop: '20vh' }}>
          <p>Signed in as <strong>{user.email}</strong></p>
          <button onClick={() => router.push('/')} className="btn btn-primary btn-lg" style={{ marginTop: 16 }}>
            Go to Home
          </button>
        </div>
      ) : (
        <div className="loading-center"><div className="spinner" /></div>
      )}
      
      <style jsx>{`
        .login-page-container {
          min-height: calc(100vh - 62px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background: var(--canvas-default);
        }
        .loading-center {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 62px);
        }
        @media (max-width: 480px) {
          .login-page-container {
            padding: 20px 12px;
            align-items: flex-start;
            padding-top: 24px;
          }
        }
      `}</style>
    </div>
  );
}
