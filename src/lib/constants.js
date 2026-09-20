export const CATEGORIES = [
  'Electronics',
  'Clothing',
  'IDs & Cards',
  'Books',
  'Accessories',
  'Keys',
  'Bags',
  'Others',
];

export const ALLOWED_DOMAIN = 'g.cjc.edu.ph';

export const LIMITS = {
  name: 80,
  description: 600,
  location: 120,
  contact: 120,
  proof: 800,
};

/** Days before a post is auto-removed by the cleanup cron. */
export const POST_TTL_DAYS = 30;

export const FOUND_STATUS = {
  found: { label: 'Found', badge: 'badge-found' },
  claimed: { label: 'Returned', badge: 'badge-claimed' },
};

export const LOST_STATUS = {
  looking: { label: 'Still looking', badge: 'badge-looking' },
  resolved: { label: 'Recovered', badge: 'badge-resolved' },
};

export function statusMeta(item) {
  const isLost = item?.kind === 'lost' || (!item?.finderEmail && item?.posterEmail);
  const table = isLost ? LOST_STATUS : FOUND_STATUS;
  return table[item?.status] || (isLost ? LOST_STATUS.looking : FOUND_STATUS.found);
}

export function toDate(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === 'function') return ts.toDate();
  if (typeof ts.seconds === 'number') return new Date(ts.seconds * 1000);
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(ts) {
  const d = toDate(ts);
  if (!d) return 'Pending';
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeAgo(ts) {
  const d = toDate(ts);
  if (!d) return 'just now';
  const diff = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(d);
}

/** Days remaining before the cleanup job removes this post. */
export function daysLeft(expiresAt) {
  const d = toDate(expiresAt);
  if (!d) return null;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
}
