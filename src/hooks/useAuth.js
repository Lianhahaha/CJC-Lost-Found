'use client';
import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { ALLOWED_DOMAIN } from '@/lib/constants';

const DEV_LOGIN = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === 'true';
const DEV_USER_KEY = 'cjc-lf-dev-user';

const AuthContext = createContext(null);

function emailAllowed(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);
}

function describeAuthError(e) {
  const code = e?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return null;
  if (code === 'auth/network-request-failed') return 'Network error. Check your connection and try again.';
  if (code === 'auth/unauthorized-domain') return 'This website is not authorised for sign-in yet. Ask the administrator to add it in Firebase.';
  if (code === 'auth/api-key-not-valid' || String(e?.message || '').includes('api-key-not-valid')) {
    return 'Sign-in is not configured yet. Ask the administrator to add the Firebase keys.';
  }
  return e?.message || 'Sign-in failed. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [authError, setAuthError] = useState(null);

  // Restore session
  useEffect(() => {
    if (!isFirebaseConfigured) {
      if (DEV_LOGIN) {
        try {
          const raw = window.sessionStorage.getItem(DEV_USER_KEY);
          if (raw) setUser(JSON.parse(raw));
        } catch { /* ignore */ }
      }
      setLoading(false);
      return;
    }

    // Complete a redirect-based sign-in (mobile WebViews that block popups)
    getRedirectResult(auth).catch((e) => {
      const msg = describeAuthError(e);
      if (msg) setAuthError(msg);
    });

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u && !emailAllowed(u.email)) {
        await firebaseSignOut(auth).catch(() => {});
        setUser(null);
        setAuthError(`Only @${ALLOWED_DOMAIN} accounts can sign in. You used ${u.email}.`);
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = useCallback(async () => {
    setAuthError(null);
    if (!isFirebaseConfigured) {
      setAuthError('Sign-in is not configured yet. Ask the administrator to add the Firebase keys.');
      return;
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: ALLOWED_DOMAIN, prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      const code = e?.code || '';
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (e2) {
          setAuthError(describeAuthError(e2));
          return;
        }
      }
      const msg = describeAuthError(e);
      if (msg) setAuthError(msg);
    }
  }, []);

  /** Local-only demo account. Enabled only with NEXT_PUBLIC_ENABLE_DEV_LOGIN=true. */
  const signInAsDev = useCallback(() => {
    if (!DEV_LOGIN) return;
    const demo = {
      uid: 'demo-dev-user',
      email: `demo.student@${ALLOWED_DOMAIN}`,
      displayName: 'Demo Student',
      photoURL: null,
      isDemo: true,
    };
    try { window.sessionStorage.setItem(DEV_USER_KEY, JSON.stringify(demo)); } catch { /* ignore */ }
    setUser(demo);
  }, []);

  const signOut = useCallback(async () => {
    try { window.sessionStorage.removeItem(DEV_USER_KEY); } catch { /* ignore */ }
    setUser(null);
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth).catch(() => {});
    }
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const value = useMemo(
    () => ({ user, loading, authError, clearAuthError, signIn, signInAsDev, signOut, devLoginEnabled: DEV_LOGIN, configured: isFirebaseConfigured }),
    [user, loading, authError, clearAuthError, signIn, signInAsDev, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
