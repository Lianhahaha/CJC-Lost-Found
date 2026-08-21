'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFoundItem, updateFoundItem, createClaim } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';

function timeAgo(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ClaimModal({ item, user, onClose, onClaimed }) {
  const [proof, setProof] = useState('');
  const [contact, setContact] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!proof.trim()) { setError('Please describe how you can prove this is yours.'); return; }
    setLoading(true);
    try {
      await createClaim(item.id, {
        claimerName: user.displayName,
        claimerEmail: user.email,
        proof,
        contact,
      });
      onClaimed();
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">Claim this item</div>
        <p className="modal-desc">
          Describe how you can prove this item is yours (color, brand, distinguishing marks, etc.).
          The finder will be notified through their contact details.
        </p>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-stack">
            <div className="form-group">
              <label className="form-label">Proof of ownership <span>*</span></label>
              <textarea
                className="form-textarea"
                rows={4}
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="e.g. It's a black wallet with a small tear on the left side, contains a CJC ID and a BDO card..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Your contact (optional)</label>
              <input
                className="form-input"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="FB: @yourname, 09XX-XXX-XXXX, etc."
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-default" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Submitting…</> : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ItemDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showClaim, setShowClaim] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    getFoundItem(id)
      .then((data) => {
        setItem(data);
        if (data?.status === 'claimed') setClaimed(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!item) return (
    <div className="page-wrapper">
      <div className="empty-state">
        <div className="empty-icon">❓</div>
        <h3>Item not found</h3>
        <p>This item may have been removed or the link is invalid.</p>
      </div>
    </div>
  );

  const isOwner = user?.email === item.finderEmail;

  return (
    <div className="page-wrapper">
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-default btn-sm" onClick={() => router.back()}>← Back</button>
      </div>

      <div className="detail-grid">
        {/* Image */}
        <div>
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="detail-img" />
          ) : (
            <div style={{
              background: 'linear-gradient(135deg, var(--color-canvas-inset) 0%, var(--color-canvas-subtle) 100%)',
              border: '1px solid var(--color-border-default)',
              borderRadius: 'var(--radius-md)',
              aspectRatio: '4/3',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 72,
            }}>📦</div>
          )}
        </div>

        {/* Details */}
        <div className="detail-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>{item.name}</h1>
            <span className={`badge ${claimed ? 'badge-claimed' : 'badge-found'}`}>
              {claimed ? '✓ Claimed' : '● Found'}
            </span>
          </div>

          <div className="detail-field">
            <label>Category</label>
            <p>{item.category}</p>
          </div>

          <div className="detail-field">
            <label>Description</label>
            <p style={{ whiteSpace: 'pre-wrap' }}>{item.description || '—'}</p>
          </div>

          <div className="detail-field">
            <label>Where it was found</label>
            <p>📍 {item.locationFound}</p>
          </div>

          <div className="detail-field">
            <label>Date found</label>
            <p>{timeAgo(item.createdAt)}</p>
          </div>

          {/* Finder contact — only visible to signed-in CJC users */}
          {user ? (
            <div className="detail-field">
              <label>Finder&apos;s contact</label>
              <div style={{
                background: 'var(--color-canvas-inset)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px 18px',
                fontSize: 14,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.finderName}</div>
                <div style={{ color: 'var(--color-fg-muted)' }}>{item.finderContact || item.finderEmail}</div>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <strong>Sign in</strong> with your CJC account to see the finder&apos;s contact details.
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
            {user && !claimed && !isOwner && (
              <button className="btn btn-primary" onClick={() => setShowClaim(true)}>
                This is mine
              </button>
            )}
            {isOwner && (
              <button className="btn btn-default" onClick={() => router.push(`/my-posts`)}>
                Edit my post
              </button>
            )}
          </div>

          {claimed && (
            <div className="alert alert-success">
              ✓ This item has been claimed. If you think this is yours too, contact the finder directly.
            </div>
          )}
        </div>
      </div>

      {showClaim && (
        <ClaimModal
          item={item}
          user={user}
          onClose={() => setShowClaim(false)}
          onClaimed={() => {
            setShowClaim(false);
            setClaimed(true);
          }}
        />
      )}
    </div>
  );
}
