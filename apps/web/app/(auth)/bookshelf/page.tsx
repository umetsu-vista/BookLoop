'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BOOK_STATUS } from '@bookloop/shared';

const TABS = [
  { key: BOOK_STATUS.WANT_TO_READ, label: '読みたい' },
  { key: BOOK_STATUS.READING, label: '読書中' },
  { key: BOOK_STATUS.FINISHED, label: '読了' },
];

const EMPTY_MESSAGES: Record<string, { emoji: string; message: string }> = {
  WANT_TO_READ: { emoji: '📚', message: '読みたい本を追加しよう' },
  READING: { emoji: '📖', message: '今読んでいる本を追加しよう' },
  FINISHED: { emoji: '🎉', message: '最初の1冊を読了しよう！' },
};

export default function BookshelfPage() {
  const [activeTab, setActiveTab] = useState<string>(BOOK_STATUS.READING);
  const empty = EMPTY_MESSAGES[activeTab] ?? { emoji: '📖', message: '本を追加しよう' };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>本棚</h1>

      {/* Search Bar */}
      <Link
        href="/bookshelf/search"
        style={{
          display: 'block',
          padding: '10px 16px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          color: 'var(--color-text-tertiary)',
          fontSize: 14,
          marginBottom: 16,
          textDecoration: 'none',
        }}
      >
        タイトル・著者で検索...
      </Link>

      {/* Status Tabs */}
      <div style={{ display: 'flex', marginBottom: 16 }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.key ? 'var(--color-primary)' : 'transparent'}`,
              color: activeTab === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              fontSize: 14,
              fontWeight: activeTab === tab.key ? 600 : 500,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
        <p style={{ fontSize: 64 }}>{empty.emoji}</p>
        <p style={{ fontSize: 14, marginTop: 12 }}>{empty.message}</p>
      </div>
    </div>
  );
}
