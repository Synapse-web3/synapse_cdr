import Hero from '../components/Hero';
import Features from '../components/Features';
import Integrations from '../components/Integrations';
import Stats from '../components/Stats';
import Domains from '../components/Domains';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center pb-0">
      {/* Hero Section (Aether) */}
      <section className="w-full px-4 md:px-8 pt-4 md:pt-8 flex justify-center">
        <Hero />
      </section>

      {/* Spacer */}
      <div className="h-24 md:h-32 w-full max-w-[1400px] relative">
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 h-full w-px bg-gradient-to-b from-black/10 to-transparent"></div>
      </div>

      <section id="features" className="w-full scroll-mt-24">
        <Features />
      </section>

      <section id="integrations" className="w-full mt-12 md:mt-24 scroll-mt-24">
        <Integrations />
      </section>

      <section id="stats" className="w-full mt-12 scroll-mt-24">
        <Stats />
      </section>

      <section id="domains" className="w-full mt-12 md:mt-24 scroll-mt-24">
        <Domains />
      </section>

      <section id="pricing" className="w-full mt-24 scroll-mt-24">
        <Pricing />
      </section>

      <section id="faq" className="w-full mt-24 scroll-mt-24">
        <FAQ />
      </section>

      <section id="cta" className="w-full mt-24 mb-12 scroll-mt-24">
        <CTA />
      </section>
    </div>
  );
}