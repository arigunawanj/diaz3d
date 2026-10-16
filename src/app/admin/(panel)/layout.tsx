import Link from 'next/link';
import { Logo } from '@/components/site/Header';

export const metadata = { title: 'Admin — diaz3d.', robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site admin">
      <header className="site-header">
        <div className="admin-brand"><Logo /><span>Admin</span></div>
        <nav className="admin-nav" aria-label="Admin">
          <Link href="/admin" className="nav-link">Pengajuan</Link>
          <Link href="/admin/katalog" className="nav-link">Katalog & harga</Link>
          <form action="/api/admin/logout" method="post"><button className="nav-link" type="submit">Keluar</button></form>
        </nav>
      </header>
      {children}
    </div>
  );
}
