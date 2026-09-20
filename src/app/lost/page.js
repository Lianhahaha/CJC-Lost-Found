'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import LoginCard from '@/components/LoginCard';
import { Field, Notice } from '@/components/ui';
import { IconArrowLeft, IconShield } from '@/components/Icons';
import { createLostAlert, friendlyError } from '@/lib/firestore';
import { CATEGORIES, LIMITS, POST_TTL_DAYS } from '@/lib/constants';

const EMPTY = { name: '', category: '', description: '', lastSeenLocation: '', contact: '' };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Give the item a short name.';
  else if (f.name.trim().length < 3) e.name = 'Use at least 3 characters.';
  if (!f.category) e.category = 'Pick the closest category.';
  if (!f.contact.trim()) e.contact = 'Add a way for the finder to reach you.';
  if (f.description.length > LIMITS.description) e.description = `Keep it under ${LIMITS.description} characters.`;
  return e;
}

export default function LostAlertPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const errors = validate(form);
  const show = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, category: true, contact: true, description: true });
    if (Object.keys(errors).length) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const id = await createLostAlert({
        name: form.name.trim().slice(0, LIMITS.name),
        category: form.category,
        description: form.description.trim().slice(0, LIMITS.description),
        lastSeenLocation: form.lastSeenLocation.trim().slice(0, LIMITS.location),
        posterName: user.displayName || user.email,
        posterEmail: user.email,
        posterUid: user.uid,
        contact: form.contact.trim().slice(0, LIMITS.contact),
      });
      toast.success('Lost alert posted. Good luck!');
      router.push(`/lost/${id}`);
    } catch (err) {
      setError(friendlyError(err));
      setSaving(false);
    }
  }

  if (authLoading) return <div className="center"><span className="spinner" /></div>;

  if (!user) {
    return (
      <div className="auth-wrap">
        <LoginCard title="Sign in to post a lost alert" subtitle="Your name is attached to the alert so finders know who to contact." />
      </div>
    );
  }

  return (
    <div className="container page page-narrow">
      <Link href="/" className="back-link"><IconArrowLeft /> Back to board</Link>

      <div className="panel">
        <div className="panel-head">
          <h1 className="panel-title">Post a lost alert</h1>
          <p className="panel-desc">Tell the campus what you lost. The alert stays up for {POST_TTL_DAYS} days or until you mark it recovered.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="stack" style={{ '--gap': '18px' }}>
          {error && <Notice type="danger">{error}</Notice>}

          <Field label="What did you lose?" required error={show('name')} hint="Short and specific, e.g. “Red Hydro Flask 32 oz”.">
            {(a) => <input {...a} className="input" value={form.name} onChange={set('name')} onBlur={blur('name')} maxLength={LIMITS.name} placeholder="e.g. Black leather wallet" autoFocus />}
          </Field>

          <Field label="Category" required error={show('category')}>
            {(a) => (
              <select {...a} className="select" value={form.category} onChange={set('category')} onBlur={blur('category')}>
                <option value="">Choose a category…</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
          </Field>

          <Field label="Where did you last have it?" optional hint="Building, room, or landmark, plus the day and rough time.">
            {(a) => <input {...a} className="input" value={form.lastSeenLocation} onChange={set('lastSeenLocation')} maxLength={LIMITS.location} placeholder="e.g. Canteen, Tuesday around 1 pm" />}
          </Field>

          <Field
            label="Description"
            optional
            error={show('description')}
            hint="Colour, brand, stickers, anything that helps someone recognise it."
            count={`${form.description.length}/${LIMITS.description}`}
          >
            {(a) => <textarea {...a} className="textarea" value={form.description} onChange={set('description')} onBlur={blur('description')} maxLength={LIMITS.description} placeholder="e.g. Brown wallet with a CJC ID and a jeepney sticker inside" />}
          </Field>

          <Field label="How should the finder reach you?" required error={show('contact')} hint="Shown only to signed-in CJC users.">
            {(a) => <input {...a} className="input" value={form.contact} onChange={set('contact')} onBlur={blur('contact')} maxLength={LIMITS.contact} placeholder="e.g. Messenger: Maria Santos · 09XX XXX XXXX" />}
          </Field>

          <div className="notice notice-info">
            <IconShield />
            <span>Posting as <b>{user.displayName || user.email}</b>. You can edit or delete this alert any time from My posts.</span>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Link href="/" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><span className="spinner" /> Posting…</> : 'Post lost alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
