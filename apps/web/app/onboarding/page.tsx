'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_DAYS_PER_WEEK, DEFAULT_BOOKS_PER_MONTH } from '@bookloop/shared';

const DAYS_OPTIONS = [3, 4, 5, 7];
const BOOKS_OPTIONS = [1, 2, 3, 4];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [daysPerWeek, setDaysPerWeek] = useState(DEFAULT_DAYS_PER_WEEK);
  const [booksPerMonth, setBooksPerMonth] = useState(DEFAULT_BOOKS_PER_MONTH);

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      router.replace('/home');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', flexDirection: 'column', paddingTop: 80, paddingBottom: 40 }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 80 }}>📚</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16 }}>BookLoop</h1>
            <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', marginTop: 8 }}>
              読書を、毎日の習慣に。
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 16, lineHeight: 1.8 }}>
              タイマー・ストリーク・外部アプリ連携で<br />
              どこで読んでも全部記録されます。
            </p>
          </div>
        )}

        {step === 1 && (
          <div style={{ width: '100%' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 8 }}>
              読書目標を設定
            </h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', textAlign: 'center', marginBottom: 32 }}>
              あなたに合ったペースを選びましょう
            </p>

            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>週の読書日数</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {DAYS_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDaysPerWeek(d)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 12,
                    border: daysPerWeek === d ? 'none' : '1px solid var(--color-border)',
                    background: daysPerWeek === d ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: daysPerWeek === d ? 'white' : 'var(--color-text-primary)',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {d}日
                </button>
              ))}
            </div>

            <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>月の読了冊数</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {BOOKS_OPTIONS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBooksPerMonth(b)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: 12,
                    border: booksPerMonth === b ? 'none' : '1px solid var(--color-border)',
                    background: booksPerMonth === b ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: booksPerMonth === b ? 'white' : 'var(--color-text-primary)',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {b}冊
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>最初の1冊を追加</h1>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>
              本棚に最初の1冊を追加しましょう。<br />
              あとから追加することもできます。
            </p>
            <button
              onClick={handleNext}
              style={{
                marginTop: 24,
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                fontSize: 14,
                textDecoration: 'underline',
              }}
            >
              あとで追加する
            </button>
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: step === i ? 'var(--color-gray-800)' : 'var(--color-gray-300)',
              }}
            />
          ))}
        </div>
        <button className="btn-primary" onClick={handleNext}>
          {step === 2 ? '始める' : '次へ'}
        </button>
      </div>
    </div>
  );
}
