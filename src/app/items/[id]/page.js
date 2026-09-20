'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getFoundItem, createClaim, hasUserClaimed, friendlyError } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import { EmptyState, Field, Modal, Notice, StatusBadge } from '@/components/ui';
import { CategoryIcon, IconArrowLeft, IconBox, IconHand, IconEdit } from '@/components/Icons';
import { formatDate, daysLeft, LIMITS } from '@/lib/constants';

function ClaimModal({ item, user, onClose, onClaimed }) {
  const [proof, setProof] = useState('');
  const [contact, setContact] = useState('');
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const proofError = !proof.trim() ? 'Describe something only the owner would know.' : proof.trim().length < 15 ? 'Add a bit more detail (at least 15 characters).' : '';

  async function submit(e) {
    e.preventDefault();
    setTouched(true);
    if (proofError) return;
    setSaving(true);
    setError('');
    try {
      await createClaim(item.id, {
        claimerName: user.displayName || user.email,
        claimerEmail: user.email,
        claimerUid: user.uid,
        proof: proof.trim().slice(0, LIMITS.proof),
        contact: contact.trim().slice(0, LIMITS.contact),
      });
      onClaimed();
    } catch (err) {
      setError(friendlyError(err));
      setSaving(false);
    }
  }

  return (
    <Modal title="This is mine" onClose={onClose}>
      <p className="desc">
        Tell <b>{item.finderName}</b> how you know this is yours. They will see your message in their posts and contact you to hand it over.
      </p>
      <form onSubmit={submit} noValidate className="stack" style={{ marginTop: 18 }}>
        {error && <Notice type="danger">{error}</Notice>}
        <Field label="Proof it is yours" required error={touched ? proofError : undefined} hint="A detail not visible in the photo: what is inside, a scratch, a sticker, the lock-screen photo." count={`${proof.length}/${LIMITS.proof}`}>
          {(a) => <textarea {...a} className="textarea" rows={4} value={proof} onChange={(e) => setProof(e.target.value)} onBlur={() => setTouched(true)} maxLength={LIMITS.proof} placeholder="e.g. Brown wallet, has my CJC ID and a photo of my dog in the front pocket" autoFocus />}
        </Field>
        <Field label="Best way to reach you" optional hint={`If empty, the finder sees your email (${user.email}).`}>
          {(a) => <input {...a} className="input" value={contact} onChange={(e) => setContact(e.target.value)} maxLength={LIMITS.contact} placeholder="e.g. Messenger: Juan Dela Cruz · 09XX XXX XXXX" />}
        </Field>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><span className="spinner" /> Sending…</> : 'Send claim'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClaim, setShowClaim] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFoundItem(id);
      setItem(data);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user?.email || !item) return;
    hasUserClaimed(item.id, user.email).then(setAlreadyClaimed).catch(() => {});
  }, [user?.email, item]);

  if (loading || authLoading) {
    return <div className="center"><span className="spinner" /></div>;
  }

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
        <EmptyState icon={<IconBox />} title="This item is no longer listed" actions={<Link href="/" className="btn btn-primary">Back to board</Link>}>
          It may have been returned to its owner, deleted by the finder, or expired after 30 days.
        </EmptyState>
      </div>
    );
  }

  const isOwner = user && (user.email === item.finderEmail);
  const returned = item.status === 'claimed';
  const left = daysLeft(item.expiresAt);

  return (
    <div className="container page">
      <Link href="/" className="back-link"><IconArrowLeft /> Back to board</Link>

      <div className="detail">
        <div className="detail-media">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={`Photo of ${item.name}`} />
          ) : (
            <div className="card-media-empty"><CategoryIcon category={item.category} /></div>
          )}
        </div>

        <div>
          <div className="detail-title-row">
            <h1>{item.name}</h1>
            <StatusBadge item={item} />
          </div>
          <p style={{ color: 'var(--ink-3)', marginTop: 8, fontSize: 14 }}>
            Found item · posted {formatDate(item.createdAt)}
            {left !== null && !returned ? ` · listed for ${left} more day${left === 1 ? '' : 's'}` : ''}
          </p>

          <dl className="dl">
            <div className="dl-row"><dt>Category</dt><dd>{item.category}</dd></div>
            <div className="dl-row"><dt>Found at</dt><dd>{item.locationFound}</dd></div>
            <div className="dl-row"><dt>Description</dt><dd>{item.description || 'No description added.'}</dd></div>
            <div className="dl-row">
              <dt>Finder</dt>
              <dd>
                {user ? (
                  <div className="contact-box">
                    <b>{item.finderName}</b>
                    <span>{item.finderContact || item.finderEmail}</span>
                  </div>
                ) : (
                  <Notice type="info">
                    <Link href={`/login?next=/items/${item.id}`}>Sign in</Link> with your CJC account to see who found it and how to reach them.
                  </Notice>
                )}
              </dd>
            </div>
          </dl>

          <div className="stack" style={{ marginTop: 20, '--gap': '12px' }}>
            {returned && (
              <Notice type="success">This item has been returned to its owner. If you believe it is yours too, contact the finder directly.</Notice>
            )}

            {isOwner ? (
              <div className="row">
                <Link href="/my-posts" className="btn btn-secondary"><IconEdit /> Manage this post</Link>
                {item.claimCount > 0 && <span className="chip">{item.claimCount} claim{item.claimCount === 1 ? '' : 's'} waiting</span>}
              </div>
            ) : user && !returned ? (
              alreadyClaimed ? (
                <Notice type="info">You already sent a claim for this item. The finder will contact you if it matches.</Notice>
              ) : (
                <div className="row">
                  <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowClaim(true)}>
                    <IconHand /> This is mine
                  </button>
                  <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>You will be asked for a detail only the owner knows.</span>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      {showClaim && (
        <ClaimModal
          item={item}
          user={user}
          onClose={() => setShowClaim(false)}
          onClaimed={() => {
            setShowClaim(false);
            setAlreadyClaimed(true);
            setItem((i) => ({ ...i, claimCount: (i.claimCount || 0) + 1 }));
            toast.success('Claim sent. The finder will reach out if it matches.');
          }}
        />
      )}
    </div>
  );
}
