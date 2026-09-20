'use client';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ALLOWED_DOMAIN } from '@/lib/constants';
import { GoogleMark } from './Icons';
import { Notice } from './ui';

export default function LoginCard({
  title = 'Sign in to continue',
  subtitle = 'Use your CJC Google account. Your name is shown on posts you make so people can reach you.',
}) {
  const { signIn, signInAsDev, devLoginEnabled, configured, authError } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    try { await signIn(); } finally { setBusy(false); }
  }

  return (
    <div className="auth-card">
      <img src="/cjc-logo-transparent.png" alt="Cor Jesu College seal" width="92" height="72" />
      <h1>{title}</h1>
      <p>{subtitle}</p>

      {!configured && (
        <Notice type="warning">
          Sign-in is not set up on this deployment yet. The administrator needs to add the Firebase keys.
        </Notice>
      )}

      {authError && <Notice type="danger">{authError}</Notice>}

      <button type="button" onClick={handleSignIn} className="btn btn-lg btn-block google-btn" disabled={busy || !configured}>
        {busy ? <span className="spinner" /> : <GoogleMark width="20" height="20" />}
        Continue with Google
      </button>

      {devLoginEnabled && (
        <button type="button" onClick={signInAsDev} className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>
          Use demo account (local only)
        </button>
      )}

      <div className="auth-foot">Only @{ALLOWED_DOMAIN} accounts are accepted.</div>
    </div>
  );
}
