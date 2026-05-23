import { useEffect } from 'react';
import { useWallet } from './WalletContext';

const WALLETS = [
  {
    id:      'metamask',
    name:    'MetaMask',
    desc:    'Connect using MetaMask browser extension',
    imgSrc:  'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/MetaMask_Fox.svg/3840px-MetaMask_Fox.svg.png',
  },
  {
    id:   'coinbase',
    name: 'Coinbase Wallet',
    desc: 'Connect using Coinbase Wallet',
    icon: 'simple-icons:coinbase',
    iconColor: '#0052FF',
  },
];

export default function WalletModal() {
  const { open, setOpen, connect, connecting, error } = useWallet();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden"
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black z-10"
        >
          <iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon>
        </button>

        <div className="p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-light tracking-tight text-black">Connect a Wallet</h2>
            <p className="text-sm text-zinc-600 mt-2">
              Choose an EVM wallet to access your Synapse dashboard on Base.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {WALLETS.map(w => (
              <button
                key={w.id}
                onClick={() => connect(w.id)}
                disabled={!!connecting}
                className="group flex items-center gap-4 w-full p-4 rounded-2xl bg-black/5 hover:bg-black/10 border border-black/5 transition-all disabled:opacity-50 text-left"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white border border-black/10 shrink-0">
                  {w.imgSrc
                    ? <img src={w.imgSrc} alt={w.name} className="w-7 h-7 object-contain" />
                    : <iconify-icon icon={w.icon} width="28" style={{ color: w.iconColor }}></iconify-icon>
                  }
                </div>
                <div className="flex-1">
                  <div className="text-base font-medium text-black">{w.name}</div>
                  <div className="text-xs text-zinc-600">{w.desc}</div>
                </div>
                {connecting ? (
                  <iconify-icon icon="solar:refresh-linear" class="text-black animate-spin" width="22"></iconify-icon>
                ) : (
                  <iconify-icon icon="solar:arrow-right-linear" class="text-black group-hover:translate-x-0.5 transition-transform" width="22"></iconify-icon>
                )}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
              {error}
            </div>
          )}

          <p className="mt-6 text-[11px] text-zinc-500 text-center">
            By connecting, you agree to the Terms of Service and acknowledge the Biosecurity policy.
          </p>
        </div>
      </div>
    </div>
  );
}
