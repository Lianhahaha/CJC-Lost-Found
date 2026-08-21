'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ImageUploader from '@/components/ImageUploader';
import { uploadItemImage } from '@/lib/storage';
import { createFoundItem } from '@/lib/firestore';
import LoginCard from '@/components/LoginCard';

const CATEGORIES = ['Electronics', 'Clothing', 'IDs & Cards', 'Books', 'Accessories', 'Others'];

export default function PostFoundPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    locationFound: '',
    contact: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.category || !form.locationFound.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      let imagePath = null;
      let imageSizeBytes = 0;

      if (imageFile) {
        // Temporary ID for storage path; will be replaced on doc creation
        const tempId = `temp_${Date.now()}`;
        const result = await uploadItemImage(imageFile, tempId);
        imageUrl = result.url;
        imagePath = result.path;
        imageSizeBytes = result.sizeBytes;
      }

      const itemId = await createFoundItem({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        locationFound: form.locationFound.trim(),
        finderName: user.displayName,
        finderEmail: user.email,
        finderContact: form.contact.trim(),
        imageUrl,
        imagePath,
        imageSizeBytes,
      });

      setSuccess('Item posted successfully!');
      setTimeout(() => router.push(`/items/${itemId}`), 1200);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="form-page" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <LoginCard 
            title="Sign in to report a found item" 
            subtitle="Only CJC students and staff with a @g.cjc.edu.ph account can post." 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="form-page">
        <div className="form-card">
          <h2>Report a Found Item</h2>
          <p className="form-card-desc">
            Found something on campus? Fill in the details below and we&apos;ll help reunite it with its owner.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-stack">
              <div className="form-group">
                <label className="form-label">Item name <span>*</span></label>
                <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="e.g. Black leather wallet" />
              </div>

              <div className="form-group">
                <label className="form-label">Category <span>*</span></label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  <option value="">Select a category…</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Color, brand, any distinguishing features…"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Where did you find it? <span>*</span></label>
                <input className="form-input" type="text" value={form.locationFound} onChange={set('locationFound')} placeholder="e.g. Near the library entrance, Room 204…" />
              </div>

              <div className="form-group">
                <label className="form-label">Your contact / socials</label>
                <input className="form-input" type="text" value={form.contact} onChange={set('contact')} placeholder="FB: @yourname, 09XX-XXX-XXXX, Instagram: @handle…" />
                <span className="form-hint">Shown only to signed-in CJC users so the owner can reach you.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Photo (optional)</label>
                <ImageUploader onFileSelected={setImageFile} disabled={loading} />
                <span className="form-hint">Max 2MB. Image auto-deleted after 30 days.</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Posting…</> : 'Post Found Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
