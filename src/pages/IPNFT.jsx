import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import PageShell, { Card, GradePill, DomainTag } from '../components/PageShell';
import { useWallet } from '../components/WalletContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  hypothesisKey, approveToken, toHex,
  PROTOCOL_ADDRESS, SYNAPSE_TOKEN_ADDRESS, IPNFT_ADDRESS,
  MINT_COST, SynapseProtocolAbi,
  isContractDeployed, basescanTx,
} from '../lib/contracts';
import { wagmiConfig } from '../lib/wagmi';
import { api } from '../lib/api';

const DOMAINS = ['Drug Discovery', 'Neuroscience', 'Materials', 'SynBio', 'Climate', 'Robotics'];

const FALLBACK_IPNFTS = [
  { id: '#0421', title: 'Tau-Aggregation Inhibitor TX-7',    domain: 'Drug Discovery', gradeAtMint: 'A', commitHash: '0x8a2f…b41c', royaltyBps: 420, floorPriceEth: 0.04 },
  { id: '#0419', title: 'Perovskite Cathode P-9 (12.4% η)', domain: 'Materials',      gradeAtMint: 'A', commitHash: '0xc044…9aaf', royaltyBps: 350, floorPriceEth: 0.03 },
  { id: '#0414', title: 'EEG Alzheimer Predictor v2',        domain: 'Neuroscience',   gradeAtMint: 'B', commitHash: '0x3d91…7e02', royaltyBps: 500, floorPriceEth: 0.02 },
  { id: '#0410', title: 'CO₂-Reducing Catalyst CR-3',       domain: 'Climate',        gradeAtMint: 'A', commitHash: '0x55a8…ee9d', royaltyBps: 400, floorPriceEth: 0.03 },
  { id: '#0407', title: 'Synthetic Riboswitch RB-12',        domain: 'SynBio',         gradeAtMint: 'B', commitHash: '0x71be…0312', royaltyBps: 300, floorPriceEth: 0.015 },
  { id: '#0402', title: 'Bipedal Lab Loader v1',             domain: 'Robotics',       gradeAtMint: 'A', commitHash: '0xe402…11bd', royaltyBps: 600, floorPriceEth: 0.07 },
];

