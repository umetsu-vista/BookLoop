'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // TODO: Check auth state with Clerk
    // For now, redirect to sign-in
    router.replace('/sign-in');
  }, [router]);

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 64 }}>📚</p>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>BookLoop</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>読書を、毎日の習慣に。</p>
      </div>
    </div>
  );
}
