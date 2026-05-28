import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import PageShell, { Card } from '../components/PageShell';
import { useWallet } from '../components/WalletContext';
import HypothesisPickerModal from '../components/HypothesisPickerModal';
import { api } from '../lib/api';

const FALLBACK_MODELS = [
  { id: 'esm3',        name: 'ESM-3',                  kind: 'Protein sequence',      priceUsd: '0.01', priceSynapse: null, totalCalls: 128000, icon: 'solar:dna-bold' },
  { id: 'alphafold3',  name: 'AlphaFold3-compatible',  kind: 'Protein structure',     priceUsd: '0.10', priceSynapse: null, totalCalls: 42000,  icon: 'solar:atom-bold' },
  { id: 'evo',         name: 'Evo',                    kind: 'DNA foundation',        priceUsd: '0.05', priceSynapse: null, totalCalls: 18000,  icon: 'solar:test-tube-minimalistic-bold' },
  { id: 'geneformer',  name: 'Geneformer',             kind: 'Single-cell RNA',       priceUsd: '0.02', priceSynapse: null, totalCalls: 76000,  icon: 'solar:graph-up-bold' },
  { id: 'biomedlm',    name: 'BioMedLM',               kind: 'Biomedical literature', priceUsd: '0.001',priceSynapse: null, totalCalls: 912000, icon: 'solar:book-bold' },
  { id: 'chemberta',   name: 'ChemBERTa',              kind: 'Chemistry SMILES',      priceUsd: '0.005',priceSynapse: null, totalCalls: 204000, icon: 'solar:flask-bold' },
  { id: 'matbert',     name: 'MatBERT',                kind: 'Materials science',     priceUsd: '0.005',priceSynapse: null, totalCalls: 64000,  icon: 'solar:cube-bold' },
  { id: 'brainage',    name: 'Brain-Age (T1w MRI)',     kind: 'Neuroscience',          priceUsd: '0.08', priceSynapse: null, totalCalls: 11000,  icon: 'solar:bolt-circle-bold' },
];

function formatCalls(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000)      return `${Math.round(n / 1000)}k`;
  return String(n);
}

export default function BioLLM() {
  const [models, setModels]    = useState(FALLBACK_MODELS);
  const [dispatching, setDisp] = useState(null);
  const [picking, setPicking]  = useState(null); // model currently in picker
  const { wallet, requireAuth, setOpen } = useWallet();

  useEffect(() => {
    api.get('/v1/biollm/models')
      .then(r => {
        const list = r.data || r;
        if (Array.isArray(list) && list.length) {
          setModels(list.map(m => ({ ...m, id: m.modelId ?? m.id })));
        }
      })
      .catch(() => {});
  }, []);

  // Step 1 — open hypothesis picker (or skip straight to run if no wallet yet)
  const openPicker = (m) => {
    if (!wallet) { setOpen(true); return; }
    setPicking(m);
  };

  // Step 2 — called by picker with { model, hypothesisId }
  const dispatch = async ({ model: m, hypothesisId }) => {
    setPicking(null);
    setDisp(m.id);
    const tId = toast.loading(`Dispatching ${m.name}…`);
    try {
      await requireAuth();

      const job = await api.post('/v1/biollm/infer', {
        modelId:      m.modelId ?? m.id,
        input:        {},
        ...(hypothesisId ? { hypothesisId } : {}),
      });

      toast.success(`${m.name} job queued`, {
        id:          tId,
        description: `Job ${(job.jobId || job.id || '').slice(0, 8) || '…'}${hypothesisId ? ' · hypothesis linked' : ''} · $${m.priceUsd} settled`,
      });
    } catch (e) {
      toast.error(e?.message || 'Dispatch failed', { id: tId });
    } finally {
      setDisp(null);
    }
  };

  return (
    <>
    <PageShell
      eyebrow="Decentralized BioLLM Marketplace"
      title="Pay-per-inference scientific AI."
      intro="A network of specialized scientific language models, each accessible via micropayments on Base. Every inference is logged on-chain with model ID, version, parameters and output hash — making AI-assisted scientific claims fully auditable."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {models.map(m => (
          <Card key={m.id || m.name}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-zinc-700">
                <iconify-icon icon={m.icon || 'solar:atom-bold'} width="20"></iconify-icon>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">Online</span>
            </div>
            <h3 className="text-black font-medium text-base">{m.name}</h3>
            <p className="text-zinc-500 text-xs mb-4">{m.kind}</p>
            <div className="flex items-baseline justify-between border-t border-black/5 pt-4">
              <div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Per inference</div>
                <div className="text-lg font-medium text-black">${m.priceUsd}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Calls / day</div>
                <div className="text-sm text-zinc-700">{formatCalls(m.totalCalls)}</div>
              </div>
            </div>
            <button
              onClick={() => openPicker(m)}
              disabled={dispatching === m.id}
              className="mt-4 w-full bg-black text-white py-2.5 rounded-full text-xs font-medium hover:bg-zinc-800 disabled:opacity-60 transition-all"
            >
              {dispatching === m.id ? 'Dispatching…' : 'Dispatch Inference'}
            </button>
          </Card>
        ))}
      </div>

      <Card dark>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400">Settlement</div>
            <div className="text-2xl font-light mt-1">On-chain micropayments</div>
            <p className="text-zinc-400 text-sm mt-2">Sub-cent fees settle silently on Base — no wallet popups per call.</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400">Operator split</div>
            <div className="text-2xl font-light mt-1">70 / 30</div>
            <p className="text-zinc-400 text-sm mt-2">70% of fees → Model Operator · 30% → protocol treasury.</p>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-400">Audit trail</div>
            <div className="text-2xl font-light mt-1">100% on-chain</div>
            <p className="text-zinc-400 text-sm mt-2">Every result hash + model version logged on Base / Arweave.</p>
          </div>
        </div>
      </Card>
    </PageShell>

    <HypothesisPickerModal
      model={picking}
      onConfirm={dispatch}
      onClose={() => setPicking(null)}
    />
    </>
  );
}
