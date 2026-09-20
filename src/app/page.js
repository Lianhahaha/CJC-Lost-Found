'use client';
import { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import Link from 'next/link';
import ItemCard from '@/components/ItemCard';
import { EmptyState, Notice, SkeletonGrid } from '@/components/ui';
import { IconSearch, IconClose, IconPlus, IconBell, IconBox, IconRefresh, IconCamera, IconHand, IconCheckCircle } from '@/components/Icons';
import { getFoundItems, getLostAlerts, friendlyError } from '@/lib/firestore';
import { CATEGORIES, FOUND_STATUS, LOST_STATUS } from '@/lib/constants';

export default function HomePage() {
  const [tab, setTab] = useState('found');
  const [found, setFound] = useState([]);
  const [lost, setLost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const q = useDeferredValue(search.trim().toLowerCase());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [f, l] = await Promise.all([getFoundItems(), getLostAlerts()]);
      setFound(f);
      setLost(l);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const source = tab === 'found' ? found : lost;
  const statuses = tab === 'found' ? FOUND_STATUS : LOST_STATUS;

  const results = useMemo(() => source.filter((item) => {
    if (category !== 'all' && item.category !== category) return false;
    if (status !== 'all' && item.status !== status) return false;
    if (!q) return true;
    const hay = [item.name, item.description, item.category, item.locationFound, item.lastSeenLocation]
      .filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q);
  }), [source, category, status, q]);

  function switchTab(next) {
    setTab(next);
    setStatus('all');
  }

  const filtersActive = q || category !== 'all' || status !== 'all';

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="eyebrow">Cor Jesu College · Campus service</div>
            <h1>Lost something on campus? <em>Let&rsquo;s get it back.</em></h1>
            <p className="lede">
              Students and staff post what they found and what they lost. Browse the board, then contact the person directly.
              No office queue, no paperwork.
            </p>
            <div className="hero-actions">
              <Link href="/post" className="btn btn-primary btn-lg"><IconPlus /> Report a found item</Link>
              <Link href="/lost" className="btn btn-secondary btn-lg"><IconBell /> Post a lost alert</Link>
            </div>
          </div>

          <aside className="hero-panel" aria-label="Board summary">
            <div className="hero-stats">
              <div className="stat">
                <div className="stat-n">{loading ? '–' : found.filter((i) => i.status === 'found').length}</div>
                <div className="stat-l">Items waiting for owners</div>
              </div>
              <div className="stat">
                <div className="stat-n">{loading ? '–' : lost.filter((i) => i.status === 'looking').length}</div>
                <div className="stat-l">People still looking</div>
              </div>
            </div>
            <ol className="hero-steps">
              <li><span className="step-n">1</span><span><b>Found something?</b> Post a photo and where you found it.</span></li>
              <li><span className="step-n">2</span><span><b>Lost something?</b> Search the board or post an alert.</span></li>
              <li><span className="step-n">3</span><span><b>Match?</b> Sign in to see contact details and arrange the hand-over.</span></li>
            </ol>
          </aside>
        </div>
      </section>

      <section className="container page" aria-labelledby="board-title">
        <h2 id="board-title" className="visually-hidden">Lost and found board</h2>

        <div className="toolbar">
          <div className="segmented" role="tablist" aria-label="Board type">
            <button type="button" role="tab" aria-selected={tab === 'found'} onClick={() => switchTab('found')}>
              <IconBox /> Found items <span className="count">{found.length}</span>
            </button>
            <button type="button" role="tab" aria-selected={tab === 'lost'} onClick={() => switchTab('lost')}>
              <IconBell /> Lost alerts <span className="count">{lost.length}</span>
            </button>
          </div>

          <div className="filters">
            <div className="search">
              <IconSearch />
              <label htmlFor="search" className="visually-hidden">Search</label>
              <input
                id="search"
                className="input"
                type="search"
                placeholder={tab === 'found' ? 'Search found items, e.g. wallet, umbrella…' : 'Search lost alerts…'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button type="button" className="btn btn-ghost btn-icon btn-sm clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <IconClose />
                </button>
              )}
            </div>
            <div className="select-wrap">
              <label className="label-sm" htmlFor="category">Category</label>
              <select id="category" className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="select-wrap">
              <label className="label-sm" htmlFor="status">Status</label>
              <select id="status" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">Any status</option>
                {Object.entries(statuses).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <Notice type="danger">
            {error}{' '}
            <button type="button" className="btn btn-secondary btn-sm" onClick={load} style={{ marginLeft: 8 }}><IconRefresh /> Retry</button>
          </Notice>
        ) : loading ? (
          <SkeletonGrid />
        ) : results.length === 0 ? (
          filtersActive ? (
            <EmptyState
              icon={<IconSearch />}
              title="Nothing matches those filters"
              actions={<button type="button" className="btn btn-secondary" onClick={() => { setSearch(''); setCategory('all'); setStatus('all'); }}>Clear filters</button>}
            >
              Try a broader search, or check the other tab.
            </EmptyState>
          ) : tab === 'found' ? (
            <EmptyState
              icon={<IconBox />}
              title="No found items posted yet"
              actions={<Link href="/post" className="btn btn-primary"><IconPlus /> Report a found item</Link>}
            >
              Picked something up on campus? Post it here so the owner can find it.
            </EmptyState>
          ) : (
            <EmptyState
              icon={<IconBell />}
              title="No lost alerts yet"
              actions={<Link href="/lost" className="btn btn-primary"><IconPlus /> Post a lost alert</Link>}
            >
              Lost something? Post an alert so whoever finds it knows who to contact.
            </EmptyState>
          )
        ) : (
          <>
            <div className="results-line" aria-live="polite">
              <span><b>{results.length}</b> {tab === 'found' ? 'found item' : 'lost alert'}{results.length === 1 ? '' : 's'}{filtersActive ? ' match' : ''}</span>
              <span>Newest first</span>
            </div>
            <div className="grid">
              {results.map((item) => <ItemCard key={item.id} item={item} />)}
            </div>
          </>
        )}

        <div className="how" style={{ marginTop: 40 }}>
          <div className="how-item">
            <IconCamera />
            <div><b>Photos help</b><span>A clear photo of a found item gets it claimed faster. Cover any ID numbers.</span></div>
          </div>
          <div className="how-item">
            <IconHand />
            <div><b>Prove it is yours</b><span>Claims ask for a detail only the owner knows, like a sticker or what is inside.</span></div>
          </div>
          <div className="how-item">
            <IconCheckCircle />
            <div><b>Close the loop</b><span>Once an item is returned, mark it in My posts so nobody else keeps asking.</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
