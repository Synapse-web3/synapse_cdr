import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import GlobalHeader from './GlobalHeader';
import Footer from './Footer';
import { WalletProvider } from './WalletContext';
import WalletModal from './WalletModal';
import FaucetModal from './FaucetModal';
import { gsap, ScrollTrigger } from '../lib/animations';

export default function Layout() {
  const location = useLocation();
  const [faucetOpen, setFaucetOpen] = useState(false);

  useEffect(() => {
    const open = () => setFaucetOpen(true);
    window.addEventListener('synapse:faucet', open);
    return () => window.removeEventListener('synapse:faucet', open);
  }, []);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
    });
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCb = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerCb);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tickerCb);
      lenis.destroy();
    };
  }, []);
  useEffect(() => { ScrollTrigger.refresh(); }, [location.pathname]);
  return (
    <WalletProvider>
      <div className="min-h-screen bg-white text-black selection:bg-black/20 flex flex-col font-geist">
        <GlobalHeader onFaucet={() => setFaucetOpen(true)} />

        {/* Global Background Grid */}
        <div className="bg-grid-container">
          <div className="bg-grid-plane"></div>
        </div>

        <main className="flex-grow relative z-10 flex flex-col pt-16 md:pt-20">
          <Outlet />
        </main>

        <Footer />
        <WalletModal />
        <FaucetModal open={faucetOpen} onClose={() => setFaucetOpen(false)} />
      </div>
    </WalletProvider>
  );
}
