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
  limit,
  serverTimestamp,
  Timestamp,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { POST_TTL_DAYS } from './constants';

const FOUND = 'foundItems';
const LOST = 'lostAlerts';
const CLAIMS = 'claims';

const notConfigured = () =>
  new Error('The app is not connected to a database yet. Ask the administrator to finish the Firebase setup.');

function expiry() {
  return Timestamp.fromDate(new Date(Date.now() + POST_TTL_DAYS * 24 * 60 * 60 * 1000));
}

function mapDocs(snap, kind) {
  return snap.docs.map((d) => ({ id: d.id, kind, ...d.data() }));
}

/** Translate Firestore errors into something a student can act on. */
export function friendlyError(err) {
  const code = err?.code || '';
  if (code === 'permission-denied') return 'You do not have permission to do that. Make sure you are signed in with your CJC account.';
  if (code === 'unavailable' || code === 'deadline-exceeded') return 'Cannot reach the server right now. Check your connection and try again.';
  if (code === 'not-found') return 'That post no longer exists.';
  return err?.message || 'Something went wrong. Please try again.';
}

// ── FOUND ITEMS ──────────────────────────────────────────────
export async function createFoundItem(data) {
  if (!isFirebaseConfigured) throw notConfigured();
  const ref = await addDoc(collection(db, FOUND), {
    ...data,
    status: 'found',
    claimCount: 0,
    createdAt: serverTimestamp(),
    expiresAt: expiry(),
  });
  return ref.id;
}

export async function getFoundItems({ max = 200 } = {}) {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, FOUND), orderBy('createdAt', 'desc'), limit(max));
  return mapDocs(await getDocs(q), 'found');
}

export async function getFoundItem(id) {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, FOUND, id));
  if (!snap.exists()) return null;
  return { id: snap.id, kind: 'found', ...snap.data() };
}

export async function updateFoundItem(id, data) {
  await updateDoc(doc(db, FOUND, id), { ...data, updatedAt: serverTimestamp() });
}

/** Deletes the item and any claims attached to it. */
export async function deleteFoundItem(id) {
  const batch = writeBatch(db);
  const claims = await getDocs(query(collection(db, CLAIMS), where('itemId', '==', id)));
  claims.docs.forEach((c) => batch.delete(c.ref));
  batch.delete(doc(db, FOUND, id));
  await batch.commit();
}

// ── LOST ALERTS ──────────────────────────────────────────────
export async function createLostAlert(data) {
  if (!isFirebaseConfigured) throw notConfigured();
  const ref = await addDoc(collection(db, LOST), {
    ...data,
    status: 'looking',
    createdAt: serverTimestamp(),
    expiresAt: expiry(),
  });
  return ref.id;
}

export async function getLostAlerts({ max = 200 } = {}) {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, LOST), orderBy('createdAt', 'desc'), limit(max));
  return mapDocs(await getDocs(q), 'lost');
}

export async function getLostAlert(id) {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(doc(db, LOST, id));
  if (!snap.exists()) return null;
  return { id: snap.id, kind: 'lost', ...snap.data() };
}

export async function updateLostAlert(id, data) {
  await updateDoc(doc(db, LOST, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteLostAlert(id) {
  await deleteDoc(doc(db, LOST, id));
}

// ── CLAIMS ───────────────────────────────────────────────────
/**
 * A claim is a request from someone who believes a found item is theirs.
 * It does NOT change the item status; the finder reviews claims from
 * "My posts" and marks the item as returned once it is handed over.
 */
export async function createClaim(itemId, data) {
  if (!isFirebaseConfigured) throw notConfigured();
  await addDoc(collection(db, CLAIMS), {
    itemId,
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, FOUND, itemId), { claimCount: increment(1) });
}

export async function getClaimsForItem(itemId) {
  if (!isFirebaseConfigured) return [];
  const q = query(collection(db, CLAIMS), where('itemId', '==', itemId));
  const rows = mapDocs(await getDocs(q), 'claim');
  return rows.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
}

/** Has this user already sent a claim for this item? */
export async function hasUserClaimed(itemId, email) {
  if (!isFirebaseConfigured || !email) return false;
  const q = query(
    collection(db, CLAIMS),
    where('itemId', '==', itemId),
    where('claimerEmail', '==', email),
    limit(1),
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
