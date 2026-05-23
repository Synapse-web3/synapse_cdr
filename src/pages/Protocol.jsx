import PageShell, { Card } from '../components/PageShell';

const layers = [
  { n: 1, slug: 'attestation', name: 'Cryptographic Hypothesis Attestation', icon: 'solar:lock-keyhole-bold', body: 'HypothesisRegistry contract on Base. Salted keccak256 commit-reveal. Evidence grades A/B/C/D/X enforced. PoP-Shield biosafety scanner runs on all biological candidates.' },
  { n: 2, slug: 'biollm', name: 'Decentralized BioLLM Marketplace', icon: 'solar:cpu-bolt-bold', body: 'Pay-per-inference scientific AI: ESM-3, AlphaFold3-compat, Evo, Geneformer, BioMedLM, ChemBERTa, MatBERT, brain-age models. Settled via micropayments on Base.' },
  { n: 3, slug: 'robotics', name: 'Robotic Lab Hardware Network', icon: 'solar:settings-bold', body: 'Synthesis robots, liquid handlers, mass spectrometers, microscopes, BCI rigs registered as Lab Hardware NFTs. Booked in SYNAPSE / USDC. Cryptographically signed results.' },
  { n: 4, slug: 'data', name: 'Federated Data Markets', icon: 'solar:database-bold', body: 'ZK-governed neuroscience and multi-domain data. Halo2 / Nova proofs verify gradient computation without revealing raw data. 80/20 contributor / protocol split.' },
  { n: 5, slug: 'ipnft', name: 'Research Funding & IP-NFT Ecosystem', icon: 'solar:medal-ribbon-star-bold', body: 'Milestone-gated escrow. Contribution NFTs encode royalty rights. IP-NFTs minted on Grade A/B verified results. USPTO EFS-Web autofiling. Royalties via ERC-2981 on Base.' },
  { n: 6, slug: 'agents', name: 'Autonomous Agent Swarm (elizaOS v2)', icon: 'solar:cpu-bold', body: 'Hypothesis Generator, BioLLM Orchestrator, Lab Orchestrator, Evidence Grader, IP Scout and Biosecurity agents. All outputs signed on-chain, all reasoning on Arweave.' },
];

const domains = [
  ['Drug Discovery', 'Small molecule, peptide, antibody, gene therapy — every modality.'],
  ['Neuroscience & BCI', 'fMRI/EEG markets, Alzheimer biomarker models, BCI rigs.'],
  ['Materials Science', 'Battery cathodes, perovskites, superconductors, catalysts.'],
  ['Synthetic Biology', 'Riboswitches, gene circuits, directed evolution loops.'],
  ['Climate Science', 'Atmospheric sensors, CO₂ catalysts, federated weather data.'],
  ['Robotics', 'Manipulation trajectories, autonomous lab loaders, BCI hardware.'],
];

const tokenomics = [
  ['Hypothesis commitment', '10 SYNAPSE', 'Burned on ATL commit — prevents spam hypotheses'],
  ['BioLLM inference', '0.01 – 1 SYNAPSE', '70% to Model Operator · 30% to protocol'],
  ['Robotic lab booking', '5% of USDC cost', 'Protocol fee on all hardware bookings'],
  ['Data marketplace query', '0.1 SYNAPSE', '80% to data provider · 20% to protocol'],
  ['IP-NFT minting', '50 SYNAPSE', '50% burned · 50% to SYNAPSE stakers'],
];

export default function Protocol() {
  return (
    <PageShell
      eyebrow="Six-Layer Architecture"
      title="The Synapse Protocol."
      intro="Six on-chain layers operating as one Autonomous Generalist Scientist. Cryptographic attestation, biological intelligence, robotic execution, federated data, IP-NFT funding and an elizaOS v2 agent swarm — unified on Base."
    >
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {layers.map(l => (
          <Card key={l.n} id={l.slug} className="scroll-mt-32">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-zinc-700">
                <iconify-icon icon={l.icon} width="20"></iconify-icon>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500">Layer {l.n}</span>
            </div>
            <h3 className="text-black font-medium text-base">{l.name}</h3>
            <p className="text-zinc-600 text-sm mt-2 leading-relaxed">{l.body}</p>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl text-black font-thin tracking-tight">Six science domains.</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {domains.map(([n, b]) => (
            <Card key={n}>
              <h4 className="text-black font-medium">{n}</h4>
              <p className="text-zinc-600 text-sm mt-1">{b}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="tokenomics" className="flex flex-col gap-4 scroll-mt-32">
        <h2 className="text-3xl text-black font-thin tracking-tight">$SYNAPSE token economy.</h2>
        <p className="text-zinc-600 max-w-2xl">$SYNAPSE burns on every hypothesis commit, every BioLLM inference, every robotic lab booking, every data marketplace query and every IP-NFT mint. Demand is structurally tied to scientific output across all domains.</p>
        <Card>
          <div className="overflow-x-auto -m-6">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-widest text-zinc-500 border-b border-black/10">
                <tr><th className="text-left p-4">Action</th><th className="text-left p-4">Cost</th><th className="text-left p-4">Mechanism</th></tr>
              </thead>
              <tbody>
                {tokenomics.map(r => (
                  <tr key={r[0]} className="border-b border-black/5 last:border-0">
                    <td className="p-4 text-black font-medium">{r[0]}</td>
                    <td className="p-4 text-zinc-700 whitespace-nowrap">{r[1]}</td>
                    <td className="p-4 text-zinc-600">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-3xl text-black font-thin tracking-tight">Roadmap.</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            ['Phase 1', 'Weeks 1–10', 'ATL Attestation + BioLLM live on Base Mainnet. PoP-Shield integrated.'],
            ['Phase 2', 'Weeks 11–20', 'Federated data markets + first robotic lab MVP. elizaOS v2 fleet operational.'],
            ['Phase 3', 'Weeks 21–28', 'IP-NFT secondary market on OpenSea / Blur. Smart contract audits.'],
            ['Phase 4', 'Weeks 29–36', 'SYNAPSE TGE. 50+ labs in 10+ countries. MoonPay on-ramp.'],
            ['Phase 5', 'Month 10+', 'AGS milestone — full autonomy across all six domains.'],
          ].map(([p,t,b]) => (
            <Card key={p}>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">{t}</div>
              <h4 className="text-black font-medium mt-1">{p}</h4>
              <p className="text-zinc-600 text-xs mt-2 leading-relaxed">{b}</p>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
