import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Guard: skip all Firestore calls if Firebase is not configured yet.
// This prevents the page from hanging on placeholder API keys.
const isFirebaseReady = () => {
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  return key && key !== 'your_api_key_here' && key !== 'placeholder';
};

// ── FOUND ITEMS ──────────────────────────────────────────────
export async function createFoundItem(data) {
  const ref = await addDoc(collection(db, 'foundItems'), {
    ...data,
    status: 'found',
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  });
  return ref.id;
}

export async function getFoundItems({ category, status } = {}) {
  if (!isFirebaseReady()) return [];
  let q = query(collection(db, 'foundItems'), orderBy('createdAt', 'desc'));
  if (category && category !== 'all') {
    q = query(collection(db, 'foundItems'), where('category', '==', category), orderBy('createdAt', 'desc'));
  }
  if (status && status !== 'all') {
    q = query(collection(db, 'foundItems'), where('status', '==', status), orderBy('createdAt', 'desc'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getFoundItem(id) {
  const snap = await getDoc(doc(db, 'foundItems', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateFoundItem(id, data) {
  await updateDoc(doc(db, 'foundItems', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteFoundItem(id) {
  await deleteDoc(doc(db, 'foundItems', id));
}

// ── LOST ALERTS ──────────────────────────────────────────────
export async function createLostAlert(data) {
  const ref = await addDoc(collection(db, 'lostAlerts'), {
    ...data,
    status: 'looking',
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  });
  return ref.id;
}

export async function getLostAlerts() {
  if (!isFirebaseReady()) return [];
  const q = query(collection(db, 'lostAlerts'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteLostAlert(id) {
  await deleteDoc(doc(db, 'lostAlerts', id));
}

// ── CLAIMS ───────────────────────────────────────────────────
export async function createClaim(itemId, data) {
  await addDoc(collection(db, 'claims'), {
    itemId,
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'foundItems', itemId), { status: 'claimed' });
}

// ── EXPIRATION (used by cron) ─────────────────────────────────
export async function getExpiredItems() {
  const now = Timestamp.now();
  const q = query(collection(db, 'foundItems'), where('expiresAt', '<=', now));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getExpiredAlerts() {
  const now = Timestamp.now();
  const q = query(collection(db, 'lostAlerts'), where('expiresAt', '<=', now));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
