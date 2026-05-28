import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import PageShell, { Card, GradePill, DomainTag } from '../components/PageShell';
import { useWallet } from '../components/WalletContext';
import { api } from '../lib/api';

const tabs = [
  { key: 'hypotheses', label: 'Hypotheses' },
  { key: 'hardware',   label: 'Hardware' },
  { key: 'missions',   label: 'Missions' },
  { key: 'data',       label: 'Data Marketplace' },
  { key: 'ipnft',      label: 'IP-NFTs' },
  { key: 'contrib',    label: 'Contribution NFTs' },
  { key: 'staking',    label: '$SYN Staking' },
];

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button
      onClick={copy}
      className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-md border border-black/10 bg-black/5 hover:bg-black/10 text-zinc-600 hover:text-black transition-all shrink-0"
      title="Copy hash"
    >
      <iconify-icon icon={copied ? 'solar:check-bold' : 'solar:copy-bold'} width="14"></iconify-icon>
    </button>
  );
}

const DEFAULT_STATS = {
  synBalance:             0,
  synBalanceUsd:          0,
  claimableUsdc:          0,
  activeCommits:          0,
  commitsAwaitingReveal:  0,
  lifetimeRoyaltiesUsdc:  0,
  stakedSynapse:          0,
};

export default function Dashboard() {
  const [tab, setTab]           = useState('hypotheses');
  const [stats, setStats]       = useState(DEFAULT_STATS);
  const [tabData, setTabData]   = useState({});
  const [claiming, setClaiming] = useState(false);
  const { wallet, requireAuth, setOpen, disconnect } = useWallet();
  const short = wallet?.address ? `${wallet.address.slice(0,6)}…${wallet.address.slice(-4)}` : '';

  const loadStats = useCallback(async () => {
    if (!wallet) return;
    try {
      await requireAuth();
      const s = await api.get('/v1/user/me/stats');
      setStats(s);
    } catch {}
  }, [wallet, requireAuth]);

  useEffect(() => { loadStats(); }, [loadStats]);


  const loadTab = useCallback(async (key) => {
    if (!wallet || tabData[key]) return;
    try {
      await requireAuth();
      const map = {
        hypotheses: '/v1/user/me/hypotheses',
        hardware:   '/v1/user/me/lab-bookings',
        missions:   '/v1/user/me/lab-bookings?status=ACTIVE,COMPLETE',
        data:       '/v1/user/me/data-queries',
        ipnft:      '/v1/user/me/ip-nfts',
        contrib:    '/v1/user/me/contribution-nfts',
        staking:    '/v1/user/me/staking',
      };
      if (!map[key]) return;
      const r = await api.get(map[key]);
      setTabData(prev => ({ ...prev, [key]: r.data || r }));
    } catch {}
  }, [wallet, requireAuth, tabData]);

  useEffect(() => { loadTab(tab); }, [tab, loadTab]);

  const handleClaim = async () => {
    if (!wallet) { toast.error('Connect a wallet to claim'); setOpen(true); return; }
    if (stats.claimableUsdc <= 0) return;
    setClaiming(true);
    const tId = toast.loading('Claiming rewards…');
    try {
      await requireAuth();
      const { txHash, claimedUsdc } = await api.post('/v1/user/me/claim', {});
      setStats(s => ({ ...s, claimableUsdc: 0, lifetimeRoyaltiesUsdc: s.lifetimeRoyaltiesUsdc + claimedUsdc }));
      toast.success(`Claimed ${fmt(claimedUsdc)} USDC`, { id: tId, description: txHash ? `tx ${txHash.slice(0, 10)}…` : undefined });
    } catch (e) {
      toast.error(e?.message || 'Claim failed', { id: tId });
    } finally {
      setClaiming(false);
    }
  };

  const displayStats = [
    { label: 'Claimable USDC',    value: fmt(stats.claimableUsdc),                                        sub: 'Royalties + staking' },
    { label: 'Active commits',    value: String(stats.activeCommits),                                      sub: `${stats.commitsAwaitingReveal} awaiting reveal` },
    { label: 'Royalties to date', value: Math.round(stats.lifetimeRoyaltiesUsdc).toLocaleString(),         sub: 'USDC lifetime' },
  ];

  const nothingToClaim = !stats.claimableUsdc || Number(stats.claimableUsdc) <= 0;

  return (
    <PageShell
      eyebrow="My Synapse · Operator & Researcher"
      title="Dashboard."
      intro="Unified view of every Synapse Protocol position — ATL hypothesis commits, registered lab hardware, mission bookings, data marketplace earnings, IP-NFT royalties, Contribution NFTs and $SYN staking."
      actions={
        <>
          <button
            onClick={handleClaim}
            disabled={claiming || nothingToClaim}
            className={`px-5 py-3 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${nothingToClaim ? 'bg-black/10 text-zinc-500 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800'} disabled:opacity-70`}
          >
            <iconify-icon icon="solar:download-bold"></iconify-icon>
            {claiming ? 'Claiming…' : nothingToClaim ? 'Nothing to claim' : 'Claim All'}
          </button>
          {wallet ? (
            <button onClick={disconnect} className="bg-white text-black border border-black/10 px-5 py-3 rounded-full text-sm font-medium hover:bg-black/5 transition-all flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {short} <span className="text-zinc-500 text-xs">· Disconnect</span>
            </button>
          ) : (
            <button onClick={() => setOpen(true)} className="bg-white text-black border border-black/10 px-5 py-3 rounded-full text-sm font-medium hover:bg-black/5 transition-all">Connect Wallet</button>
          )}
        </>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {displayStats.map(s => (
          <Card key={s.label}>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500">{s.label}</div>
            <div className="text-3xl font-light text-black mt-1">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.sub}</div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-black/10 pb-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${tab === t.key ? 'bg-black text-white' : 'bg-black/5 text-zinc-700 hover:bg-black/10'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === 'hypotheses' && (
          <div className="overflow-x-auto -m-6">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-black/10">
                <tr><th className="text-left p-4">Commit</th><th className="text-left p-4">Domain</th><th className="text-left p-4">Grade</th><th className="text-left p-4">Status</th><th className="text-right p-4">Experiments</th></tr>
              </thead>
              <tbody>
                {(tabData.hypotheses || []).length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-zinc-400 text-xs">{wallet ? 'No hypotheses yet — or backend is starting up.' : 'Connect wallet to view.'}</td></tr>
                ) : (tabData.hypotheses || []).map((h, i) => (
                  <tr key={h.id || i} className="border-b border-black/5 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="font-mono text-xs text-zinc-700">{(h.saltedHash || h.hash || '').slice(0, 14)}…</span>
                        <CopyButton text={h.saltedHash || h.hash || ''} />
                      </div>
                    </td>
                    <td className="p-4"><DomainTag domain={h.domain} /></td>
                    <td className="p-4"><GradePill grade={h.gradeActual !== 255 ? String.fromCharCode(65 + h.gradeActual) : h.gradeTarget} /></td>
                    <td className="p-4 text-zinc-700">{h.status}</td>
                    <td className="p-4 text-right text-zinc-700">{h.experimentCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'ipnft' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(tabData.ipnft || []).length === 0 ? (
              <div className="col-span-3 py-8 text-center text-zinc-400 text-xs">{wallet ? 'No IP-NFTs yet.' : 'Connect wallet to view.'}</div>
            ) : (tabData.ipnft || []).map((n, i) => (
              <div key={n.id || i} className="bg-black/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm text-zinc-700">{n.tokenId || n.id}</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Grade {String.fromCharCode(65 + (n.gradeAtMint || 0))} · {((n.royaltyBps || 0) / 100).toFixed(1)}% royalty</div>
                </div>
                <span className="text-emerald-700 text-xs">Royalty active</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'staking' && (() => {
          const d = tabData.staking || {};
          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/5 rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-zinc-500">Staked</div><div className="text-2xl font-light text-black mt-1">{Number(d.stakedAmount || 0).toLocaleString()} $SYN</div></div>
              <div className="bg-black/5 rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-zinc-500">Slash count</div><div className="text-2xl font-light text-black mt-1">{d.slashCount || 0}</div></div>
              <div className="bg-black/5 rounded-xl p-4"><div className="text-[10px] uppercase tracking-widest text-zinc-500">Pending unstake</div><div className="text-2xl font-light text-black mt-1">{Number(d.unstakeRequestAmount || 0).toLocaleString()} $SYN</div></div>
            </div>
          );
        })()}

        {tab === 'contrib' && (
          <ul className="flex flex-col gap-3 text-sm text-zinc-700">
            {(tabData.contrib || []).length === 0 ? (
              <li className="py-8 text-center text-zinc-400 text-xs">{wallet ? 'No contribution NFTs yet.' : 'Connect wallet to view.'}</li>
            ) : (tabData.contrib || []).map((c, i) => (
              <li key={c.id || i} className="flex justify-between border-b border-black/5 pb-3 last:border-0">
                <span>{c.campaignTitle || c.campaignId}</span>
                <span>{((c.royaltyShareBps || 0) / 100).toFixed(2)}% royalty share</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'hardware' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(tabData.hardware || []).length === 0 ? (
              <div className="col-span-3 py-8 text-center text-zinc-400 text-xs">{wallet ? 'No lab bookings yet.' : 'Connect wallet to view.'}</div>
            ) : (tabData.hardware || []).map((b, i) => (
              <div key={b.id || i} className="bg-black/5 rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{b.labName || b.labId}</div>
                <div className="text-base font-medium text-black mt-1">Booking {b.id?.slice(0, 8)}…</div>
                <div className="text-xs text-zinc-500 mt-1">{b.status}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'missions' && (
          <ul className="flex flex-col gap-3 text-sm text-zinc-700">
            {(tabData.missions || []).length === 0 ? (
              <li className="py-8 text-center text-zinc-400 text-xs">{wallet ? 'No missions yet.' : 'Connect wallet to view.'}</li>
            ) : (tabData.missions || []).map((m, i) => (
              <li key={m.id || i} className="flex justify-between border-b border-black/5 pb-3 last:border-0">
                <span>{m.labName || m.labId} · {m.protocol?.slice(0, 40) || '—'}</span>
                <span className={m.status === 'COMPLETE' ? 'text-emerald-600' : m.status === 'ACTIVE' ? 'text-amber-600' : 'text-zinc-500'}>{m.status}</span>
              </li>
            ))}
          </ul>
        )}

        {tab === 'data' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(tabData.data || []).length === 0 ? (
              <div className="col-span-3 py-8 text-center text-zinc-400 text-xs">{wallet ? 'No data queries yet.' : 'Connect wallet to view.'}</div>
            ) : (tabData.data || []).map((q, i) => (
              <div key={q.id || i} className="bg-black/5 rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">{q.datasetName || q.datasetId}</div>
                <div className="text-2xl font-light text-black mt-1">{Number(q.revenueProviderSynapse || 0).toFixed(2)} $SYN</div>
                <div className="text-xs text-zinc-500 mt-1">{q.status}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageShell>
  );
}
