'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEST_EMAIL = 'test@bookloop.dev';
const TEST_PASSWORD = 'password123';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillTestCredentials = () => {
    setEmail(TEST_EMAIL);
    setPassword(TEST_PASSWORD);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('有効なメールアドレスを入力してください');
      return;
    }
    if (password.length < 8) {
      setError('パスワードは8文字以上で入力してください');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Clerk integration — テスト用クレデンシャルで認証
      if (email === TEST_EMAIL && password === TEST_PASSWORD) {
        router.replace('/home');
      } else {
        setError('メールアドレスまたはパスワードが正しくありません');
      }
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: 64 }}>📚</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>BookLoop</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4 }}>
            読書を、毎日の習慣に。
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>メールでログイン</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <form onSubmit={handleSignIn}>
          <input
            className="input"
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <input
            className="input"
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          {error && (
            <p style={{ fontSize: 12, color: 'var(--color-danger)', marginBottom: 12 }}>{error}</p>
          )}
          <button className="btn-primary" type="submit" disabled={isLoading}>
            ログイン
          </button>
        </form>

        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 24 }}>
          アカウントをお持ちでない方 → サインアップ
        </p>

        {/* テスト用クレデンシャル */}
        <div style={{
          marginTop: 32,
          padding: 16,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            テスト用アカウント
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontFamily: 'monospace' }}>
            Email: {TEST_EMAIL}
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontFamily: 'monospace', marginBottom: 12 }}>
            Password: {TEST_PASSWORD}
          </p>
          <button
            className="btn-outline"
            type="button"
            onClick={fillTestCredentials}
          >
            テスト情報を入力
          </button>
        </div>
      </div>
    </div>
  );
}
