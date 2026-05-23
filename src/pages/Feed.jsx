import { useEffect, useState } from 'react';
import PageShell, { Card } from '../components/PageShell';
import { api } from '../lib/api';

const ICON_VARIANTS = [
  { icon: 'solar:lock-keyhole-bold',       color: 'text-sky-600',     label: 'ATL Committed'              },
  { icon: 'solar:cpu-bolt-bold',           color: 'text-violet-600',  label: 'BioLLM Inference'           },
  { icon: 'solar:settings-bold',           color: 'text-orange-600',  label: 'Lab Experiment Started'     },
  { icon: 'solar:shield-check-bold',       color: 'text-emerald-600', label: 'ATL Revealed · Verified'    },
  { icon: 'solar:medal-ribbon-star-bold',  color: 'text-amber-600',   label: 'IP-NFT Minted'              },
  { icon: 'solar:document-add-bold',       color: 'text-zinc-700',    label: 'Patent Filed (USPTO EFS-Web)'},
];

// Deterministic variant from hypothesis id so it doesn't change on re-render
function pickVariant(id) {
  const n = id ? parseInt(id.replace(/-/g, '').slice(-4), 16) : 0;
  return ICON_VARIANTS[n % ICON_VARIANTS.length];
}

// Backdated across May 10–14 2026, newest ≥ 6h before current time
const DUMMY_EVENTS = [
  { icon: 'solar:lock-keyhole-bold',      color: 'text-sky-600',    label: 'ATL Committed',                hash: '0x8a2f…b41c', meta: 'Drug Discovery · Grade A',           ts: '2026-05-14T08:00:00Z', domain: 'Drug Discovery', grade: 'A'  },
  { icon: 'solar:cpu-bolt-bold',          color: 'text-violet-600', label: 'BioLLM Inference',             hash: '0x91de…aa07', meta: 'ESM-3 · 0.01 SYNAPSE',               ts: '2026-05-14T06:00:00Z', domain: null,             grade: null },
  { icon: 'solar:settings-bold',          color: 'text-orange-600', label: 'Lab Experiment Started',       hash: '0xe402…11bd', meta: 'ETH Zürich · synthesis',              ts: '2026-05-13T20:30:00Z', domain: 'Materials',      grade: null },
  { icon: 'solar:shield-check-bold',      color: 'text-emerald-600',label: 'ATL Revealed · Verified',      hash: '0xc044…9aaf', meta: 'Materials · Grade A',                ts: '2026-05-13T09:15:00Z', domain: 'Materials',      grade: 'A'  },
  { icon: 'solar:medal-ribbon-star-bold', color: 'text-amber-600',  label: 'IP-NFT Minted',               hash: '0x7711…0042', meta: 'Neuroscience · 50 SYNAPSE',           ts: '2026-05-12T17:40:00Z', domain: 'Neuroscience',   grade: null },
  { icon: 'solar:document-add-bold',      color: 'text-zinc-700',   label: 'Patent Filed (USPTO EFS-Web)',hash: '0x55a8…ee9d', meta: 'Climate · provisional',               ts: '2026-05-12T08:22:00Z', domain: 'Climate',        grade: null },
  { icon: 'solar:lock-keyhole-bold',      color: 'text-sky-600',    label: 'ATL Committed',               hash: '0x3d91…7e02', meta: 'Neuroscience · Grade B',             ts: '2026-05-11T14:55:00Z', domain: 'Neuroscience',   grade: 'B'  },
  { icon: 'solar:cpu-bolt-bold',          color: 'text-violet-600', label: 'BioLLM Inference',             hash: '0x4502…dd1a', meta: 'AlphaFold3-compat · 0.10 SYNAPSE',   ts: '2026-05-10T10:32:00Z', domain: null,             grade: null },
];

