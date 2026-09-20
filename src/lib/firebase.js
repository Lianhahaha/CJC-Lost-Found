import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/**
 * True when real Firebase keys are present. When false the app still
 * renders (empty lists, sign-in disabled) instead of hanging on
 * placeholder credentials.
 */
export const isFirebaseConfigured =
  !!apiKey && apiKey !== 'your_api_key_here' && apiKey !== 'placeholder';

const firebaseConfig = {
  apiKey: apiKey || 'placeholder',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'placeholder',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'placeholder',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
