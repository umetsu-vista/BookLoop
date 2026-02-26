'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const handleLogout = () => {
    if (confirm('ログアウトしますか？')) {
      router.replace('/sign-in');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('この操作は取り消せません。すべてのデータが削除されます。')) {
      // TODO: Delete account
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <p
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      {children}
    </p>
  );

  const Row = ({
    label,
    value,
    onClick,
    danger,
  }: {
    label: string;
    value?: string;
    onClick?: () => void;
    danger?: boolean;
  }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontSize: 14, color: danger ? 'var(--color-danger)' : 'var(--color-text-primary)' }}>
        {label}
      </span>
      {value && <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{value}</span>}
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: 'var(--color-border)', margin: '0 16px' }} />;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>設定</h1>

      {/* Profile */}
      <div style={{ marginBottom: 24 }}>
        <SectionTitle>プロフィール</SectionTitle>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Row label="表示名" value="ユーザー" />
        </div>
      </div>

      {/* Reading Goals */}
      <div style={{ marginBottom: 24 }}>
        <SectionTitle>読書目標</SectionTitle>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Row label="週の読書日数" value="5日" />
          <Divider />
          <Row label="月の読了冊数" value="2冊" />
        </div>
      </div>

      {/* Notification */}
      <div style={{ marginBottom: 24 }}>
        <SectionTitle>通知設定</SectionTitle>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <span style={{ fontSize: 14 }}>リマインド通知</span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
            />
          </div>
          {reminderEnabled && (
            <>
              <Divider />
              <Row label="通知時刻" value="21:00" />
            </>
          )}
        </div>
      </div>

      {/* Account */}
      <div style={{ marginBottom: 24 }}>
        <SectionTitle>アカウント</SectionTitle>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Row label="ログアウト" onClick={handleLogout} />
          <Divider />
          <Row label="アカウントを削除" onClick={handleDeleteAccount} danger />
        </div>
      </div>

      {/* App Info */}
      <div style={{ marginBottom: 24 }}>
        <SectionTitle>アプリ情報</SectionTitle>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Row label="バージョン" value="1.0.0" />
        </div>
      </div>
    </div>
  );
}
