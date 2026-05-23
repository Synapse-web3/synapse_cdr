import { useState } from 'react';
import { toast } from 'sonner';
import { useWallet } from './WalletContext';
import { api } from '../lib/api';

const AMOUNTS = [20, 50, 100];

export default function FaucetModal({ open, onClose }) {
  const [selected, setSelected]   = useState(null);
  const [claiming, setClaiming]   = useState(false);
  const { wallet, requireAuth, setOpen: openWallet } = useWallet();

  if (!open) return null;

  const claim = async () => {
    if (!wallet) { onClose(); openWallet(true); return; }
    if (!selected) { toast.error('Select an amount first'); return; }

    setClaiming(true);
    const tId = toast.loading(`Requesting ${selected} SYNAPSE…`);
    try {
      await requireAuth();
      await api.post('/v1/user/faucet', {
        wallet: wallet.address,
        amount: selected,
      });
      toast.success(`${selected} SYNAPSE sent to your wallet`, {
        id:          tId,
        description: 'Testnet tokens should arrive within a few seconds.',
      });
      setSelected(null);
      onClose();
    } catch (e) {
      toast.error(e?.message || 'Faucet request failed', { id: tId });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-sm bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-black/10 p-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center -mt-2 mb-4">
          <div className="w-10 h-1 rounded-full bg-black/20"></div>
        </div>

        <div className="flex items-center justify-between mb-1">
          <h2 className="text-black font-medium text-lg">SYNAPSE Faucet</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black transition-colors"
          >
            <iconify-icon icon="solar:close-circle-linear" width="18"></iconify-icon>
          </button>
        </div>
        <p className="text-zinc-500 text-sm mb-6">Testnet tokens only. Max 100 SYNAPSE per request.</p>

        {!wallet ? (
          <div className="text-center py-4">
            <p className="text-zinc-500 text-sm mb-4">Connect your wallet to request tokens.</p>
            <button
              onClick={() => { onClose(); openWallet(true); }}
              className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Select amount</div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {AMOUNTS.map(a => (
                <button
                  key={a}
                  onClick={() => setSelected(a)}
                  className={`py-3 rounded-2xl text-sm font-medium border transition-all ${
                    selected === a
                      ? 'bg-black text-white border-black'
                      : 'bg-black/5 text-black border-transparent hover:bg-black/10'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-zinc-400 font-mono truncate mb-4">
              Wallet: {wallet.address.slice(0, 6)}…{wallet.address.slice(-6)}
            </div>

            <button
              onClick={claim}
              disabled={!selected || claiming}
              className="w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {claiming ? 'Sending…' : selected ? `Send ${selected} SYNAPSE` : 'Select an amount'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
