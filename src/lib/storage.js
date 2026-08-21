import { storage } from './firebase';
import { db } from './firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  doc,
  getDoc,
  setDoc,
  increment,
} from 'firebase/firestore';
import imageCompression from 'browser-image-compression';

// Safety cap: stop new uploads if storage exceeds 4GB (out of 5GB free)
const STORAGE_HARD_CAP_BYTES = 4 * 1024 * 1024 * 1024; // 4 GB
// Per-file limit after compression
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

const STORAGE_META_DOC = 'meta/storage';

/** Read running storage usage counter from Firestore */
export async function getStorageUsed() {
  const snap = await getDoc(doc(db, STORAGE_META_DOC));
  if (!snap.exists()) return 0;
  return snap.data().usedBytes || 0;
}

export async function incrementStorageUsed(bytes) {
  await setDoc(
    doc(db, STORAGE_META_DOC),
    { usedBytes: increment(bytes) },
    { merge: true }
  );
}

export async function decrementStorageUsed(bytes) {
  await setDoc(
    doc(db, STORAGE_META_DOC),
    { usedBytes: increment(-Math.abs(bytes)) },
    { merge: true }
  );
}

/**
 * Compress + validate + upload an image file.
 * Returns { url, path, sizeBytes } on success.
 * Throws a user-friendly Error on failure.
 */
export async function uploadItemImage(file, itemId) {
  // 1. File type check
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  // 2. Client-side compression (target ≤ 1.5 MB, max 1200px)
  const compressed = await imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 1200,
    useWebWorker: true,
  });

  // 3. Post-compression size guard
  if (compressed.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      'Image is too large even after compression. Please use a smaller image (under 2 MB).'
    );
  }

  // 4. Global storage cap check
  const used = await getStorageUsed();
  if (used + compressed.size > STORAGE_HARD_CAP_BYTES) {
    throw new Error(
      'Storage is currently at capacity. New uploads are paused to protect the free tier. ' +
        'Please try again later or contact the system admin.'
    );
  }

  // 5. Upload to Firebase Storage
  const path = `items/${itemId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, compressed, { contentType: compressed.type });
  const url = await getDownloadURL(storageRef);

  // 6. Update running counter
  await incrementStorageUsed(compressed.size);

  return { url, path, sizeBytes: compressed.size };
}

/**
 * Delete an image from Storage and decrement the usage counter.
 */
export async function deleteItemImage(path, sizeBytes = 0) {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    if (sizeBytes > 0) {
      await decrementStorageUsed(sizeBytes);
    }
  } catch (e) {
    // If already deleted, ignore
    if (e.code !== 'storage/object-not-found') throw e;
  }
}
