'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui';
import { IconAlert, IconRefresh } from '@/components/Icons';

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="container page">
      <EmptyState
        icon={<IconAlert />}
        title="Something went wrong"
        actions={
          <>
            <button type="button" className="btn btn-primary" onClick={reset}><IconRefresh /> Try again</button>
            <Link href="/" className="btn btn-secondary">Go to Browse</Link>
          </>
        }
      >
        The page hit an unexpected error. Reloading usually fixes it. If it keeps happening, tell the Lost &amp; Found admin.
      </EmptyState>
    </div>
  );
}
