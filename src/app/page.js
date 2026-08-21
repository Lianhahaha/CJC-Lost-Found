'use client';
import { useState, useEffect, useMemo } from 'react';
import ItemCard from '@/components/ItemCard';
import { getFoundItems, getLostAlerts } from '@/lib/firestore';
import Link from 'next/link';

const CATEGORIES = ['all', 'Electronics', 'Clothing', 'IDs & Cards', 'Books', 'Accessories', 'Others'];
const FOUND_STATUSES = ['all', 'found', 'claimed'];
const LOST_STATUSES = ['all', 'looking', 'resolved'];

export default function HomePage() {
  const [tab, setTab]             = useState('found');
  const [foundItems, setFoundItems] = useState([]);
  const [lostAlerts, setLostAlerts] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('all');
  const [status, setStatus]       = useState('all');

  useEffect(() => {
    Promise.all([getFoundItems(), getLostAlerts()])
      .then(([found, lost]) => { setFoundItems(found); setLostAlerts(lost); })
      .catch(console.error);
  }, []);

  const filteredFound = useMemo(() =>
    foundItems.filter((item) => {
      const q = search.toLowerCase();
      return (
        (!q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q) || item.locationFound?.toLowerCase().includes(q)) &&
        (category === 'all' || item.category === category) &&
        (status === 'all' || item.status === status)
      );
    }), [foundItems, search, category, status]);

  const filteredLost = useMemo(() =>
    lostAlerts.filter((item) => {
      const q = search.toLowerCase();
      return (
        (!q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)) &&
        (category === 'all' || item.category === category) &&
        (status === 'all' || item.status === status)
      );
    }), [lostAlerts, search, category, status]);

  const currentStatuses = tab === 'found' ? FOUND_STATUSES : LOST_STATUSES;

  return (
    <div>
      {/* ── GitHub-style page header ── */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">CJC Campus System</div>
          <h1>Lost &amp; Found</h1>
          <p>Help reunite belongings with their owners by posting or discovering lost items on campus.</p>

          <div className="hero-actions">
            <Link href="/post" className="btn btn-primary btn-lg">
              + Report Found Item
            </Link>
            <Link href="/lost" className="btn btn-default btn-lg">
              + Post Lost Alert
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="stat-number">{foundItems.length}</div>
              <div className="stat-label">Found Items</div>
            </div>
            <div className="hero-stat">
              <div className="stat-number">{lostAlerts.length}</div>
              <div className="stat-label">Lost Alerts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-wrapper">
        {/* ── Tabs (GitHub underline style) ── */}
        <div className="page-tabs">
          <button
            className={`page-tab${tab === 'found' ? ' active' : ''}`}
            onClick={() => { setTab('found'); setStatus('all'); }}
          >
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor" style={{ marginRight: 4, opacity: tab === 'found' ? 1 : 0.7 }}>
              <path d="m11.28 3.22 4.25 4.25a1.5 1.5 0 0 1 0 2.12l-4.25 4.25a.75.75 0 0 1-1.06-1.06L14.19 8l-3.97-3.97a.75.75 0 0 1 1.06-1.06Zm-6.56 0a.75.75 0 1 1 1.06 1.06L1.81 8l3.97 3.97a.75.75 0 1 1-1.06 1.06L.47 8.81a1.5 1.5 0 0 1 0-2.12Z"></path>
            </svg>
            Found Items
            {foundItems.length > 0 && (
              <span className="tab-count">{foundItems.length}</span>
            )}
          </button>
          <button
            className={`page-tab${tab === 'lost' ? ' active' : ''}`}
            onClick={() => { setTab('lost'); setStatus('all'); }}
          >
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16" fill="currentColor" style={{ marginRight: 4, opacity: tab === 'lost' ? 1 : 0.7 }}>
              <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"></path><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"></path>
            </svg>
            Lost Alerts
            {lostAlerts.length > 0 && (
              <span className="tab-count">{lostAlerts.length}</span>
            )}
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="filters-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder={tab === 'found' ? 'Search found items…' : 'Search lost alerts…'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-selects">
            <div className="filter-group">
              <span className="filter-label">Category</span>
              <select 
                className="filter-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <span className="filter-label">Status</span>
              <select 
                className="filter-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {currentStatuses.map(s => (
                  <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : tab === 'found' ? (
          filteredFound.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No items found</h3>
              <p>Try adjusting your filters, or <Link href="/post">report a found item</Link>.</p>
            </div>
          ) : (
            <div className="item-grid">
              {filteredFound.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          )
        ) : filteredLost.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <h3>No lost alerts</h3>
            <p>Nobody has posted a lost item alert yet. <Link href="/lost">Post one</Link>.</p>
          </div>
        ) : (
          <div className="item-grid">
            {filteredLost.map((item) => <ItemCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}
