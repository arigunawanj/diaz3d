import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diaz3D • 3D Party & Birthday Decoration Customizer',
  description: 'Interactive 3D Party & Event Decoration Studio with real-time 3D customization, balloon garlands, backdrops, marquee numbers, and instant quotations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-amber-400 selection:text-neutral-900">
        {children}
      </body>
    </html>
  );
}
