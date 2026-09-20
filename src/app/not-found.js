import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { IconSearch } from '@/components/Icons';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <div className="container page">
      <EmptyState
        icon={<IconSearch />}
        title="Page not found"
        actions={<Link href="/" className="btn btn-primary">Back to Browse</Link>}
      >
        The link may be old, or the post was removed after its 30-day limit.
      </EmptyState>
    </div>
  );
}
