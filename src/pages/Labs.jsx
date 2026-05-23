import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';
import PageShell, { Card, StatusDot } from '../components/PageShell';
import { useWallet } from '../components/WalletContext';
import {
  labKey, approveToken,
  PROTOCOL_ADDRESS, SYNAPSE_TOKEN_ADDRESS, USDC_ADDRESS,
  ONE_SYNAPSE, ONE_USDC, SynapseProtocolAbi,
  isContractDeployed, basescanTx,
} from '../lib/contracts';
import { wagmiConfig } from '../lib/wagmi';
import { api } from '../lib/api';

const FALLBACK_LABS = [
  { id: 'eth-zurich',  name: 'ETH Zürich Synthesis', country: 'Switzerland',   kind: 'Synthesis robot',              status: 'busy',        stakedSynapse: 12400000000, completedExperiments: 318, operatorWallet: null, labKey: null },
  { id: 'mit-lh',      name: 'MIT Liquid Handling',  country: 'United States', kind: 'Liquid handler',               status: 'idle',        stakedSynapse: 8200000000,  completedExperiments: 511, operatorWallet: null, labKey: null },
  { id: 'riken',       name: 'RIKEN Mass Spec',       country: 'Japan',         kind: 'Mass spectrometer',            status: 'idle',        stakedSynapse: 15900000000, completedExperiments: 224, operatorWallet: null, labKey: null },
  { id: 'imperial',    name: 'Imperial BCI Rig',      country: 'United Kingdom',kind: 'BCI rig',                      status: 'busy',        stakedSynapse: 22100000000, completedExperiments: 89,  operatorWallet: null, labKey: null },
  { id: 'tsinghua',    name: 'Tsinghua Microscopy',   country: 'China',         kind: 'Cryo-EM',                      status: 'maintenance', stakedSynapse: 30000000000, completedExperiments: 142, operatorWallet: null, labKey: null },
  { id: 'kaist',       name: 'KAIST Perovskite',      country: 'South Korea',   kind: 'SDL synthesis + characterization', status: 'idle',   stakedSynapse: 11750000000, completedExperiments: 196, operatorWallet: null, labKey: null },
];

function fmtStake(n) { return (n / 1_000_000).toLocaleString(); }

export default function Labs() {
  const [labs, setLabs]       = useState(FALLBACK_LABS);
  const [booking, setBooking] = useState(null);
  const { wallet, setOpen }   = useWallet();

  useEffect(() => {
    api.get('/v1/labs')
      .then(r => {
        const list = r.data || r;
        if (Array.isArray(list) && list.length) {
          setLabs(list.map(l => ({ ...l, id: l.labId ?? l.id })));
        }
      })
      .catch(() => {});
  }, []);

  const book = async (lab) => {
    if (!wallet) { setOpen(true); return; }

    // If no on-chain lab key, defer to backend
    if (!lab.labKey || !isContractDeployed(PROTOCOL_ADDRESS)) {
      toast.success(`Slot request sent for ${lab.name}`, { description: 'Backend will confirm and lock HLS stream.' });
      return;
    }

    setBooking(lab.id);
    const tId = toast.loading(`Booking slot at ${lab.name}…`);
    try {
      const slotStart  = BigInt(Math.floor(Date.now() / 1000) + 86_400);
      const slotEnd    = slotStart + 7_200n;
      const costUsdc   = 100n * ONE_USDC;
      const feeSynapse = 5n * ONE_SYNAPSE;

      // Approve USDC and SYNAPSE fee
      await approveToken(USDC_ADDRESS, PROTOCOL_ADDRESS, costUsdc);
      await approveToken(SYNAPSE_TOKEN_ADDRESS, PROTOCOL_ADDRESS, feeSynapse);

      const txHash = await writeContract(wagmiConfig, {
        address: PROTOCOL_ADDRESS,
        abi: SynapseProtocolAbi,
        functionName: 'bookLab',
        args: [
          lab.labKey,
          {
            slotStart,
            slotEnd,
            costUsdc,
            feeSynapse,
            hypothesis: '0x0000000000000000000000000000000000000000000000000000000000000000',
          },
        ],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: txHash });

      api.post('/v1/labs/bookings/index', {
        txSig:    txHash,
        labId:    lab.labId ?? lab.id,
        wallet:   wallet.address,
        slotStart: Number(slotStart),
        slotEnd:   Number(slotEnd),
      }).catch(() => {});

      toast.success(`Slot booked at ${lab.name}`, {
        id: tId,
        description: `tx ${txHash.slice(0, 10)}… · Live HLS unlocking`,
        action: {
          label: 'View tx',
          onClick: () => window.open(basescanTx(txHash), '_blank', 'noreferrer'),
        },
      });
    } catch (e) {
      toast.error(e?.message || 'Booking failed', { id: tId });
    } finally {
      setBooking(null);
    }
  };

  return (
    <PageShell
      eyebrow="Robotic Lab Network"
      title="Hardware control room."
      intro="Physical robotic lab hardware — synthesis robots, liquid handlers, mass spectrometers, microscopes, BCI rigs — registered as tokenized Lab Hardware NFTs. Book time slots in SYNAPSE / USDC, watch your experiment execute live, receive a cryptographically signed result."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {labs.map(lab => (
          <Card key={lab.id}>
            <div className="aspect-video rounded-xl bg-gradient-to-br from-zinc-900 to-black mb-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center">
                <span className="text-white/60 text-xs uppercase tracking-widest flex items-center gap-2">
                  <iconify-icon icon="solar:videocamera-record-bold"></iconify-icon>
                  Live HLS · unlock on booking
                </span>
              </div>
              <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-black/60 text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded-full">
                <StatusDot status={lab.status} /> {lab.status}
              </span>
            </div>
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-black font-medium">{lab.name}</h3>
                <p className="text-zinc-500 text-xs">{lab.country} · {lab.kind}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mt-4 mb-5">
              <div className="bg-black/5 border border-black/5 rounded-xl p-3">
                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">SYNAPSE staked</div>
                <div className="text-black font-medium mt-0.5">{fmtStake(lab.stakedSynapse)}</div>
              </div>
              <div className="bg-black/5 border border-black/5 rounded-xl p-3">
                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Experiments</div>
                <div className="text-black font-medium mt-0.5">{lab.completedExperiments}</div>
              </div>
            </div>
            <button
              onClick={() => book(lab)}
              disabled={lab.status === 'maintenance' || booking === lab.id}
              className="w-full bg-black disabled:bg-zinc-300 disabled:text-zinc-500 text-white py-2.5 rounded-full text-xs font-medium hover:bg-zinc-800 transition-all"
            >
              {lab.status === 'maintenance' ? 'Unavailable' : booking === lab.id ? 'Booking…' : 'Book Slot'}
            </button>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
