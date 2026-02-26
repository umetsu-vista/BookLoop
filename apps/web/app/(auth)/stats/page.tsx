'use client';

import { useState } from 'react';

type Period = 'weekly' | 'monthly' | 'total';

export default function StatsPage() {
  const [period, setPeriod] = useState<Period>('weekly');

  const kpis = [
    { label: '読書時間', value: '0分' },
    { label: '読了冊数', value: '0冊' },
    { label: 'ストリーク', value: '0日' },
    { label: 'ページ数', value: '0p' },
  ];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>統計</h1>

      {/* Period Tabs */}
      <div style={{ display: 'flex', marginBottom: 24 }}>
        {([
          ['weekly', '今週'],
          ['monthly', '今月'],
          ['total', '累計'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'none',
              border: 'none',
              borderBottom: `2px solid ${period === key ? 'var(--color-primary)' : 'transparent'}`,
              color: period === key ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
              fontSize: 14,
              fontWeight: period === key ? 600 : 500,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 24,
        }}
      >
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 700 }}>{kpi.value}</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
          {period === 'weekly' ? '日別読書時間' : period === 'monthly' ? '月間ヒートマップ' : '累計サマリー'}
        </h2>
        <div
          style={{
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-tertiary)',
            fontSize: 14,
          }}
        >
          読書を始めるとここに統計が表示されます
        </div>
      </div>

      {/* Average */}
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>平均セッション時間</p>
        <p style={{ fontSize: 20, fontWeight: 700, marginTop: 4 }}>0分</p>
      </div>
    </div>
  );
}
