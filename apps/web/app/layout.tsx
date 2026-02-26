import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookLoop',
  description: '読書を、毎日の習慣に。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
