import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

export const dynamic = 'force-dynamic';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase Admin credentials are missing (FIREBASE_ADMIN_*).');
  }
  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

/**
 * Runs daily via Vercel Cron (see vercel.json).
 * Deletes found items and lost alerts past their `expiresAt`, plus the
 * images and claims attached to expired found items.
 */
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const app = getAdminApp();
    const db = getFirestore(app);
    const bucket = getStorage(app).bucket();
    const now = Timestamp.now();

    let deletedItems = 0;
    let deletedImages = 0;
    let deletedAlerts = 0;
    let deletedClaims = 0;
    let freedBytes = 0;

    // Expired found items (+ images + claims)
    const expiredItems = await db.collection('foundItems').where('expiresAt', '<=', now).get();
    for (const docSnap of expiredItems.docs) {
      const data = docSnap.data();

      if (data.imagePath) {
        try {
          await bucket.file(data.imagePath).delete();
          deletedImages++;
          freedBytes += data.imageSizeBytes || 0;
        } catch (e) {
          if (e.code !== 404) console.error('[Cron] Image delete error:', e.message);
        }
      }

      const claims = await db.collection('claims').where('itemId', '==', docSnap.id).get();
      const batch = db.batch();
      claims.docs.forEach((c) => batch.delete(c.ref));
      batch.delete(docSnap.ref);
      await batch.commit();
      deletedClaims += claims.size;
      deletedItems++;
    }

    if (freedBytes > 0) {
      await db.doc('meta/storage').set({ usedBytes: FieldValue.increment(-freedBytes) }, { merge: true });
    }

    // Expired lost alerts
    const expiredAlerts = await db.collection('lostAlerts').where('expiresAt', '<=', now).get();
    if (!expiredAlerts.empty) {
      const batch = db.batch();
      expiredAlerts.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      deletedAlerts = expiredAlerts.size;
    }

    console.log(`[Cron] Cleanup: ${deletedItems} items, ${deletedImages} images, ${deletedClaims} claims, ${deletedAlerts} alerts`);

    return NextResponse.json({
      success: true,
      deletedFoundItems: deletedItems,
      deletedImages,
      deletedClaims,
      deletedLostAlerts: deletedAlerts,
      freedBytes,
      ran: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
