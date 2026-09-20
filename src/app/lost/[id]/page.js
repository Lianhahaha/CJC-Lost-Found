'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getLostAlert, friendlyError } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState, Notice, StatusBadge } from '@/components/ui';
import { CategoryIcon, IconArrowLeft, IconBell, IconEdit } from '@/components/Icons';
import { formatDate, daysLeft } from '@/lib/constants';

export default function LostAlertDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItem(await getLostAlert(id));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  if (loading || authLoading) return <div className="center"><span className="spinner" /></div>;

  if (error) {
    return (
      <div className="container page">
        <Notice type="danger">{error} <button type="button" className="btn btn-secondary btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button></Notice>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container page">
        <EmptyState icon={<IconBell />} title="This alert is no longer listed" actions={<Link href="/" className="btn btn-primary">Back to board</Link>}>
          The owner may have recovered the item, deleted the alert, or it expired after 30 days.
        </EmptyState>
      </div>
    );
  }

  const isOwner = user && user.email === item.posterEmail;
  const recovered = item.status === 'resolved';
  const left = daysLeft(item.expiresAt);

  return (
    <div className="container page">
      <Link href="/" className="back-link"><IconArrowLeft /> Back to board</Link>

      <div className="detail">
        <div className="detail-media">
          <div className="card-media-empty"><CategoryIcon category={item.category} /></div>
        </div>

        <div>
          <div className="detail-title-row">
            <h1>{item.name}</h1>
            <StatusBadge item={item} />
          </div>
          <p style={{ color: 'var(--ink-3)', marginTop: 8, fontSize: 14 }}>
            Lost alert · posted {formatDate(item.createdAt)}
            {left !== null && !recovered ? ` · listed for ${left} more day${left === 1 ? '' : 's'}` : ''}
          </p>

          <dl className="dl">
            <div className="dl-row"><dt>Category</dt><dd>{item.category}</dd></div>
            <div className="dl-row"><dt>Last seen</dt><dd>{item.lastSeenLocation || 'Not given'}</dd></div>
            <div className="dl-row"><dt>Description</dt><dd>{item.description || 'No description added.'}</dd></div>
            <div className="dl-row">
              <dt>Owner</dt>
              <dd>
                {user ? (
                  <div className="contact-box">
                    <b>{item.posterName}</b>
                    <span>{item.contact || item.posterEmail}</span>
                  </div>
                ) : (
                  <Notice type="info">
                    <Link href={`/login?next=/lost/${item.id}`}>Sign in</Link> with your CJC account to see who lost it and how to reach them.
                  </Notice>
                )}
              </dd>
            </div>
          </dl>

          <div className="stack" style={{ marginTop: 20, '--gap': '12px' }}>
            {recovered ? (
              <Notice type="success">Good news: the owner marked this item as recovered.</Notice>
            ) : user && !isOwner ? (
              <Notice type="info">Found this? Message the owner using the details above. If you have it with you, you can also <Link href="/post">post it as a found item</Link>.</Notice>
            ) : null}

            {isOwner && (
              <div className="row">
                <Link href="/my-posts" className="btn btn-secondary"><IconEdit /> Manage this alert</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
