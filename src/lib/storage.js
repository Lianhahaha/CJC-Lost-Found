import { storage, db, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, getDoc, setDoc, increment } from 'firebase/firestore';

// Safety cap: stop new uploads if storage exceeds 4 GB (out of 5 GB free tier)
const STORAGE_HARD_CAP_BYTES = 4 * 1024 * 1024 * 1024;
// Per-file limit (the uploader already compresses to well under this)
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

const STORAGE_META_DOC = 'meta/storage';

export async function getStorageUsed() {
  const snap = await getDoc(doc(db, STORAGE_META_DOC));
  if (!snap.exists()) return 0;
  return snap.data().usedBytes || 0;
}

async function adjustStorageUsed(bytes) {
  await setDoc(doc(db, STORAGE_META_DOC), { usedBytes: increment(bytes) }, { merge: true });
}

function safeName(name = 'image') {
  const base = name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(-60);
  return base || 'image';
}

/**
 * Upload an already-compressed image file for an item.
 * Returns { url, path, sizeBytes }. Throws a user-facing Error on failure.
 */
export async function uploadItemImage(file, ownerUid) {
  if (!isFirebaseConfigured) throw new Error('Image uploads are unavailable until Firebase is configured.');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed.');
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Image is too large. Please use a photo under 2 MB.');
  }

  const used = await getStorageUsed().catch(() => 0);
  if (used + file.size > STORAGE_HARD_CAP_BYTES) {
    throw new Error('Photo storage is full right now. You can still post without a photo, or try again later.');
  }

  const path = `items/${ownerUid}/${Date.now()}_${safeName(file.name)}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);

  await adjustStorageUsed(file.size).catch(() => {});

  return { url, path, sizeBytes: file.size };
}

/** Delete an image from Storage and decrement the usage counter. Silently ignores missing files. */
export async function deleteItemImage(path, sizeBytes = 0) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
    if (sizeBytes > 0) await adjustStorageUsed(-Math.abs(sizeBytes));
  } catch (e) {
    if (e.code !== 'storage/object-not-found') throw e;
  }
}
