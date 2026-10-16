import { Header } from '@/components/site/Header';
import { Hero } from '@/components/site/Hero';
import { HowItWorks } from '@/components/site/HowItWorks';
import { Footer } from '@/components/site/Footer';
import { Configurator } from '@/components/configurator/Configurator';
import { getPricingContext } from '@/server/pricingContext';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { catalog, basePrice } = await getPricingContext();
  return (
    <main className="site">
      <Header />
      <Hero />
      <Configurator catalog={catalog} basePrice={basePrice} />
      <HowItWorks />
      <Footer />
    </main>
  );
}
