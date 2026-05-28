import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useWallet } from './WalletContext';

const pageNav = [
  { to: '/protocol', label: 'Protocol' },
  { to: '/hypothesis-lab', label: 'Hypothesis Lab', comingSoon: true },
  { to: '/biollm', label: 'BioLLM', comingSoon: true },
  { to: '/labs', label: 'Labs', comingSoon: true },
  { to: '/feed', label: 'Feed', comingSoon: true },
  { to: '/ip-nft', label: 'IP-NFT', comingSoon: true },
  { to: '/dashboard', label: 'Dashboard', comingSoon: true },
];

const landingNav = [
  { to: '/protocol', label: 'Protocol', isRoute: true },
  { to: '#features', label: 'Pillars' },
  { to: '#integrations', label: 'Stack' },
  { to: '#stats', label: 'Stats' },
  { to: '#domains', label: 'Use Cases' },
  { to: '#pricing', label: 'Pricing' },
  { to: '#faq', label: 'FAQ' },
];

export default function GlobalHeader({ onFaucet }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const wctx = useWallet?.();

  const isLanding = location.pathname === '/';
  const nav = isLanding ? landingNav : pageNav;

  const wallet = wctx?.wallet;
  const short = wallet?.address ? `${wallet.address.slice(0,4)}…${wallet.address.slice(-4)}` : '';

  const renderLink = (n, onClick) => {
    if (n.comingSoon) {
      return (
        <Link key={n.to} to={n.to} onClick={onClick} className={clsx("hover:text-black transition-colors font-geist px-3 py-2 rounded-xl hover:bg-black/5 lg:p-0 lg:rounded-none lg:hover:bg-transparent", location.pathname === n.to ? "text-black font-medium lg:bg-transparent" : "text-zinc-700")}>
          {n.label}
        </Link>
      );
    }
    if (n.to.startsWith('#')) {
      return (
        <a key={n.to} href={n.to} onClick={onClick} className="hover:text-black transition-colors font-geist text-zinc-700 px-3 py-2 rounded-xl hover:bg-black/5 lg:p-0 lg:rounded-none lg:hover:bg-transparent">
          {n.label}
        </a>
      );
    }
    return (
      <Link key={n.to} to={n.to} onClick={onClick} className={clsx("hover:text-black transition-colors font-geist px-3 py-2 rounded-xl hover:bg-black/5 lg:p-0 lg:rounded-none lg:hover:bg-transparent", location.pathname === n.to ? "text-black font-medium lg:bg-transparent" : "text-zinc-700")}>
        {n.label}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-auto w-full backdrop-blur-md bg-white/80 border-b border-black/5">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer shrink-0">
          <iconify-icon icon="solar:atom-linear" width="26" height="26" class="text-black group-hover:text-indigo-600 transition-colors"></iconify-icon>
          <span className="font-medium text-base md:text-lg tracking-tight font-geist text-black">Synapse</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          <div className="hidden lg:flex items-center bg-black/5 hover:bg-black/10 backdrop-blur-md rounded-full px-5 py-2.5 gap-5 text-xs text-zinc-700 border border-black/5 transition-all duration-300">
            {nav.map(n => renderLink(n))}
          </div>

          {wallet ? (
            <button onClick={() => wctx.disconnect()} className="hidden md:flex items-center gap-2 bg-black/5 hover:bg-black/10 text-black px-4 py-2 rounded-full text-xs font-medium transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{short}
            </button>
          ) : (
            <button onClick={() => wctx?.setOpen(true)} className="hidden md:inline-block bg-black/5 hover:bg-black/10 text-black px-4 py-2 rounded-full text-xs font-medium transition-all">
              Connect Wallet
            </button>
          )}

          <Link to="/hypothesis-lab" className="hidden md:inline-block bg-black text-white px-3.5 md:px-5 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium hover:bg-zinc-800 transition-colors tracking-tight font-geist whitespace-nowrap">
            Commit Hypothesis
          </Link>

          <button onClick={() => setOpen(o => !o)} className="lg:hidden w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black" aria-label="Menu">
            <iconify-icon icon={open ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width="22"></iconify-icon>
          </button>
        </nav>
      </div>

      {open && (
        <div className="lg:hidden border-t border-black/5 bg-white/95 backdrop-blur-md px-4 py-4 flex flex-col gap-1 max-h-[80vh] overflow-y-auto">
          {nav.map(n => renderLink(n, () => setOpen(false)))}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 mt-2 border-t border-black/5">
            {wallet ? (
              <button onClick={() => { wctx.disconnect(); setOpen(false); }} className="flex-1 bg-black/5 text-black px-4 py-3 rounded-full text-sm font-medium">Disconnect {short}</button>
            ) : (
              <button onClick={() => { wctx?.setOpen(true); setOpen(false); }} className="flex-1 bg-black/5 text-black px-4 py-3 rounded-full text-sm font-medium">Connect Wallet</button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
