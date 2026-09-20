'use client';
import Link from 'next/link';
import { timeAgo } from '@/lib/constants';
import { StatusBadge } from './ui';
import { CategoryIcon, IconPin, IconClock, IconTag } from './Icons';

export default function ItemCard({ item }) {
  const isLost = item.kind === 'lost';
  const href = isLost ? `/lost/${item.id}` : `/items/${item.id}`;
  const location = isLost ? item.lastSeenLocation : item.locationFound;

  return (
    <Link href={href} className="card" aria-label={`${item.name}, ${isLost ? 'lost alert' : 'found item'}`}>
      <div className="card-media">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" loading="lazy" decoding="async" />
        ) : (
          <div className="card-media-empty"><CategoryIcon category={item.category} /></div>
        )}
        <StatusBadge item={item} />
      </div>
      <div className="card-body">
        <div className="card-title">{item.name}</div>
        <div className="card-desc">{item.description || (isLost ? 'No description added.' : 'No description added.')}</div>
        <div className="card-meta">
          <span><IconTag /><span>{item.category || 'Uncategorised'}</span></span>
          <span><IconPin /><span>{location || 'Location not given'}</span></span>
          <span><IconClock /><span>{timeAgo(item.createdAt)}</span></span>
        </div>
      </div>
    </Link>
  );
}
