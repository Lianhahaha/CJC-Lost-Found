'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/Toast';
import ImageUploader from '@/components/ImageUploader';
import LoginCard from '@/components/LoginCard';
import { Field, Notice } from '@/components/ui';
import { IconArrowLeft, IconShield } from '@/components/Icons';
import { uploadItemImage } from '@/lib/storage';
import { createFoundItem, friendlyError } from '@/lib/firestore';
import { CATEGORIES, LIMITS, POST_TTL_DAYS } from '@/lib/constants';

const EMPTY = { name: '', category: '', description: '', locationFound: '', contact: '' };

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = 'Give the item a short name.';
  else if (f.name.trim().length < 3) e.name = 'Use at least 3 characters.';
  if (!f.category) e.category = 'Pick the closest category.';
  if (!f.locationFound.trim()) e.locationFound = 'Say where you found it so the owner can confirm.';
  if (f.description.length > LIMITS.description) e.description = `Keep it under ${LIMITS.description} characters.`;
  return e;
}

export default function PostFoundPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const errors = validate(form);
  const show = (k) => (touched[k] ? errors[k] : undefined);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ name: true, category: true, locationFound: true, description: true, contact: true });
    if (Object.keys(errors).length) {
      setError('Please fix the highlighted fields.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      let image = { url: null, path: null, sizeBytes: 0 };
      if (imageFile) {
        const r = await uploadItemImage(imageFile, user.uid);
        image = { url: r.url, path: r.path, sizeBytes: r.sizeBytes };
      }
      const id = await createFoundItem({
        name: form.name.trim().slice(0, LIMITS.name),
        category: form.category,
        description: form.description.trim().slice(0, LIMITS.description),
        locationFound: form.locationFound.trim().slice(0, LIMITS.location),
        finderName: user.displayName || user.email,
        finderEmail: user.email,
        finderUid: user.uid,
        finderContact: form.contact.trim().slice(0, LIMITS.contact),
        imageUrl: image.url,
        imagePath: image.path,
        imageSizeBytes: image.sizeBytes,
      });
      toast.success('Found item posted. Thank you!');
      router.push(`/items/${id}`);
    } catch (err) {
      setError(friendlyError(err));
      setSaving(false);
    }
  }

  if (authLoading) return <div className="center"><span className="spinner" /></div>;

  if (!user) {
    return (
      <div className="auth-wrap">
        <LoginCard title="Sign in to report a found item" subtitle="Your name is attached to the post so the owner knows who to contact." />
      </div>
    );
  }

  return (
    <div className="container page page-narrow">
      <Link href="/" className="back-link"><IconArrowLeft /> Back to board</Link>

      <div className="panel">
        <div className="panel-head">
          <h1 className="panel-title">Report a found item</h1>
          <p className="panel-desc">Takes about a minute. The post stays up for {POST_TTL_DAYS} days or until you mark it returned.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="stack" style={{ '--gap': '18px' }}>
          {error && <Notice type="danger">{error}</Notice>}

          <Field label="What did you find?" required error={show('name')} hint="Short and specific, e.g. “Black Casio calculator”.">
            {(a) => <input {...a} className="input" value={form.name} onChange={set('name')} onBlur={blur('name')} maxLength={LIMITS.name} placeholder="e.g. Blue umbrella with wooden handle" autoFocus />}
          </Field>

          <Field label="Category" required error={show('category')}>
            {(a) => (
              <select {...a} className="select" value={form.category} onChange={set('category')} onBlur={blur('category')}>
                <option value="">Choose a category…</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            )}
          </Field>

          <Field label="Where did you find it?" required error={show('locationFound')} hint="Building, room, or landmark. Include the time if you remember.">
            {(a) => <input {...a} className="input" value={form.locationFound} onChange={set('locationFound')} onBlur={blur('locationFound')} maxLength={LIMITS.location} placeholder="e.g. Library 2nd floor, near the printers" />}
          </Field>

          <Field
            label="Description"
            optional
            error={show('description')}
            hint="Colour, brand, stickers. Leave out anything that only the owner should know; you can use that to verify claims."
            count={`${form.description.length}/${LIMITS.description}`}
          >
            {(a) => <textarea {...a} className="textarea" value={form.description} onChange={set('description')} onBlur={blur('description')} maxLength={LIMITS.description} placeholder="e.g. Grey hoodie, size M, has a small tear on the left cuff" />}
          </Field>

          <Field label="Photo" optional hint="Cover ID numbers or personal details before uploading.">
            {() => <ImageUploader onFileSelected={setImageFile} disabled={saving} />}
          </Field>

          <Field label="How should the owner reach you?" optional hint={`Shown only to signed-in CJC users. If empty, your email (${user.email}) is shown.`}>
            {(a) => <input {...a} className="input" value={form.contact} onChange={set('contact')} maxLength={LIMITS.contact} placeholder="e.g. Messenger: Juan Dela Cruz · 09XX XXX XXXX" />}
          </Field>

          <div className="notice notice-info">
            <IconShield />
            <span>Posting as <b>{user.displayName || user.email}</b>. You can edit or delete this post any time from My posts.</span>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <Link href="/" className="btn btn-ghost">Cancel</Link>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? <><span className="spinner" /> Posting…</> : 'Post found item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
