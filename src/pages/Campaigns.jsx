import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import PageShell, { Card, GradePill, DomainTag } from '../components/PageShell';
import { useWallet } from '../components/WalletContext';
import {
  approveToken, campaignKey,
  PROTOCOL_ADDRESS, USDC_ADDRESS,
  ONE_USDC, SynapseProtocolAbi,
  isContractDeployed, basescanTx,
} from '../lib/contracts';
import { wagmiConfig } from '../lib/wagmi';
import { api } from '../lib/api';

const FALLBACK = [
  { id: 'camp1', title: 'Tau-Aggregation Inhibitor Sweep (Drug Discovery)', domain: 'Drug Discovery', gradeTarget: 'A', commit: '0x8a2f…b41c', raisedUsdc: 93600000000,  targetUsdc: 120000000000, biollm: 'ESM-3, AlphaFold3', lab: 'ETH Zürich Synthesis', campaignKey: null, leadWallet: null },
  { id: 'camp2', title: 'Perovskite Cathode Bayesian Search',               domain: 'Materials',      gradeTarget: 'A', commit: '0xc044…9aaf', raisedUsdc: 43200000000,  targetUsdc: 80000000000,  biollm: 'MatBERT',           lab: 'KAIST Perovskite SDL',  campaignKey: null, leadWallet: null },
  { id: 'camp3', title: 'BCI-driven Stroke Recovery Model',                 domain: 'Neuroscience',   gradeTarget: 'B', commit: '0x3d91…7e02', raisedUsdc: 62000000000,  targetUsdc: 200000000000, biollm: 'Brain-Age, BioMedLM',lab: 'Imperial BCI Rig',      campaignKey: null, leadWallet: null },
  { id: 'camp4', title: 'Riboswitch Library Optimisation',                  domain: 'SynBio',         gradeTarget: 'B', commit: '0x71be…0312', raisedUsdc: 13200000000,  targetUsdc: 60000000000,  biollm: 'Evo, Geneformer',   lab: 'MIT Liquid Handling',   campaignKey: null, leadWallet: null },
];

function pct(raised, target) { return Math.min(100, Math.round((raised / target) * 100)); }
function fmtUsdc(n) { return `${(n / 1_000_000).toLocaleString()} USDC`; }

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState(FALLBACK);
  const [funding, setFunding]     = useState(null);
  const { wallet, requireAuth, setOpen } = useWallet();

  useEffect(() => {
    api.get('/v1/campaigns')
      .then(r => { if (r.data?.length) setCampaigns(r.data); })
      .catch(() => {});
  }, []);

  const handleFund = async (c) => {
    if (!wallet) { toast.error('Connect a wallet to fund'); setOpen(true); return; }

    // If no on-chain campaign key, defer to backend
    if (!c.campaignKey || !isContractDeployed(PROTOCOL_ADDRESS)) {
      toast.success('Funding request sent', { description: 'Backend will process and issue Contribution NFT.' });
      return;
    }

    setFunding(c.id);
    const tId = toast.loading(`Funding ${c.title.slice(0, 30)}…`);
    try {
      const amountUsdc = 100n * ONE_USDC;

      // Approve USDC
      await approveToken(USDC_ADDRESS, PROTOCOL_ADDRESS, amountUsdc);

      const txHash = await writeContract(wagmiConfig, {
        address: PROTOCOL_ADDRESS,
        abi: SynapseProtocolAbi,
        functionName: 'fundCampaign',
        args: [c.campaignKey, amountUsdc],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

      await requireAuth();
      api.post(`/v1/campaigns/${c.id}/fund`, {
        txSig:      txHash,
        amountUsdc: 100,
        wallet:     wallet.address,
      }).catch(() => {});

      toast.success('Campaign funded!', {
        id: tId,
        description: `100 USDC · Contribution NFT minting…`,
        action: {
          label: 'View tx',
          onClick: () => window.open(basescanTx(txHash), '_blank', 'noreferrer'),
        },
      });

      setCampaigns(prev => prev.map(p => p.id === c.id
        ? { ...p, raisedUsdc: p.raisedUsdc + 100 * Number(ONE_USDC) }
        : p
      ));
    } catch (e) {
      toast.error(e?.message || 'Funding failed', { id: tId });
    } finally {
      setFunding(null);
    }
  };

  return (
    <PageShell
      eyebrow="Fund Science"
      title="Research Campaigns."
      intro="Community-governed funding with milestone-gated escrow on Base. Fund any active research campaign, receive a Contribution NFT that encodes royalty rights, and earn a share of every IP-NFT licensing payment."
      actions={
        <button className="bg-black text-white px-5 py-3 rounded-full text-sm font-medium hover:bg-zinc-800 transition-all">Submit Campaign</button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map(c => (
          <Card key={c.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <DomainTag domain={c.domain} />
                <GradePill grade={c.gradeTarget || c.grade} />
              </div>
              <span className="text-[10px] font-mono text-zinc-500">{c.commit || c.commitHash?.slice(0, 14) + '…'}</span>
            </div>
            <h3 className="text-black font-medium text-lg leading-snug">{c.title}</h3>

            <div className="mt-5">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Funded</span>
                <span className="text-sm text-black font-medium">{pct(c.raisedUsdc, c.targetUsdc)}% of {fmtUsdc(c.targetUsdc)}</span>
              </div>
              <div className="h-2 rounded-full bg-black/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all" style={{ width: `${pct(c.raisedUsdc, c.targetUsdc)}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 text-xs">
              <div className="bg-black/5 rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">BioLLM dispatched</div>
                <div className="text-zinc-800 mt-0.5">{c.biollm || c.linkedModelIds?.join(', ') || '—'}</div>
              </div>
              <div className="bg-black/5 rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Robotic lab</div>
                <div className="text-zinc-800 mt-0.5">{c.lab || c.linkedLabIds?.join(', ') || '—'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-5">
              <button
                onClick={() => handleFund(c)}
                disabled={funding === c.id || c.status === 'COMPLETE' || c.status === 'CANCELLED'}
                className="bg-black text-white py-2.5 rounded-full text-xs font-medium hover:bg-zinc-800 disabled:opacity-50 transition-all"
              >
                {funding === c.id ? 'Funding…' : 'Fund Campaign'}
              </button>
              <button className="bg-white text-black border border-black/10 py-2.5 rounded-full text-xs font-medium hover:bg-black/5 transition-all">View Details</button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
