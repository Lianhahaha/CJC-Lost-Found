'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createLostAlert } from '@/lib/firestore';
import LoginCard from '@/components/LoginCard';

const CATEGORIES = ['Electronics', 'Clothing', 'IDs & Cards', 'Books', 'Accessories', 'Others'];

export default function LostAlertPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    lastSeenLocation: '',
    contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.category) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createLostAlert({
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        lastSeenLocation: form.lastSeenLocation.trim(),
        posterName: user.displayName,
        posterEmail: user.email,
        contact: form.contact.trim(),
      });
      setSuccess('Lost alert posted!');
      setTimeout(() => router.push('/'), 1200);
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
            title="Sign in to post a lost alert" 
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
          <h2>Post a Lost Alert</h2>
          <p className="form-card-desc">
            Lost something on campus? Let others know so they can reach out if they find it.
          </p>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-stack">
              <div className="form-group">
                <label className="form-label">Item name <span>*</span></label>
                <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="e.g. Blue umbrella" />
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
                  placeholder="Color, brand, distinguishing marks…"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last seen location</label>
                <input className="form-input" type="text" value={form.lastSeenLocation} onChange={set('lastSeenLocation')} placeholder="e.g. Canteen, Room 301…" />
              </div>

              <div className="form-group">
                <label className="form-label">Your contact / socials <span>*</span></label>
                <input className="form-input" type="text" value={form.contact} onChange={set('contact')} placeholder="FB: @yourname, 09XX-XXX-XXXX…" />
                <span className="form-hint">This is how finders will reach you.</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Posting…</> : 'Post Lost Alert'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
