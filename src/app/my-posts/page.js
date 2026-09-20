'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import {
  getFoundItems, getLostAlerts, updateFoundItem, updateLostAlert,
  deleteFoundItem, deleteLostAlert, getClaimsForItem, friendlyError,
} from '@/lib/firestore';
import { deleteItemImage } from '@/lib/storage';
import LoginCard from '@/components/LoginCard';
import { EmptyState, Field, Modal, Notice, StatusBadge } from '@/components/ui';
import { CategoryIcon, IconBox, IconBell, IconPlus, IconPin, IconCalendar, IconTag, IconEdit, IconTrash, IconCheck, IconRefresh, IconHand } from '@/components/Icons';
import { CATEGORIES, LIMITS, formatDate, daysLeft } from '@/lib/constants';

function PostRow({ item, onChanged, onDelete }) {
  const toast = useToast();
  const isFound = item.kind === 'found';
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [claims, setClaims] = useState(null);
  const [claimsOpen, setClaimsOpen] = useState(false);
  const [claimsLoading, setClaimsLoading] = useState(false);

  const done = isFound ? item.status === 'claimed' : item.status === 'resolved';
  const left = daysLeft(item.expiresAt);
  const href = isFound ? `/items/${item.id}` : `/lost/${item.id}`;

  function startEdit() {
    setForm({
      name: item.name || '',
      category: item.category || '',
      description: item.description || '',
      location: (isFound ? item.locationFound : item.lastSeenLocation) || '',
      contact: (isFound ? item.finderContact : item.contact) || '',
    });
    setEditing(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      toast.error('Name and category are required.');
      return;
    }
    setSaving(true);
    try {
      const base = {
        name: form.name.trim().slice(0, LIMITS.name),
        category: form.category,
        description: form.description.trim().slice(0, LIMITS.description),
      };
      if (isFound) {
        await updateFoundItem(item.id, { ...base, locationFound: form.location.trim().slice(0, LIMITS.location), finderContact: form.contact.trim().slice(0, LIMITS.contact) });
      } else {
        await updateLostAlert(item.id, { ...base, lastSeenLocation: form.location.trim().slice(0, LIMITS.location), contact: form.contact.trim().slice(0, LIMITS.contact) });
      }
      toast.success('Post updated.');
      setEditing(false);
      onChanged();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    setBusy(true);
    try {
      if (isFound) await updateFoundItem(item.id, { status: done ? 'found' : 'claimed' });
      else await updateLostAlert(item.id, { status: done ? 'looking' : 'resolved' });
      toast.success(done ? 'Post reopened.' : isFound ? 'Marked as returned. Nice work!' : 'Marked as recovered. Glad it turned up!');
      onChanged();
    } catch (err) {
      toast.error(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleClaims() {
    if (claimsOpen) { setClaimsOpen(false); return; }
    setClaimsOpen(true);
    if (claims) return;
    setClaimsLoading(true);
    try {
      setClaims(await getClaimsForItem(item.id));
    } catch (err) {
      toast.error(friendlyError(err));
      setClaimsOpen(false);
    } finally {
      setClaimsLoading(false);
    }
  }

  return (
    <li className="list-item">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="thumb" loading="lazy" />
      ) : (
        <div className="thumb-empty"><CategoryIcon category={item.category} /></div>
      )}

      <div className="list-main">
        <div className="row" style={{ gap: 10 }}>
          <span className="list-title"><Link href={href}>{item.name}</Link></span>
          <StatusBadge item={item} />
        </div>
        <div className="meta-row">
          <span><IconTag /> {item.category}</span>
          <span><IconPin /> {(isFound ? item.locationFound : item.lastSeenLocation) || 'No location'}</span>
          <span><IconCalendar /> {formatDate(item.createdAt)}</span>
          {left !== null && !done && <span>{left} day{left === 1 ? '' : 's'} left</span>}
        </div>

        {isFound && !editing && (
          <div style={{ marginTop: 10 }}>
            <button type="button" className="btn btn-gold btn-sm" onClick={toggleClaims} aria-expanded={claimsOpen}>
              <IconHand /> {item.claimCount || 0} claim{item.claimCount === 1 ? '' : 's'} {claimsOpen ? '· hide' : '· view'}
            </button>
            {claimsOpen && (
              <div className="claims">
                {claimsLoading ? (
                  <span className="row" style={{ color: 'var(--ink-3)', fontSize: 14 }}><span className="spinner" /> Loading claims…</span>
                ) : !claims || claims.length === 0 ? (
                  <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>No claims yet. When someone says the item is theirs, their message shows here.</p>
                ) : claims.map((c) => (
                  <div className="claim" key={c.id}>
                    <div className="claim-head">
                      <b>{c.claimerName}</b>
                      <small>{formatDate(c.createdAt)}</small>
                    </div>
                    <p>{c.proof}</p>
                    <div className="contact">Contact: {c.contact || c.claimerEmail}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {editing && (
          <form className="inline-edit" onSubmit={saveEdit}>
            <Field label="Name" required>
              {(a) => <input {...a} className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} maxLength={LIMITS.name} />}
            </Field>
            <Field label="Category" required>
              {(a) => (
                <select {...a} className="select" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              )}
            </Field>
            <Field label={isFound ? 'Where you found it' : 'Where you last had it'}>
              {(a) => <input {...a} className="input" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} maxLength={LIMITS.location} />}
            </Field>
            <Field label="Description" count={`${form.description.length}/${LIMITS.description}`}>
              {(a) => <textarea {...a} className="textarea" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} maxLength={LIMITS.description} />}
            </Field>
            <Field label="Contact details">
              {(a) => <input {...a} className="input" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} maxLength={LIMITS.contact} />}
            </Field>
            <div className="row" style={{ justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : 'Save changes'}</button>
            </div>
          </form>
        )}
      </div>

      {!editing && (
        <div className="list-actions">
          <button type="button" className={`btn btn-sm ${done ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleStatus} disabled={busy}>
            {busy ? <span className="spinner" /> : done ? <IconRefresh /> : <IconCheck />}
            {done ? 'Reopen' : isFound ? 'Mark returned' : 'Mark recovered'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={startEdit}><IconEdit /> Edit</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(item)}><IconTrash /> Delete</button>
        </div>
      )}
    </li>
  );
}

export default function MyPostsPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const [found, setFound] = useState([]);
  const [lost, setLost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('found');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [f, l] = await Promise.all([getFoundItems(), getLostAlerts()]);
      setFound(f.filter((i) => i.finderEmail === user.email));
      setLost(l.filter((i) => i.posterEmail === user.email));
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function confirmDelete() {
    const item = toDelete;
    if (!item) return;
    setDeleting(true);
    try {
      if (item.kind === 'found') {
        await deleteFoundItem(item.id);
        await deleteItemImage(item.imagePath, item.imageSizeBytes).catch(() => {});
      } else {
        await deleteLostAlert(item.id);
      }
      toast.success('Post deleted.');
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setDeleting(false);
    }
  }

  if (authLoading) return <div className="center"><span className="spinner" /></div>;

  if (!user) {
    return (
      <div className="auth-wrap">
        <LoginCard title="Sign in to see your posts" subtitle="Your found reports, lost alerts and any claims people sent you live here." />
      </div>
    );
  }

  const posts = tab === 'found' ? found : lost;

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1 className="section-title">My posts</h1>
          <p className="section-sub">Edit, close, or delete anything you posted. Claims from other students show under each found item.</p>
        </div>
        <div className="row">
          <Link href="/post" className="btn btn-secondary btn-sm"><IconPlus /> Found item</Link>
          <Link href="/lost" className="btn btn-secondary btn-sm"><IconPlus /> Lost alert</Link>
        </div>
      </div>

      <div className="tabs-underline" role="tablist" aria-label="Post type">
        <button type="button" role="tab" aria-selected={tab === 'found'} onClick={() => setTab('found')}>
          <IconBox /> Found items <span className="count">{found.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'lost'} onClick={() => setTab('lost')}>
          <IconBell /> Lost alerts <span className="count">{lost.length}</span>
        </button>
      </div>

      {error ? (
        <Notice type="danger">{error} <button type="button" className="btn btn-secondary btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button></Notice>
      ) : loading ? (
        <div className="center"><span className="spinner" /></div>
      ) : posts.length === 0 ? (
        tab === 'found' ? (
          <EmptyState icon={<IconBox />} title="You have not reported any found items" actions={<Link href="/post" className="btn btn-primary"><IconPlus /> Report a found item</Link>}>
            Picked something up? Post it and the owner can claim it here.
          </EmptyState>
        ) : (
          <EmptyState icon={<IconBell />} title="You have no lost alerts" actions={<Link href="/lost" className="btn btn-primary"><IconPlus /> Post a lost alert</Link>}>
            Lost something? Post an alert so finders know who to contact.
          </EmptyState>
        )
      ) : (
        <ul className="list" style={{ listStyle: 'none' }}>
          {posts.map((item) => (
            <PostRow key={item.id} item={item} onChanged={load} onDelete={setToDelete} />
          ))}
        </ul>
      )}

      {toDelete && (
        <Modal title="Delete this post?" onClose={() => !deleting && setToDelete(null)}>
          <p className="desc">
            <b>{toDelete.name}</b> will be removed from the board{toDelete.imageUrl ? ' along with its photo' : ''}. This cannot be undone.
          </p>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setToDelete(null)} disabled={deleting}>Keep it</button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? <><span className="spinner" /> Deleting…</> : <><IconTrash /> Delete post</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
