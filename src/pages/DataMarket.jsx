import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatUnits } from 'viem';
import PageShell, { Card, DomainTag } from '../components/PageShell';
import { useWallet } from '../components/WalletContext';
import { api } from '../lib/api';

const FALLBACK_DATASETS = [
  { id: 'eeg-alzheimer',   name: 'EEG Alzheimer Cohort',       contributors: 12, size: '4.1 TB',  proof: 'Halo2', priceDisplay: '0.1 SYNAPSE / query',  priceSynapse: null, domain: 'Neuroscience'   },
  { id: 'fmri-psych',      name: 'fMRI Psychiatric Atlas',      contributors: 7,  size: '8.9 TB',  proof: 'Nova',  priceDisplay: '0.2 SYNAPSE / query',  priceSynapse: null, domain: 'Neuroscience'   },
  { id: 'scrna-pancreas',  name: 'Single-cell RNA Pancreas',    contributors: 21, size: '1.6 TB',  proof: 'Halo2', priceDisplay: '0.1 SYNAPSE / query',  priceSynapse: null, domain: 'Drug Discovery' },
  { id: 'perovskite-logs', name: 'Perovskite Synthesis Logs',   contributors: 9,  size: '420 GB',  proof: 'Halo2', priceDisplay: '0.05 SYNAPSE / query', priceSynapse: null, domain: 'Materials'      },
  { id: 'robotic-traj',    name: 'Robotic Manipulation Traj.',  contributors: 14, size: '2.3 TB',  proof: 'Nova',  priceDisplay: '0.15 SYNAPSE / query', priceSynapse: null, domain: 'Robotics'       },
  { id: 'atm-co2',         name: 'Atmospheric CO₂ Sensor Net', contributors: 32, size: '1.1 TB',  proof: 'Halo2', priceDisplay: '0.05 SYNAPSE / query', priceSynapse: null, domain: 'Climate'        },
];

export default function DataMarket() {
  const [datasets, setDatasets] = useState(FALLBACK_DATASETS);
  const [querying, setQuerying] = useState(null);
  const { wallet, requireAuth, setOpen } = useWallet();

  useEffect(() => {
    api.get('/v1/datasets')
      .then(r => {
        const list = r.data || r;
        if (Array.isArray(list) && list.length) {
          setDatasets(list.map(d => ({ ...d, id: d.datasetId ?? d.id })));
        }
      })
      .catch(() => {});
  }, []);

  const query = async (d) => {
    if (!wallet) { setOpen(true); return; }

    setQuerying(d.id);
    const tId = toast.loading(`Querying ${d.name}…`);
    try {
      await requireAuth();

      const job = await api.post(`/v1/datasets/${d.datasetId ?? d.id}/query`, {
        querySpec: {},
      });

      toast.success(`Query submitted for ${d.name}`, {
        id:          tId,
        description: `Job ${(job.queryId || job.id || '').slice(0, 8) || '…'} · ZK proof generating`,
      });
    } catch (e) {
      toast.error(e?.message || 'Query failed', { id: tId });
    } finally {
      setQuerying(null);
    }
  };

  return (
    <PageShell
      eyebrow="Federated ZK Data Market"
      title="Contribute gradients. Keep patient data."
      intro="Hospitals, labs and BCI companies contribute model gradients — never raw data — via federated learning. Halo2 / Nova zero-knowledge proofs verify correct computation on the correct dataset without revealing patient information. Contributors earn SYNAPSE; resulting models are owned as IP-NFTs by contributing institutions."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {datasets.map(d => (
          <Card key={d.id}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-pink-600">
                <iconify-icon icon="solar:database-bold" width="20"></iconify-icon>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">ZK · {d.proof || d.proofSystem}</span>
            </div>
            <h3 className="text-black font-medium">{d.name}</h3>
            <div className="mt-2"><DomainTag domain={d.domain} /></div>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="bg-black/5 rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Contributors</div>
                <div className="text-black font-medium">{d.contributors ?? d.contributorCount}</div>
              </div>
              <div className="bg-black/5 rounded-lg p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-zinc-500">Size</div>
                <div className="text-black font-medium">{d.size || d.sizeDisplay}</div>
              </div>
            </div>
            <div className="text-xs text-zinc-600 mt-3">{d.priceDisplay || d.price}</div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => query(d)}
                disabled={querying === d.id}
                className="bg-black text-white py-2.5 rounded-full text-xs font-medium hover:bg-zinc-800 disabled:opacity-60 transition-all"
              >
                {querying === d.id ? 'Querying…' : 'Query'}
              </button>
              <button className="bg-white text-black border border-black/10 py-2.5 rounded-full text-xs font-medium hover:bg-black/5 transition-all">
                Contribute
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card dark>
        <div className="text-white">
          <div className="text-[10px] uppercase tracking-widest text-zinc-400">Revenue split</div>
          <div className="text-2xl font-light mt-1">80% data provider · 20% protocol</div>
          <p className="text-zinc-400 text-sm mt-2 max-w-2xl">Per-query micropayments settle on Base. Contributing institutions retain joint IP-NFT ownership of any models trained on their gradients.</p>
        </div>
      </Card>
    </PageShell>
  );
}
