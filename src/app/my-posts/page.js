'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getFoundItems, getLostAlerts, updateFoundItem, deleteFoundItem, deleteLostAlert } from '@/lib/firestore';
import { deleteItemImage } from '@/lib/storage';
import LoginCard from '@/components/LoginCard';

function timeAgo(ts) {
  if (!ts) return '—';
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function MyPostsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [foundPosts, setFoundPosts] = useState([]);
  const [lostPosts, setLostPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('found');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function loadPosts() {
    if (!user) return;
    setLoading(true);
    try {
      const [found, lost] = await Promise.all([getFoundItems(), getLostAlerts()]);
      setFoundPosts(found.filter((i) => i.finderEmail === user.email));
      setLostPosts(lost.filter((i) => i.posterEmail === user.email));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { loadPosts(); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  function startEdit(item) {
    setEditingId(item.id);
    setEditForm({
      description: item.description || '',
      locationFound: item.locationFound || item.lastSeenLocation || '',
      contact: item.finderContact || item.contact || '',
      status: item.status || 'found',
    });
  }

  async function saveEdit(item) {
    setSaving(true);
    try {
      const isFound = !!item.finderEmail;
      if (isFound) {
        await updateFoundItem(item.id, {
          description: editForm.description,
          locationFound: editForm.locationFound,
          finderContact: editForm.contact,
          status: editForm.status,
        });
      }
      setEditingId(null);
      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
    setSaving(false);
  }

  async function handleDelete(item) {
    try {
      if (item.finderEmail) {
        if (item.imagePath) await deleteItemImage(item.imagePath, item.imageSizeBytes);
        await deleteFoundItem(item.id);
      } else {
        await deleteLostAlert(item.id);
      }
      setDeleteConfirm(null);
      await loadPosts();
    } catch (e) {
      alert(e.message);
    }
  }

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="form-page" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <LoginCard
            title="Sign in to manage your posts"
            subtitle="Only CJC students and staff can access this page."
          />
        </div>
      </div>
    );
  }

  const posts = tab === 'found' ? foundPosts : lostPosts;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1>My Posts</h1>
          <p>Manage your found item reports and lost alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/post" className="btn btn-default btn-sm">+ Report Found</Link>
          <Link href="/lost" className="btn btn-default btn-sm">+ Upload</Link>
        </div>
      </div>

      <div className="page-tabs">
        <button className={`page-tab${tab === 'found' ? ' active' : ''}`} onClick={() => setTab('found')}>
          Found Reports ({foundPosts.length})
        </button>
        <button className={`page-tab${tab === 'lost' ? ' active' : ''}`} onClick={() => setTab('lost')}>
          Lost Alerts ({lostPosts.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{tab === 'found' ? '📦' : '🔎'}</div>
          <h3>No {tab === 'found' ? 'found reports' : 'lost alerts'} yet</h3>
          <p>
            {tab === 'found'
              ? 'Find something on campus? Report it!'
              : 'Lost something? Post an alert so others can help.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {posts.map((item) => (
            <div key={item.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ 
                display: 'flex', 
                gap: 20, 
                padding: 20, 
                alignItems: 'flex-start', 
                flexWrap: 'wrap' 
              }}>
                {item.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    style={{ 
                      width: 90, 
                      height: 90, 
                      objectFit: 'cover', 
                      borderRadius: 8, 
                      border: '1px solid var(--color-border-default)', 
                      flexShrink: 0 
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
                    marginBottom: 6, 
                    flexWrap: 'wrap' 
                  }}>
                    <Link href={tab === 'found' ? `/items/${item.id}` : '#'} style={{ 
                      fontWeight: 700, 
                      fontSize: 16, 
                      color: 'var(--color-fg-default)',
                      letterSpacing: '-0.3px'
                    }}>
                      {item.name}
                    </Link>
                    <span className={`badge ${item.status === 'found' ? 'badge-found' : item.status === 'claimed' ? 'badge-claimed' : 'badge-looking'}`}>
                      {item.status === 'found' ? '● Found' : item.status === 'claimed' ? '✓ Claimed' : '? Looking'}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 13, 
                    color: 'var(--color-fg-muted)', 
                    display: 'flex', 
                    gap: 16, 
                    flexWrap: 'wrap' 
                  }}>
                    <span>📁 {item.category}</span>
                    <span>📍 {item.locationFound || item.lastSeenLocation || '—'}</span>
                    <span>📅 {timeAgo(item.createdAt)}</span>
                  </div>

                  {editingId === item.id && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" rows={3} value={editForm.description}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                      </div>
                      {tab === 'found' && (
                        <>
                          <div className="form-group">
                            <label className="form-label">Location</label>
                            <input className="form-input" value={editForm.locationFound}
                              onChange={(e) => setEditForm((f) => ({ ...f, locationFound: e.target.value }))} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Contact</label>
                            <input className="form-input" value={editForm.contact}
                              onChange={(e) => setEditForm((f) => ({ ...f, contact: e.target.value }))} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" value={editForm.status}
                              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                              <option value="found">Found</option>
                              <option value="claimed">Claimed</option>
                            </select>
                          </div>
                        </>
                      )}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => saveEdit(item)} disabled={saving}>
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button className="btn btn-default btn-sm" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>

                {editingId !== item.id && (
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-default btn-sm" onClick={() => startEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(item)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="modal">
            <div className="modal-title">Delete this post?</div>
            <p className="modal-desc">
              This will permanently delete <strong>{deleteConfirm.name}</strong> and its image (if any). This cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="btn btn-default" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
