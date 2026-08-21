import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin (server-side only)
function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export async function GET(request) {
  // Verify Vercel Cron secret to prevent unauthorized calls
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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

    // ── Clean up expired found items ─────────────────────────
    const expiredItems = await db
      .collection('foundItems')
      .where('expiresAt', '<=', now)
      .get();

    for (const docSnap of expiredItems.docs) {
      const data = docSnap.data();
      // Delete associated image from Storage
      if (data.imagePath) {
        try {
          await bucket.file(data.imagePath).delete();
          deletedImages++;
          // Decrement counter
          await db.doc('meta/storage').set(
            { usedBytes: (data.imageSizeBytes || 0) * -1 },
            { merge: true }
          );
        } catch (e) {
          if (e.code !== 404) console.error('Image delete error:', e.message);
        }
      }
      await docSnap.ref.delete();
      deletedItems++;
    }

    // ── Clean up expired lost alerts ──────────────────────────
    const expiredAlerts = await db
      .collection('lostAlerts')
      .where('expiresAt', '<=', now)
      .get();

    for (const docSnap of expiredAlerts.docs) {
      await docSnap.ref.delete();
      deletedAlerts++;
    }

    console.log(`[Cron] Cleanup done: ${deletedItems} items, ${deletedImages} images, ${deletedAlerts} alerts deleted`);

    return NextResponse.json({
      success: true,
      deletedFoundItems: deletedItems,
      deletedImages,
      deletedLostAlerts: deletedAlerts,
      ran: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Cleanup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
