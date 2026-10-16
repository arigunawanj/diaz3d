import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { HowItWorks } from '@/components/site/HowItWorks';
import { Footer } from '@/components/site/Footer';
import { Configurator } from '@/components/configurator/Configurator';
import { DEFAULT_CATALOG, BASE_PACKAGE_PRICE } from '@/domain/catalog';

export default function Home() {
  return (
    <main className="site">
      <Header />
      <Hero />
      <Configurator catalog={DEFAULT_CATALOG} basePrice={BASE_PACKAGE_PRICE} />
      <HowItWorks />
      <Footer />
    </main>
  );
}
