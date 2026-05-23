import PageShell, { Card, StatusDot } from '../components/PageShell';

const agents = [
  { name: 'Hypothesis Generator', icon: 'solar:lightbulb-bold', status: 'online', jobs: 142, desc: 'Proposes and commits ATL hypotheses across all six domains.' },
  { name: 'BioLLM Orchestrator', icon: 'solar:cpu-bolt-bold', status: 'online', jobs: 1208, desc: 'Dispatches inference jobs across the BioLLM marketplace and logs results on-chain.' },
  { name: 'Lab Orchestrator', icon: 'solar:settings-bold', status: 'online', jobs: 31, desc: 'Transmits experiments to robotic hardware and monitors execution telemetry.' },
  { name: 'Evidence Grader', icon: 'solar:shield-star-bold', status: 'online', jobs: 488, desc: 'Assigns A/B/C/D/X grades to all citations and supporting evidence.' },
  { name: 'IP Scout', icon: 'solar:medal-ribbon-star-bold', status: 'online', jobs: 17, desc: 'Identifies patentable novelty in validated results and prepares filings.' },
  { name: 'Biosecurity', icon: 'solar:shield-keyhole-bold', status: 'online', jobs: 92, desc: 'Runs PoP-Shield on all biological candidates before commit acceptance.' },
];

const log = [
  { agent: 'Hypothesis Generator', text: 'Committed h_8a2f · Drug Discovery · Grade A · 10 SYNAPSE burned' },
  { agent: 'Biosecurity', text: 'PoP-Shield clear · 0/4 dual-use flags on candidate set' },
  { agent: 'BioLLM Orchestrator', text: 'Dispatched 12 ESM-3 inferences · 0.12 SYNAPSE total' },
  { agent: 'Lab Orchestrator', text: 'Booked ETH Zürich Synthesis · 4h slot · Lab Hardware NFT issued' },
  { agent: 'Evidence Grader', text: 'Promoted h_c044 reveal to Grade A · 3 corroborating citations' },
  { agent: 'IP Scout', text: 'Filed provisional via USPTO EFS-Web for IP-NFT #0421' },
];

export default function Agents() {
  return (
    <PageShell
      eyebrow="elizaOS v2 Fleet"
      title="Agent Console."
      intro="A coordinating fleet of elizaOS v2 agents operating across all six protocol layers. Every agent output is signed on-chain; every reasoning trace is committed to Arweave. Issue natural-language commands or watch the fleet coordinate autonomous science in real time."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {agents.map(a => (
          <Card key={a.name}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-zinc-700">
                <iconify-icon icon={a.icon} width="20"></iconify-icon>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-700">
                <StatusDot status={a.status} /> {a.status}
              </span>
            </div>
            <h3 className="text-black font-medium">{a.name}</h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{a.desc}</p>
            <div className="text-xs text-zinc-700 mt-4 border-t border-black/5 pt-3">
              <span className="text-zinc-500">Jobs (24h)</span> · <span className="font-medium">{a.jobs}</span>
            </div>
          </Card>
        ))}
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card dark className="lg:col-span-1">
          <h3 className="text-white font-medium mb-2">Command the fleet</h3>
          <p className="text-zinc-400 text-sm mb-4">Natural-language directives are routed to the right agents and signed on-chain.</p>
          <textarea rows={4} placeholder="Run a tau-aggregation sweep across 200 candidates, target ≥40% reduction at 10 µM." className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-white/30"></textarea>
          <button className="mt-3 w-full bg-white text-black py-2.5 rounded-full text-sm font-medium hover:bg-zinc-200 transition-all">Dispatch</button>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-black font-medium">Live agent log</h3>
            <span className="text-xs text-zinc-500">Arweave-anchored</span>
          </div>
          <div className="flex flex-col">
            {log.map((l, i) => (
              <div key={i} className={`flex items-start gap-3 py-3 ${i < log.length - 1 ? 'border-b border-black/5' : ''}`}>
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 w-40 flex-shrink-0 pt-0.5">{l.agent}</span>
                <span className="text-sm text-zinc-700">{l.text}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </PageShell>
  );
}
