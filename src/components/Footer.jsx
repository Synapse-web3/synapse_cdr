import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full relative z-10 border-t border-black/5 bg-white/80 backdrop-blur-xl pt-20 pb-10 px-6 mt-12">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">

        <div className="md:col-span-4 flex flex-col items-start">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer mb-6">
            <iconify-icon icon="solar:atom-linear" width="32" height="32" class="text-black group-hover:text-indigo-600 transition-colors"></iconify-icon>
            <span className="font-medium text-2xl tracking-tight text-black">Synapse Protocol</span>
          </Link>
          <p className="text-zinc-600 text-sm max-w-sm leading-relaxed mb-8">
            Physical AI infrastructure on Base. Aerial telemetry attestation, robotic training data marketplace, hypothesis market for robotics R&amp;D and an autonomous agent fleet — unified under one Web4 protocol with Proof-of-Physical-Work.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: 'simple-icons:x', label: 'X', href: null },
              { icon: 'simple-icons:github', label: 'synapse_cdr', href: 'https://github.com/Synapse-web3/synapse_cdr' },
              { icon: 'simple-icons:github', label: 'synapse_contract', href: 'https://github.com/Synapse-web3/synapse_contract' },
              { icon: 'simple-icons:telegram', label: 'Telegram', href: null },
            ].map(({ icon, label, href }) =>
              href ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-zinc-700 hover:text-black hover:bg-black/10 transition-all"
                  aria-label={label}
                >
                  <iconify-icon icon={icon} width="16"></iconify-icon>
                </a>
              ) : (
                <button
                  key={label}
                  type="button"
                  onClick={() => {}}
                  className="w-10 h-10 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-zinc-700 hover:text-black hover:bg-black/10 transition-all"
                  aria-label={label}
                >
                  <iconify-icon icon={icon} width="16"></iconify-icon>
                </button>
              )
            )}
          </div>
        </div>

        <div className="md:col-span-2 md:col-start-6 flex flex-col gap-3">
          <h4 className="text-black font-medium text-xs tracking-widest uppercase mb-2">
            Surfaces
          </h4>
          <Link to="/hypothesis-lab" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Hypothesis Lab</Link>
          <Link to="/biollm" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">BioLLM Marketplace</Link>
          <Link to="/labs" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Robotic Labs</Link>
          <Link to="/feed" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Experiment Feed</Link>
          <Link to="/ip-nft" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">IP-NFT Explorer</Link>
        </div>

        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-black font-medium text-xs tracking-widest uppercase mb-2">
            Network
          </h4>
          <Link to="/data-market" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Data Market</Link>
          <Link to="/campaigns" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Research Campaigns</Link>
          <Link to="/agents" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Agent Console</Link>
          <Link to="/dashboard" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">My Synapse</Link>
        </div>

        <div className="md:col-span-2 flex flex-col gap-3">
          <h4 className="text-black font-medium text-xs tracking-widest uppercase mb-2">
            Protocol
          </h4>
          <Link to="/protocol" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Aerial Attestation</Link>
          <Link to="/data-market" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Training Data Market</Link>
          <Link to="/hypothesis-lab" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Hypothesis Market</Link>
          <Link to="/labs" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Robotic Lab Network</Link>
          <Link to="/ip-nft" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">IP-NFT Ecosystem</Link>
          <Link to="/agents" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">Autonomous Agent Fleet</Link>
          <Link to="/dashboard" className="text-zinc-500 text-sm hover:text-black transition-colors w-max">$SYNAPSE Token</Link>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto border-t border-black/5 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
        <p>© {new Date().getFullYear()} Synapse Protocol. Confidential & Proprietary · v1.0.0 · May 2026</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
          <Link to="/biosecurity" className="hover:text-black transition-colors">Biosecurity</Link>
        </div>
      </div>
    </footer>
  );
}
