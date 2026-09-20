# CJC Lost & Found

A campus lost-and-found board for Cor Jesu College. Students and staff sign in with their `@g.cjc.edu.ph` Google account, post items they found or lost, and contact each other directly to hand things over.

Live: https://cjc-lost-found.vercel.app

## What it does

- **Browse** found items and lost alerts with search, category and status filters. No sign-in needed to browse.
- **Report a found item** with a photo (compressed in the browser to under 2 MB), where it was found, and how to reach you.
- **Post a lost alert** with a description and last-seen location.
- **Claim** a found item by describing a detail only the owner knows. The finder reviews claims from *My posts* and marks the item returned after the hand-over.
- **My posts** lets each user edit, close (returned / recovered), or delete their own posts.
- **Contact details are only shown to signed-in CJC users.**
- Posts and photos are **deleted automatically after 30 days** by a daily cron job.

## Stack

- Next.js 16 (App Router) + React 19
- Firebase Auth (Google, domain-restricted), Firestore, Storage
- Vercel hosting + Vercel Cron for cleanup
- Plain CSS with design tokens (`src/app/globals.css`), no UI framework

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in Firebase keys
npm run dev
```

Open http://localhost:3000.

Without Firebase keys the app still runs: the board is empty and sign-in is disabled. Set `NEXT_PUBLIC_ENABLE_DEV_LOGIN=true` in `.env.local` to get a local-only demo account button for previewing the signed-in pages.

## Firebase setup (one time)

1. Create a Firebase project and a **Web app**. Copy the config values into `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).
2. **Authentication → Sign-in method → Google**: enable it. Under *Authorized domains* add `localhost` and your Vercel domain.
3. **Firestore**: create a database in production mode, then deploy the rules in `firestore.rules`:
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase init firestore storage   # pick the existing project, keep the rule file names
   firebase deploy --only firestore:rules,storage
   ```
   The rules restrict writes to `@g.cjc.edu.ph` accounts and only let a poster edit or delete their own posts. Claims are readable only by the claimer and the finder.
4. **Storage**: enable it and deploy `storage.rules` (same command as above).
5. **Composite index**: the first time someone opens their claims, Firestore may log a link to create an index for `claims (itemId, claimerEmail)`. Click it once.
6. **Service account** (for the cleanup cron): Project settings → Service accounts → *Generate new private key*. Put the values in `FIREBASE_ADMIN_*`.

## Deploying to Vercel

1. Import the GitHub repo in Vercel.
2. Add every variable from `.env.local.example` under *Settings → Environment variables* (leave `NEXT_PUBLIC_ENABLE_DEV_LOGIN` unset).
3. `vercel.json` schedules `GET /api/cron/cleanup` daily at 00:00 UTC. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically once `CRON_SECRET` is set.

## Data model

| Collection   | Key fields |
|--------------|-----------|
| `foundItems` | `name, category, description, locationFound, finderName, finderEmail, finderUid, finderContact, imageUrl, imagePath, imageSizeBytes, status (found \| claimed), claimCount, createdAt, expiresAt` |
| `lostAlerts` | `name, category, description, lastSeenLocation, posterName, posterEmail, posterUid, contact, status (looking \| resolved), createdAt, expiresAt` |
| `claims`     | `itemId, claimerName, claimerEmail, claimerUid, proof, contact, createdAt` |
| `meta/storage` | `usedBytes` running total, used to pause uploads near the free-tier limit |

## Project layout

```
src/
  app/            routes (page.js per route, error.js, not-found.js)
  components/     Navbar, Footer, ItemCard, LoginCard, ImageUploader, Toast, ui (Field, Modal, Notice…), Icons
  hooks/useAuth   Firebase auth context with domain check and popup→redirect fallback
  lib/            firebase init, firestore + storage helpers, constants
firestore.rules   Firestore security rules
storage.rules     Storage security rules
vercel.json       cron schedule
```