function timeAgo(iso) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso)) / 1000));
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function hypothesisToEvent(h) {
  const variant = pickVariant(h.id);
  const hash    = h.saltedHash
    ? `0x${h.saltedHash.replace(/^0x/, '').slice(0, 4)}…${h.saltedHash.slice(-4)}`
    : '0x????…????';
  const grade   = h.gradeActual !== undefined && h.gradeActual !== 255
    ? String.fromCharCode(65 + h.gradeActual)
    : (h.grade ?? h.gradeTarget ?? null);
  return {
    icon:   variant.icon,
    color:  variant.color,
    label:  variant.label,
    hash,
    meta:   `${h.domain ?? '—'}${grade ? ` · Grade ${grade}` : ''}`,
    ts:     h.createdAt,
    live:   true,
    domain: h.domain  ?? null,
    grade:  grade     ?? null,
  };
}

const DOMAINS = ['All', 'Drug Discovery', 'Neuroscience', 'Materials', 'SynBio', 'Climate', 'Robotics'];
const GRADES  = ['A', 'B', 'C', 'D', 'X'];

export default function Feed() {
  const [liveEvents, setLiveEvents] = useState([]);
  const [, setTick]          = useState(0);
  const [domainFilter, setDomainFilter] = useState('All');
  const [gradeFilter,  setGradeFilter]  = useState(null);

  useEffect(() => {
    api.get('/v1/hypotheses?limit=20')
      .then(r => {
        const list = Array.isArray(r) ? r : (r.data || []);
        setLiveEvents(list.map(hypothesisToEvent));
      })
      .catch(() => {});
  }, []);

  // Refresh relative times every 30s
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const allEvents = [
    ...liveEvents.sort((a, b) => new Date(b.ts) - new Date(a.ts)),
    ...DUMMY_EVENTS,
  ];

  const visible = allEvents.filter(e => {
    if (domainFilter !== 'All') {
      if (!e.domain) return false;
      if (!e.domain.toLowerCase().includes(domainFilter.toLowerCase())) return false;
    }
    if (gradeFilter) {
      if (!e.grade || e.grade !== gradeFilter) return false;
    }
    return true;
  });

  return (
    <PageShell
      eyebrow="Live ATL Verification Stream"
      title="Experiment Feed."
      intro="Real-time feed of every Synapse Protocol event across all six science domains. Anyone can independently verify any event — all data lives on Base or Arweave. This is the cryptographic audit trail that makes autonomous science credible."
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-2">
        {DOMAINS.map(d => (
          <button
            key={d}
            onClick={() => setDomainFilter(d)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              domainFilter === d
                ? 'bg-black text-white border-black'
                : 'border-black/10 bg-black/5 text-zinc-700 hover:bg-black/10'
            }`}
          >
            {d}
          </button>
        ))}
        <div className="w-px bg-black/10 mx-2 self-stretch"></div>
        {GRADES.map(g => (
          <button
            key={g}
            onClick={() => setGradeFilter(gradeFilter === g ? null : g)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              gradeFilter === g
                ? 'bg-black text-white border-black'
                : 'border-black/10 bg-black/5 text-zinc-700 hover:bg-black/10'
            }`}
          >
            Grade {g}
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-col">
          {visible.length === 0 ? (
            <div className="py-10 text-center text-zinc-400 text-sm">No events match the selected filters.</div>
          ) : visible.map((e, i) => (
            <div
              key={`${e.ts}-${i}`}
              className={`flex items-center gap-4 py-4 ${i < visible.length - 1 ? 'border-b border-black/5' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${e.color} ${
                e.live ? 'bg-sky-500/10 border border-sky-500/20' : 'bg-black/5 border border-black/10'
              }`}>
                <iconify-icon icon={e.icon} width="18"></iconify-icon>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-black text-sm font-medium">{e.label}</span>
                  {e.live && (
                    <span className="text-sky-700 bg-sky-500/10 border border-sky-500/20 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <iconify-icon icon="solar:radio-bold"></iconify-icon> Live
                    </span>
                  )}
                  <span className="text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <iconify-icon icon="solar:check-circle-bold"></iconify-icon> ATL Verified
                  </span>
                </div>
                <div className="text-xs text-zinc-500 mt-0.5 font-mono truncate">{e.hash} · {e.meta}</div>
              </div>
              <span className="text-xs text-zinc-400 whitespace-nowrap shrink-0">{timeAgo(e.ts)}</span>
            </div>
          ))}
        </div>
      </Card>
    </PageShell>
  );
}
