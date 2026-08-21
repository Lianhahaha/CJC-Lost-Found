'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const { user, loading, signIn, signOut, authError } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Browse' },
    { href: '/my-posts', label: 'My Posts' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <img src="/cjc-logo-transparent.png?v=2" alt="CJC Logo" style={{ height: 28, width: 'auto', display: 'block' }} />
            <span className="logo-text">Lost &amp; Found</span>
          </Link>

          <span className="navbar-divider">/</span>

          <div className="navbar-links">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname === l.href ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="navbar-spacer" />

          {loading ? (
            <div className="spinner" style={{ width: 18, height: 18 }} />
          ) : user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {user.photoURL && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="avatar" className="avatar" />
              )}
              <span style={{ 
                fontSize: 13, 
                color: 'var(--color-fg-muted)', 
                maxWidth: 120, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                display: 'none'
              }} className="hide-mobile">
                {user.displayName || user.email}
              </span>
              <button onClick={signOut} className="btn btn-default btn-sm">Sign out</button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-accent btn-sm">
              Login
            </Link>
          )}

        </div>
      </nav>

      {authError && (
        <div className="container" style={{ marginTop: 16 }}>
          <div className="alert alert-danger" style={{ marginBottom: 0 }}>
            <strong>Authentication Error:</strong> {authError.includes('api-key-not-valid') ? 'Your Firebase API keys in .env.local are missing or invalid. Please check your setup.' : authError}
          </div>
        </div>
      )}

      <style jsx>{`
        .hide-mobile {
          display: block;
        }
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
