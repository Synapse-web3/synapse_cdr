import PageShell, { Card } from '../components/PageShell';

export default function Biosecurity() {
  return (
    <PageShell
      eyebrow="PoP-Shield · Proof-of-Provenance"
      title="Biosecurity Policy."
      intro="Synapse coordinates real wet-lab and computational biology at scale. With that capability comes a responsibility to make dual-use research cryptographically harder, not easier. PoP-Shield is the protocol-level filter that enforces this — and it is non-negotiable."
    >
      <Card>
        <h2 className="text-black text-xl font-medium mb-3">1. PoP-Shield at commit time</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Every hypothesis submitted to the HypothesisRegistry on Base is automatically scanned by PoP-Shield before the on-chain commit is accepted. Sequences, target organisms, compound classes, and intent vectors are checked against a continuously updated dual-use catalog (gain-of-function pathogen work, Schedule-1 chemical synthesis, enhanced transmissibility in respiratory pathogens, and related categories). A flagged hypothesis cannot anchor an IP-NFT downstream.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">2. Hardware-side enforcement</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Robotic Lab Network operators stake $SYNAPSE against their Lab Hardware NFT. Executing a flagged or unsigned protocol triggers slashing. Synthesis robots and liquid handlers verify the PoP-Shield signature on the experiment payload before the first pipette move.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">3. BioLLM guardrails</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Model operators on the BioLLM Marketplace must implement the PoP-Shield inference filter for sequence-design and synthesis-route models (ESM-3, Evo, AlphaFold3-compatible, ChemBERTa, Geneformer). Refusal events are logged on-chain alongside the inference receipt for auditability.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">4. Federated data &amp; KYB</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Pathogen-adjacent datasets in the Federated Data Market are gated by lab-grade KYB. Queries are answered only with zero-knowledge proofs (Halo2 / Nova) — raw genomes never leave the contributor's enclave, and aggregate queries that would re-identify a hazardous sequence are mathematically blocked.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">5. Disclosure</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Suspected misuse, PoP-Shield bypass attempts, or biosafety vulnerabilities should be reported to security@synapseprotocol.xyz. Coordinated disclosure follows a 90-day window, with bug-bounty rewards in $SYNAPSE for verified findings.
        </p>
      </Card>

      <Card dark>
        <p className="text-white text-sm leading-relaxed">
          Synapse will refuse to anchor, fund, or execute research whose foreseeable harm outweighs its scientific value. This is enforced in code, in cryptography, and in the staking economics of every operator on the network.
        </p>
      </Card>
    </PageShell>
  );
}
