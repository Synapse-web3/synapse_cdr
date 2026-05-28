import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { writeContract } from '@wagmi/core';
import PageShell, { Card, GradePill, DomainTag } from '../components/PageShell';
import { useWallet } from '../components/WalletContext';
import {
  saltedHash, toHex,
  PROTOCOL_ADDRESS,
  GRADE, domainIndex, SynapseProtocolAbi,
  isContractDeployed, basescanTx,
} from '../lib/contracts';
import { wagmiConfig } from '../lib/wagmi';
import { api } from '../lib/api';

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

const DOMAINS = ['Drug Discovery', 'Neuroscience', 'Materials', 'SynBio', 'Climate', 'Robotics'];
const statusLabel = (h) => {
  if (h.status === 'VERIFIED') return 'Revealed · Verified';
  if (h.status === 'REVEALED') return 'Awaiting Grade';
  if (h.status === 'FLAGGED')  return 'PoP-Shield Flagged';
  if (h.status === 'COMMITTED') return 'Awaiting Reveal';
  return h.status;
};

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export default function HypothesisLab() {
  const [grade, setGrade]       = useState('A');
  const [domain, setDomain]     = useState('Drug Discovery');
  const [text, setText]         = useState('');
  const [target, setTarget]     = useState('');
  const [citations, setCitations] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [commits, setCommits]   = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    document.body.style.overflow = selected ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selected]);

  const { wallet, setOpen, requireAuth } = useWallet();

  useEffect(() => {
    api.get('/v1/hypotheses?limit=20')
      .then(r => setCommits(Array.isArray(r) ? r : (r.data || [])))
      .catch(() => {});
  }, []);

  const handleCommit = async () => {
    if (!wallet) { toast.error('Connect a wallet to commit on Base'); setOpen(true); return; }
    if (!text.trim()) { toast.error('Hypothesis text is required'); return; }

    setSubmitting(true);
    const tId = toast.loading('Building commit transaction…');
    try {
      const shortIdArr = crypto.getRandomValues(new Uint8Array(8));
      const salt       = crypto.getRandomValues(new Uint8Array(32));
      const commitment = saltedHash(salt, text.trim());
      const shortIdHex = toHex(shortIdArr); // 0x-prefixed bytes8

      const localPayload = {
        shortId: Array.from(shortIdArr),
        salt:    Array.from(salt),
        text:    text.trim(),
      };
      // Store by shortId so the reveal step can look it up
      localStorage.setItem(`synapse:hyp:sid:${shortIdHex}`, JSON.stringify(localPayload));

      let txHash = null;

      if (isContractDeployed(PROTOCOL_ADDRESS)) {
        toast.loading('Committing on Base…', { id: tId });
        txHash = await writeContract(wagmiConfig, {
          address: PROTOCOL_ADDRESS,
          abi: SynapseProtocolAbi,
          functionName: 'commitHypothesis',
          args: [{
            shortId:     shortIdHex,
            domain:      domainIndex(domain),
            gradeTarget: GRADE[grade] ?? GRADE.A,
            saltedHash:  commitment,
          }],
        });
      }

      toast.loading('Indexing on backend…', { id: tId });
      await requireAuth();

      const indexed = await api.post('/v1/hypotheses/index', {
        txSig:      txHash || '',
        wallet:     wallet.address,
        shortId:    shortIdHex,
        saltedHash: commitment,
        text:       text.trim(),
        domain,
        gradeTarget: grade,
        citations:  citations.split(/[\s,]+/).filter(Boolean),
      });

      toast.success('Hypothesis committed', {
        id: tId,
        description: `ID: ${shortIdHex.slice(0, 10)}…${txHash ? ` · tx ${txHash.slice(0, 10)}…` : ''}`,
        action: txHash ? {
          label: 'View on-chain',
          onClick: () => window.open(basescanTx(txHash), '_blank', 'noreferrer'),
        } : undefined,
      });

      setText(''); setTarget(''); setCitations('');
      const newCommit = {
        id:          indexed.id,
        shortId:     shortIdHex,
        txSig:       txHash || '',
        text:        text.trim(),
        domain,
        gradeTarget: grade,
        gradeActual: 255,
        saltedHash:  commitment,
        status:      'COMMITTED',
        createdAt:   new Date().toISOString(),
      };
      setCommits(prev => [newCommit, ...prev.filter(c => c.id !== newCommit.id)]);
    } catch (e) {
      toast.error(e?.message || 'Commit failed', { id: tId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      eyebrow="ATL Commit & Evidence Studio"
      title="Hypothesis Lab."
      intro="Commit a salted keccak256 hash of your hypothesis to the SynapseProtocol contract on Base before any experiment runs. Post-hoc hypothesis generation becomes cryptographically impossible — the block timestamp is the proof."
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card dark>
            <h2 className="text-white text-xl font-medium mb-1">New ATL Commitment</h2>
            <p className="text-zinc-400 text-sm mb-6">PoP-Shield biosafety scan runs automatically on commit.</p>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Hypothesis</label>
                <textarea rows={4} value={text} onChange={e => setText(e.target.value)} placeholder="Compound X reduces tau aggregation in iPSC-derived neurons by ≥40% at 10 µM…" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Domain</label>
                  <select value={domain} onChange={e => setDomain(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none">
                    {DOMAINS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Target Outcome</label>
                  <input value={target} onChange={e => setTarget(e.target.value)} placeholder="≥40% reduction" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/30" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Evidence Grade (Core Citation)</label>
                <div className="flex gap-2">
                  {['A','B','C','D','X'].map(g => (
                    <button key={g} onClick={() => setGrade(g)} className={`w-10 h-10 rounded-full text-sm font-semibold transition-all border ${grade === g ? 'bg-white text-black border-white' : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'}`}>{g}</button>
                  ))}
                </div>
                <p className="text-[11px] text-zinc-500">Grade A/B required on core claim — otherwise no IP-NFT can be minted later.</p>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Citation DOIs</label>
                <input value={citations} onChange={e => setCitations(e.target.value)} placeholder="10.1038/s41586-024-…   10.1126/science.…" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/30" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <iconify-icon icon="solar:shield-check-bold" width="16"></iconify-icon>
                  <span>PoP-Shield: ready to scan</span>
                </div>
                <button onClick={handleCommit} disabled={submitting} className="bg-white text-black px-3 py-2 md:px-5 md:py-3 rounded-full text-xs md:text-sm font-medium hover:bg-zinc-200 disabled:opacity-60 transition-all flex items-center gap-2 shrink-0">
                  <span>{submitting ? 'Committing…' : 'Commit on Base'}</span>
                  <iconify-icon icon="solar:arrow-right-up-linear" width="14" class="md:w-4"></iconify-icon>
                </button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <h3 className="text-black font-medium mb-1">What ATL guarantees</h3>
            <p className="text-zinc-600 text-sm mb-4">A 50-year-old replication crisis — solved cryptographically rather than socially.</p>
            <ul className="flex flex-col gap-3 text-sm text-zinc-700">
              {[
                'Salted keccak256 hash committed before result exists',
                'Base block timestamp = immutable proof of priority',
                'Reveal verified on-chain against the commit hash',
                'PoP-Shield blocks dual-use biological candidates',
                'Evidence grade travels through the full lifecycle',
              ].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <iconify-icon icon="solar:check-circle-bold" class="text-emerald-600 mt-0.5"></iconify-icon>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl text-black font-thin tracking-tight">Recent Commitments</h2>
          <span className="text-xs text-zinc-500">Live · Base</span>
        </div>
        <Card>
          <div className="overflow-x-auto -m-6">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-black/10">
                <tr>
                  <th className="text-left p-4">
                    <span title="keccak256(salt + hypothesis text) — a content fingerprint, not a transaction hash">Commit Hash</span>
                  </th>
                  <th className="text-left p-4">Domain</th>
                  <th className="text-left p-4">Grade</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Committed</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {commits.length === 0 ? (
                  <tr><td colSpan={6} className="p-4 text-center text-zinc-400 text-xs">No commitments yet — or backend is starting up.</td></tr>
                ) : commits.map((c, i) => (
                  <tr key={c.id || i} className="border-b border-black/5 last:border-0">
                    <td className="p-4 font-mono text-xs text-zinc-700">
                      <span className="inline-flex items-center gap-0.5">
                        {c.hash || (c.saltedHash?.slice(0, 14) + '…')}
                        <CopyButton text={c.saltedHash || c.hash || ''} />
                      </span>
                    </td>
                    <td className="p-4"><DomainTag domain={c.domain} /></td>
                    <td className="p-4"><GradePill grade={c.grade || c.gradeTarget} /></td>
                    <td className="p-4 text-zinc-700">{statusLabel(c)}</td>
                    <td className="p-4 text-right text-zinc-500">{c.createdAt ? timeAgo(c.createdAt) : c.time}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.txSig && (
                          <a
                            href={basescanTx(c.txSig)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-black/10 bg-black/5 hover:bg-black/10 text-zinc-600 hover:text-black transition-all"
                            title="View on Basescan"
                          >
                            <iconify-icon icon="solar:arrow-right-up-linear" width="13"></iconify-icon>
                          </a>
                        )}
                        <button
                          onClick={() => setSelected(c)}
                          className="text-xs text-black border border-black/10 px-3 py-1.5 rounded-full hover:bg-black/5 transition-all whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {selected && createPortal((() => {
        const local = JSON.parse(localStorage.getItem(`synapse:hyp:sid:${selected.shortId}`) || 'null');
        const hypothesisText = selected.text || local?.text;
        return (
          <div
            className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <div
              onClick={e => e.stopPropagation()}
              className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-black/10 flex flex-col h-[75vh] md:h-auto md:max-h-[80vh]"
            >
              <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-black/20"></div>
              </div>
              <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-black/8 shrink-0">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Hypothesis Details</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DomainTag domain={selected.domain} />
                    <GradePill grade={selected.gradeActual !== 255 ? String.fromCharCode(65 + selected.gradeActual) : (selected.grade || selected.gradeTarget)} />
                    <span className="text-xs text-zinc-500 bg-black/5 px-2 py-1 rounded-full">{statusLabel(selected)}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black shrink-0 ml-3">
                  <iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon>
                </button>
              </div>
              <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">Hypothesis Text</div>
                  <p className="text-sm text-black leading-relaxed bg-black/5 border border-black/10 rounded-xl px-4 py-3 whitespace-pre-wrap">
                    {hypothesisText || '—'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">Commit Hash</div>
                    <div className="font-mono text-zinc-700 break-all flex items-start gap-1">
                      <span>{(selected.saltedHash || selected.hash || '').slice(0, 32)}…</span>
                      <CopyButton text={selected.saltedHash || selected.hash || ''} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">Short ID</div>
                    <div className="font-mono text-zinc-700 break-all">{selected.shortId || '—'}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">Experiments</div>
                    <div className="text-zinc-700">{selected.experimentCount ?? 0}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">Committed</div>
                    <div className="text-zinc-700">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</div>
                  </div>
                </div>
                {selected.txSig && (
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">On-chain</div>
                    <a
                      href={basescanTx(selected.txSig)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-black border border-black/10 bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-full transition-all w-fit"
                    >
                      <iconify-icon icon="solar:link-bold" width="13"></iconify-icon>
                      View Transaction on Basescan
                      <iconify-icon icon="solar:arrow-right-up-linear" width="11"></iconify-icon>
                    </a>
                  </div>
                )}
                <div className="h-safe-bottom md:h-0 pb-4 md:pb-0"></div>
              </div>
            </div>
          </div>
        );
      })(), document.body)}
    </PageShell>
  );
}
