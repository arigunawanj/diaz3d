import { ArrowUpRight } from 'lucide-react';

export const Logo = () => (
  <a href="/" className="logo" aria-label="diaz3d beranda">
    <span className="logo-mark" aria-hidden="true"><i style={{ height: 22 }} /><i style={{ height: 15 }} /><i style={{ height: 9 }} /></span>
    <span>diaz3d<b>.</b></span>
  </a>
);

export const Header = () => (
  <header className="site-header">
    <Logo />
    <a href="#cara-kerja" className="nav-link">Cara kerja <ArrowUpRight size={15} aria-hidden="true" /></a>
  </header>
);
