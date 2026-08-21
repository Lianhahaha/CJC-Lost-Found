'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';

const ALLOWED_DOMAIN = 'g.cjc.edu.ph';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // TEMPORARY BYPASS: Firebase disabled for now to prevent infinite loading
    // on Vercel without valid API keys. We immediately resolve the loading state.
    setLoading(false);
  }, []);

  const signIn = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: ALLOWED_DOMAIN });
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      if (e.message.includes('api-key-not-valid')) {
        setAuthError('Google Sign-In requires valid Firebase API keys in .env.local. Please use Developer Bypass for now.');
      } else {
        setAuthError(e.message);
      }
    }
  };

  const signInAsDev = async () => {
    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (e) {
      // Fallback for developers testing without Firebase configuration
      console.warn("Firebase not configured or invalid keys. Falling back to local mock demo user.");
      setUser({
        uid: 'demo-dev-user-123',
        email: 'demo.dev@g.cjc.edu.ph',
        displayName: 'Demo Dev Account',
        isAnonymous: true,
        photoURL: 'https://avatars.githubusercontent.com/u/9919?v=4',
      });
    }
  };

  const signOut = async () => {
    setUser(null);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase sign out skipped:", e.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, authError, signIn, signInAsDev, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
