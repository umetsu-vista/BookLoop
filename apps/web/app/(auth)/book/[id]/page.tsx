'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function BookDetailPage() {
  const { id: _id } = useParams<{ id: string }>();

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <Link href="/bookshelf" style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
        ← 戻る
      </Link>

      {/* Book Info */}
      <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 24 }}>
        <div
          style={{
            width: 96,
            height: 144,
            borderRadius: 8,
            background: '#E0E7FF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 14, color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            書籍
          </span>
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>書籍タイトル</h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>著者名</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--color-gray-100)',
              fontSize: 10,
              color: 'var(--color-gray-600)',
            }}
          >
            ジャンル
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 999,
              background: '#EFF6FF',
              fontSize: 10,
              color: '#2563EB',
            }}
          >
            読書中
          </span>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            height: 8,
            background: 'var(--color-gray-100)',
            borderRadius: 4,
            marginBottom: 4,
          }}
        >
          <div style={{ width: '0%', height: '100%', background: 'var(--color-primary)', borderRadius: 4 }} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
          0 / 0 ページ (0%)
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[
          { value: '0分', label: '読書時間' },
          { value: '0', label: 'セッション' },
          { value: '-', label: '開始日' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{stat.value}</p>
            <p style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        <Link href="/session" className="btn-primary" style={{ textDecoration: 'none' }}>
          📖 続きを読む
        </Link>
        <Link href="/session?mode=manual" className="btn-outline" style={{ textDecoration: 'none' }}>
          🕐 あとから記録
        </Link>
      </div>

      {/* Notes */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>メモ</h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-tertiary)', textAlign: 'center', padding: '24px 0' }}>
          メモはまだありません
        </p>
      </div>
    </div>
  );
}
