import Link from 'next/link';
import { POST_TTL_DAYS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong style={{ color: 'var(--ink-2)' }}>CJC Lost &amp; Found</strong>
          <span> · Cor Jesu College, Digos City</span>
          <div style={{ marginTop: 4 }}>Posts are removed automatically after {POST_TTL_DAYS} days.</div>
        </div>
        <nav className="footer-links" aria-label="Footer">
          <Link href="/">Browse</Link>
          <Link href="/post">Report found item</Link>
          <Link href="/lost">Post lost alert</Link>
          <Link href="/my-posts">My posts</Link>
        </nav>
      </div>
    </footer>
  );
}