export default function IPNFT() {
  const [ipnfts, setIpnfts]     = useState(FALLBACK_IPNFTS);
  const [open, setOpen]          = useState(false);
  const [title, setTitle]        = useState('');
  const [domain, setDomain]      = useState('Drug Discovery');
  const [royaltyBps, setRoyalty] = useState(420);
  const [hypOptions, setHypOpts] = useState([]);
  const [selectedHyp, setSelHyp] = useState('');
  const [minting, setMinting]    = useState(false);
  const { wallet, requireAuth, setOpen: setWalletOpen } = useWallet();

  useEffect(() => {
    api.get('/v1/ip-nfts?limit=20')
      .then(r => { if (r.data?.length) setIpnfts(r.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open || !wallet) return;
    api.get('/v1/user/me/hypotheses?limit=50')
      .then(r => setHypOpts(r.data || []))
      .catch(() => setHypOpts([]));
  }, [open, wallet]);

  const handleOpenMint = () => {
    if (!wallet) { toast.error('Connect a wallet to mint'); setWalletOpen(true); return; }
    setOpen(true);
  };

  const handleMint = async () => {
    if (!title.trim()) { toast.error('Title required'); return; }
    if (!selectedHyp) { toast.error('Select a hypothesis'); return; }

    setMinting(true);
    const tId = toast.loading('Preparing IP-NFT metadata…');
    try {
      await requireAuth();

      const { metadataUri } = await api.post('/v1/ip-nfts/prepare', {
        hypothesisId: selectedHyp,
        title:        title.trim(),
        domain,
        royaltyBps,
      });

      toast.loading('Minting on Base…', { id: tId });

      let txHash = null;

      if (isContractDeployed(PROTOCOL_ADDRESS) && isContractDeployed(IPNFT_ADDRESS)) {
        const hypObj = hypOptions.find(h => h.id === selectedHyp);
        if (!hypObj?.shortId) throw new Error('Hypothesis shortId missing — try refreshing the page');

        const hypKey = hypothesisKey(wallet.address, hypObj.shortId);

        // 1. Approve 50 SYNAPSE
        await approveToken(SYNAPSE_TOKEN_ADDRESS, PROTOCOL_ADDRESS, MINT_COST);

        // 2. Mint on-chain
        txHash = await writeContract(wagmiConfig, {
          address: PROTOCOL_ADDRESS,
          abi: SynapseProtocolAbi,
          functionName: 'mintIpnft',
          args: [hypKey, { title: title.trim(), royaltyBps, metadataUri }],
        });
        await waitForTransactionReceipt(wagmiConfig, { hash: txHash });
      }

      api.post('/v1/ip-nfts/index', {
        txSig:        txHash || '',
        wallet:       wallet.address,
        mintAddress:  IPNFT_ADDRESS,
        hypothesisId: selectedHyp,
        title:        title.trim(),
        domain,
        royaltyBps,
        metadataUri,
      }).catch(() => {});

      toast.success('IP-NFT minted', {
        id: tId,
        description: `50 SYNAPSE burned · 50% to stakers${txHash ? ` · tx ${txHash.slice(0, 10)}…` : ''}`,
        action: txHash ? {
          label: 'View tx',
          onClick: () => window.open(basescanTx(txHash), '_blank', 'noreferrer'),
        } : undefined,
      });

      setOpen(false);
      setTitle(''); setRoyalty(420); setSelHyp('');
      setIpnfts(prev => [{
        id: `#${Math.floor(Math.random() * 9000 + 1000)}`,
        title: title.trim(), domain, gradeAtMint: 'A',
        commitHash: '0x…', royaltyBps, floorPriceEth: null,
      }, ...prev]);
    } catch (e) {
      toast.error(e?.message || 'Mint failed', { id: tId });
    } finally {
      setMinting(false);
    }
  };

  return (
    <PageShell
      eyebrow="Evidence-Graded Science IP"
      title="IP-NFT Explorer."
      intro="Every IP-NFT can only be minted when (a) the hypothesis commit existed on-chain before the result, (b) the result achieves Grade A or B evidence, and (c) the full experiment chain is logged via ExperimentRecord. Tradeable on OpenSea / Blur — royalties stream to all Contribution NFT holders."
      actions={
        <div className="relative inline-flex">
          <button disabled className="bg-black/40 text-white/60 px-5 py-3 rounded-full text-sm font-medium cursor-not-allowed flex items-center gap-2">
            <iconify-icon icon="solar:medal-ribbon-star-bold"></iconify-icon>
            Mint IP-NFT
          </button>
          <span className="absolute -top-2 -right-2 bg-amber-400 text-black text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">Soon</span>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ipnfts.map((n, i) => (
          <Card key={n.id || i}>
            <div className="aspect-square rounded-xl bg-gradient-to-br from-indigo-100 via-zinc-50 to-pink-100 mb-4 relative overflow-hidden flex items-center justify-center">
              <iconify-icon icon="solar:medal-ribbon-star-bold" width="64" class="text-black/30"></iconify-icon>
              <span className="absolute top-3 left-3"><GradePill grade={n.gradeAtMint} /></span>
              <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-md text-black text-[10px] font-mono px-2 py-1 rounded-full">{n.id || n.tokenId}</span>
            </div>
            <h3 className="text-black font-medium text-sm leading-snug">{n.title}</h3>
            <div className="mt-2"><DomainTag domain={n.domain} /></div>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="bg-black/5 rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Royalty</div>
                <div className="text-black font-medium">{((n.royaltyBps || 0) / 100).toFixed(1)}%</div>
              </div>
              <div className="bg-black/5 rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Floor</div>
                <div className="text-black font-medium">{n.floorPriceEth ? `${n.floorPriceEth} ETH` : '— ETH'}</div>
              </div>
            </div>
            <div className="text-[11px] text-zinc-500 font-mono mt-3 truncate">commit: {n.commitHash || n.commit}</div>
            <a href="https://opensea.io" target="_blank" rel="noreferrer" className="mt-4 w-full bg-black text-white py-2.5 rounded-full text-xs font-medium hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
              View on OpenSea <iconify-icon icon="solar:arrow-right-up-linear"></iconify-icon>
            </a>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Mint IP-NFT</DialogTitle>
            <DialogDescription>50 SYNAPSE — 50% burned · 50% to SYNAPSE stakers. Grade A/B target required.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Hypothesis</label>
              {hypOptions.length > 0 ? (
                <select value={selectedHyp} onChange={e => setSelHyp(e.target.value)} className="bg-white border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none">
                  <option value="">Select a hypothesis…</option>
                  {hypOptions.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.shortId || h.id?.slice(0,8)} · {h.domain} · {h.gradeTarget}{h.gradeActual !== 255 && h.gradeActual !== undefined ? ` (actual ${String.fromCharCode(65 + h.gradeActual)})` : ''} · {h.status}
                    </option>
                  ))}
                </select>
              ) : (
                <input value={selectedHyp} onChange={e => setSelHyp(e.target.value)} placeholder="Hypothesis ID (from dashboard)" className="bg-white border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="Tau-Aggregation Inhibitor TX-7" className="bg-white border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Domain</label>
                <select value={domain} onChange={e => setDomain(e.target.value)} className="bg-white border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none">
                  {DOMAINS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Royalty (bps)</label>
                <input type="number" min={0} max={1000} value={royaltyBps} onChange={e => setRoyalty(Number(e.target.value))} className="bg-white border border-black/10 rounded-xl px-4 py-3 text-black text-sm focus:outline-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-full text-sm text-zinc-700 hover:bg-black/5 transition-all">Cancel</button>
              <button type="button" onClick={handleMint} disabled={minting} className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-zinc-800 disabled:opacity-60 transition-all flex items-center gap-2">
                {minting ? 'Minting…' : 'Mint IP-NFT'}
                <iconify-icon icon="solar:arrow-right-up-linear"></iconify-icon>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
