'use client';
import Link from 'next/link';

const CATEGORY_ICONS = {
  Electronics: '🔌',
  Clothing: '👕',
  'IDs & Cards': '🪪',
  Books: '📚',
  Accessories: '🎒',
  Others: '📦',
};

function timeAgo(ts) {
  if (!ts) return '';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function ItemCard({ item }) {
  const icon = CATEGORY_ICONS[item.category] || '📦';

  return (
    <Link href={`/items/${item.id}`} style={{ textDecoration: 'none' }}>
      <div className="card">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="card-img" />
        ) : (
          <div className="card-img-placeholder" style={{ fontSize: 32, opacity: 0.5 }}>{icon}</div>
        )}
        <div className="card-body">
          <div style={{ marginBottom: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
            <span
              className={`badge ${
                item.status === 'found'
                  ? 'badge-found'
                  : item.status === 'claimed'
                  ? 'badge-claimed'
                  : 'badge-looking'
              }`}
            >
              {icon} {item.status === 'found' ? 'Found' : item.status === 'claimed' ? 'Claimed' : 'Lost'}
            </span>
          </div>
          
          <div className="card-title">{item.name}</div>
          <div className="card-desc">{item.description || 'No description provided.'}</div>
          
          <div className="card-meta-grid">
            <div className="card-meta-icon">
              <span style={{ fontSize: 10 }}>📍</span> 
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {item.locationFound || item.lastSeenLocation || 'Unknown location'}
              </span>
            </div>
            <div className="card-meta-icon">
              <span style={{ fontSize: 10 }}>🗓</span> {timeAgo(item.createdAt)}
            </div>
          </div>
        </div>
        <div className="card-footer">
          <div className="card-user">
            <div className="card-user-avatar">
              {(item.userEmail || item.contactInfo || '?').charAt(0).toUpperCase()}
            </div>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
              {item.userEmail ? item.userEmail.split('@')[0] : (item.contactInfo || 'Anonymous')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
