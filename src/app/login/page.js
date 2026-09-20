'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginCard from '@/components/LoginCard';

function safeNext(value) {
  // Only allow same-site relative paths
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/';
}

function LoginInner() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get('next'));

  useEffect(() => {
    if (user && !loading) router.replace(next);
  }, [user, loading, router, next]);

  return (
    <div className="auth-wrap">
      {loading || user ? (
        <div className="center"><span className="spinner" /> <span style={{ marginLeft: 10 }}>Checking your session…</span></div>
      ) : (
        <LoginCard />
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-wrap"><span className="spinner" /></div>}>
      <LoginInner />
    </Suspense>
  );
}
