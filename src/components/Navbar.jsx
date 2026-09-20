'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { IconMenu, IconClose, IconLogout, IconAlert } from './Icons';

const LINKS = [
  { href: '/', label: 'Browse' },
  { href: '/post', label: 'Report found item' },
  { href: '/lost', label: 'Post lost alert' },
  { href: '/my-posts', label: 'My posts' },
];

function initials(user) {
  const src = user?.displayName || user?.email || '?';
  return src.trim().charAt(0).toUpperCase();
}

export default function Navbar() {
  const { user, loading, signOut, authError, clearAuthError } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link href="/" className="nav-brand" aria-label="CJC Lost and Found home">
          <img src="/cjc-logo-transparent.png" alt="" width="44" height="34" />
          <span className="nav-brand-text">
            <small>Cor Jesu College</small>
            <span>Lost &amp; Found</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" aria-current={isActive(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          {loading ? (
            <span className="spinner" aria-label="Checking sign-in" />
          ) : user ? (
            <div className="nav-user">
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="avatar-fallback" aria-hidden="true">{initials(user)}</span>
              )}
              <span className="nav-user-name" title={user.email}>{user.displayName || user.email}</span>
              <button type="button" onClick={signOut} className="btn btn-ghost btn-sm btn-signout">
                <IconLogout /> Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
          )}

          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      <div id="mobile-nav" className="nav-mobile" hidden={!open}>
        <div className="container">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link" aria-current={isActive(l.href) ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          {user && (
            <div className="nav-mobile-foot">
              <span className="nav-user-name" style={{ display: 'block', maxWidth: '60%' }}>{user.displayName || user.email}</span>
              <button type="button" onClick={signOut} className="btn btn-secondary btn-sm">
                <IconLogout /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {authError && (
        <div className="container" style={{ paddingTop: 12, paddingBottom: 12 }}>
          <div className="notice notice-danger" role="alert">
            <IconAlert />
            <span style={{ flex: 1 }}>{authError}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={clearAuthError} aria-label="Dismiss">
              <IconClose />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
