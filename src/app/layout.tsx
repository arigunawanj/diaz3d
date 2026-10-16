import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  title: 'diaz3d. — Desain Dekorasi Acaramu dalam 3D',
  description: 'Rancang dekorasi ulang tahun anak, sweet 17, atau acara formal dalam 3D. Atur balon, backdrop, dan properti, lihat estimasi biaya seketika, lalu ajukan ke tim kami.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#F6F3EE' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
