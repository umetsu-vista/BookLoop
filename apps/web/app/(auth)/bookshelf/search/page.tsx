'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { BOOK_SEARCH_DEBOUNCE_MS } from '@bookloop/shared';

function CoverImage({ url, title }: { url: string | null; title: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div
        style={{
          width: 40,
          height: 56,
          borderRadius: 4,
          background: '#E0E7FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 8,
          color: 'var(--color-text-secondary)',
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {title.slice(0, 4)}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={title}
      style={{ width: 40, height: 56, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
      onError={() => setFailed(true)}
    />
  );
}

interface SearchResult {
  id: string;
  title: string;
  author: string | null;
  publisher: string | null;
  totalPages: number | null;
  coverUrl: string | null;
}

async function searchBooks(query: string): Promise<SearchResult[]> {
  const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const json = (await res.json()) as { data: SearchResult[] };
  return json.data;
}

export default function BookshelfSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length === 0) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const books = await searchBooks(q);
      setResults(books);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(text), BOOK_SEARCH_DEBOUNCE_MS);
  };

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Link
          href="/bookshelf"
          style={{ fontSize: 14, color: 'var(--color-text-secondary)', textDecoration: 'none' }}
        >
          ← 戻る
        </Link>
      </div>

      {/* Search Input */}
      <input
        className="input"
        type="text"
        placeholder="タイトル・著者・ISBNで検索..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        autoFocus
        style={{ marginBottom: 24 }}
      />

      {/* Loading */}
      {isSearching && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-tertiary)' }}>
          <p style={{ fontSize: 14 }}>検索中...</p>
        </div>
      )}

      {/* Empty */}
      {!isSearching && hasSearched && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-secondary)' }}>
          <p style={{ fontSize: 14 }}>見つかりませんでした</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            手動で追加できます
          </p>
        </div>
      )}

      {/* Results */}
      {results.map((result) => (
        <div
          key={result.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            marginBottom: 8,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
          }}
        >
          <CoverImage url={result.coverUrl} title={result.title} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{result.title}</p>
            {result.author && (
              <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                {result.author}
              </p>
            )}
            {result.publisher && (
              <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginTop: 2 }}>
                {result.publisher}
                {result.totalPages ? ` · ${result.totalPages}ページ` : ''}
              </p>
            )}
          </div>
          <button
            style={{
              padding: '6px 12px',
              fontSize: 12,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              width: 'auto',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + 追加
          </button>
        </div>
      ))}

      {/* Initial state */}
      {!hasSearched && !isSearching && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-tertiary)' }}>
          <p style={{ fontSize: 48 }}>🔍</p>
          <p style={{ fontSize: 14, marginTop: 12 }}>タイトルや著者名で検索してください</p>
        </div>
      )}
    </div>
  );
}
