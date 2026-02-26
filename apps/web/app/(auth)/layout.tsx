import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Bottom Navigation */}
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'center',
          padding: '8px 0 env(safe-area-inset-bottom, 8px)',
        }}
      >
        <div style={{ display: 'flex', maxWidth: 480, width: '100%', justifyContent: 'space-around' }}>
          {[
            { href: '/home', icon: '🏠', label: 'ホーム' },
            { href: '/bookshelf', icon: '📚', label: '本棚' },
            { href: '/stats', icon: '📊', label: '統計' },
            { href: '/profile', icon: '👤', label: '設定' },
          ].map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: '4px 12px',
                fontSize: 10,
                color: 'var(--color-text-tertiary)',
                textDecoration: 'none',
              }}
            >
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
