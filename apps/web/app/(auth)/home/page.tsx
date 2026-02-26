'use client';

import Link from 'next/link';
import { getGreeting } from '@bookloop/shared';

export default function HomePage() {
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* Header */}
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>{getGreeting('Asia/Tokyo')}</h1>

      {/* Streak Card */}
      <div
        style={{
          background: 'var(--color-gray-800)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          color: 'white',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 48, fontWeight: 900 }}>0</span>
          <span style={{ fontSize: 16, fontWeight: 600, opacity: 0.8 }}>日連続 🔥</span>
        </div>
        <p style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>最長記録: 0日</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Today's Goal */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>今日の目標</h2>
        <div className="card">
          <p style={{ fontSize: 14, marginBottom: 8 }}>今日まだ読書していません</p>
          <div
            style={{
              height: 6,
              background: 'var(--color-gray-100)',
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* Reading List */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>読書中</h2>
          <Link href="/bookshelf" style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            すべて見る →
          </Link>
        </div>
        <div
          style={{
            textAlign: 'center',
            padding: 40,
            color: 'var(--color-text-secondary)',
          }}
        >
          <p style={{ fontSize: 64 }}>📖</p>
          <p style={{ fontSize: 14, marginTop: 12 }}>最初の1冊を追加しよう</p>
          <Link
            href="/bookshelf"
            className="btn-primary"
            style={{ display: 'inline-block', marginTop: 16, width: 'auto', padding: '8px 24px' }}
          >
            + 書籍を探す
          </Link>
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href="/session" className="btn-primary" style={{ textDecoration: 'none' }}>
          📖 読書をはじめる
        </Link>
        <Link href="/session?mode=manual" className="btn-outline" style={{ textDecoration: 'none' }}>
          🕐 あとから記録
        </Link>
      </div>
    </div>
  );
}
