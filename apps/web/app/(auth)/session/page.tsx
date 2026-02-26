'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatTimerDisplay } from '@bookloop/shared';

type Mode = 'select' | 'timer' | 'manual' | 'complete';

const EXTERNAL_APPS = [
  { key: 'KINDLE', icon: '📙', label: 'Kindle' },
  { key: 'KOBO', icon: '📘', label: 'Kobo' },
  { key: 'APPLE_BOOKS', icon: '📕', label: 'Apple Books' },
  { key: 'OTHER', icon: '📗', label: 'その他' },
];

const QUICK_DATES = ['今日', '昨日', '一昨日'];
const QUICK_DURATIONS = [
  { label: '15分', minutes: 15 },
  { label: '30分', minutes: 30 },
  { label: '45分', minutes: 45 },
  { label: '1時間', minutes: 60 },
];

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'manual' ? 'manual' : 'select';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [method, setMethod] = useState<'in_app' | 'external'>('in_app');
  const [selectedApp, setSelectedApp] = useState('KINDLE');
  const [elapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pageStart, setPageStart] = useState('');
  const [pageEnd, setPageEnd] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedDate, setSelectedDate] = useState(0);
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('30');

  // Timer mode
  if (mode === 'timer') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-gray-900)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          padding: 24,
        }}
      >
        <button
          onClick={() => setMode('complete')}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'left' }}
        >
          ← 終了
        </button>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontSize: 72, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>
            {formatTimerDisplay(elapsed)}
          </p>
          <p style={{ fontSize: 14, opacity: 0.5, marginTop: 16 }}>
            {isPaused ? '一時停止中' : '読書中...'}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, marginBottom: 24 }}>
          <button
            onClick={() => setIsPaused(!isPaused)}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              border: '2px solid var(--color-gray-600)',
              background: 'none',
              color: 'white',
              fontSize: 20,
            }}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            onClick={() => setMode('complete')}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              background: 'white',
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--color-gray-900)',
            }}
          >
            終了
          </button>
          <button
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              border: '2px solid var(--color-gray-600)',
              background: 'none',
              color: 'white',
              fontSize: 20,
            }}
          >
            📝
          </button>
        </div>
      </div>
    );
  }

  // Complete mode
  if (mode === 'complete') {
    return (
      <div className="container" style={{ paddingTop: 60, paddingBottom: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 64 }}>🎉</p>
          <h1 style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>おつかれさまでした!</h1>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            今日も読書を続けられました
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700 }}>{formatTimerDisplay(elapsed)}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>読書時間</p>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700 }}>アプリ内</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>記録方法</p>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>読んだページ</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              className="input"
              placeholder="開始"
              value={pageStart}
              onChange={(e) => setPageStart(e.target.value)}
              type="number"
              style={{ textAlign: 'center' }}
            />
            <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
            <input
              className="input"
              placeholder="終了"
              value={pageEnd}
              onChange={(e) => setPageEnd(e.target.value)}
              type="number"
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>メモ</h2>
          <textarea
            className="input"
            placeholder="気づいたことを書き留めよう..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={4}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button className="btn-primary" onClick={() => router.replace('/home')}>
          保存する
        </button>
      </div>
    );
  }

  // Manual mode
  if (mode === 'manual') {
    return (
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 16 }}
        >
          ← 戻る
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>あとから記録</h1>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>読書した日</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {QUICK_DATES.map((label, i) => (
              <button
                key={label}
                onClick={() => setSelectedDate(i)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: selectedDate === i ? 'none' : '1px solid var(--color-border)',
                  background: selectedDate === i ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedDate === i ? 'white' : 'var(--color-text-primary)',
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>読書時間</h2>
          <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                className="input"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                type="number"
                style={{ textAlign: 'center' }}
              />
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>時間</span>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                className="input"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                type="number"
                style={{ textAlign: 'center' }}
              />
              <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>分</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {QUICK_DURATIONS.map((d) => (
              <button
                key={d.label}
                onClick={() => {
                  setHours(String(Math.floor(d.minutes / 60)));
                  setMinutes(String(d.minutes % 60));
                }}
                style={{
                  padding: '4px 12px',
                  borderRadius: 16,
                  border: 'none',
                  background: 'var(--color-gray-100)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 12,
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>読んだページ (任意)</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              className="input"
              placeholder="開始"
              value={pageStart}
              onChange={(e) => setPageStart(e.target.value)}
              type="number"
              style={{ textAlign: 'center' }}
            />
            <span style={{ color: 'var(--color-text-tertiary)' }}>→</span>
            <input
              className="input"
              placeholder="終了"
              value={pageEnd}
              onChange={(e) => setPageEnd(e.target.value)}
              type="number"
              style={{ textAlign: 'center' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>メモ (任意)</h2>
          <textarea
            className="input"
            placeholder="気づいたことを書き留めよう..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            style={{ resize: 'vertical' }}
          />
        </div>

        <button className="btn-primary" onClick={() => router.replace('/home')}>
          保存する
        </button>
      </div>
    );
  }

  // Select mode (default)
  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 40, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <button
        onClick={() => router.back()}
        style={{ background: 'none', border: 'none', fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24, textAlign: 'left' }}
      >
        ← 戻る
      </button>

      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>読書方法を選択</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => setMethod('in_app')}
          style={{
            padding: 24,
            borderRadius: 16,
            border: `2px solid ${method === 'in_app' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: method === 'in_app' ? 'var(--color-background)' : 'var(--color-surface)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 32 }}>📖</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>このアプリで読む</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            BookLoop 内でタイマー計測
          </p>
        </button>

        <button
          onClick={() => setMethod('external')}
          style={{
            padding: 24,
            borderRadius: 16,
            border: `2px solid ${method === 'external' ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: method === 'external' ? 'var(--color-background)' : 'var(--color-surface)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: 32 }}>📱</p>
          <p style={{ fontSize: 16, fontWeight: 600, marginTop: 8 }}>外部アプリで読む</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
            Kindle / Kobo / Apple Books 等
          </p>
        </button>
      </div>

      {method === 'external' && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>使用するアプリ</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {EXTERNAL_APPS.map((app) => (
              <button
                key={app.key}
                onClick={() => setSelectedApp(app.key)}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: `1px solid ${selectedApp === app.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: selectedApp === app.key ? 'var(--color-background)' : 'var(--color-surface)',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: 24 }}>{app.icon}</p>
                <p style={{ fontSize: 14, fontWeight: 500, marginTop: 4 }}>{app.label}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', textAlign: 'center', marginBottom: 12 }}>
          タイマーはバックグラウンドで計測されます
        </p>
        <button className="btn-primary" onClick={() => setMode('timer')}>
          {method === 'in_app'
            ? '読書をはじめる'
            : `タイマーを開始して ${EXTERNAL_APPS.find((a) => a.key === selectedApp)?.label} で読む`}
        </button>
      </div>
    </div>
  );
}
