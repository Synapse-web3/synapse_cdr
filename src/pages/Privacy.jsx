import PageShell, { Card } from '../components/PageShell';

export default function Privacy() {
  return (
    <PageShell
      eyebrow="Legal · Effective May 2026"
      title="Privacy Policy."
      intro="Synapse Protocol is a decentralized scientific infrastructure operating on Base. By design, most protocol interactions are pseudonymous and recorded on a public ledger. This policy describes what we collect off-chain, what is permanently public on-chain, and the cryptographic guarantees that protect raw scientific data."
    >
      <Card>
        <h2 className="text-black text-xl font-medium mb-3">1. On-chain data (public, immutable)</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          The following are permanently public on Base and cannot be deleted: wallet addresses, salted keccak256 hypothesis commitments, ExperimentRecord events, BioLLM inference receipts (model id, version, parameter hash, output hash), Lab Hardware NFT bookings, IP-NFT mints, royalty distributions, $SYNAPSE burns and stakes. Long-form artifacts (manuscripts, raw datasets, video) are pinned to Arweave and addressable forever by content hash.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">2. Off-chain data we collect</h2>
        <ul className="text-zinc-700 text-sm space-y-2 list-disc pl-5">
          <li>Wallet address on connect (MetaMask, Coinbase Wallet). We never request or store seed phrases or private keys.</li>
          <li>Aggregate analytics: page views, feature usage, error traces. No cross-site tracking.</li>
          <li>Optional: email if you subscribe to research-campaign updates.</li>
          <li>Lab operator KYB documents, retained only by the operator; the protocol stores a hash.</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">3. Federated &amp; ZK data</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Datasets contributed to the Federated Data Market never leave the contributor's enclave. Queries return only zero-knowledge proofs (Halo2 / Nova) that a result was computed correctly over the data — raw rows are mathematically inaccessible to buyers, the protocol, or other contributors.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">4. Your rights</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          You may disconnect your wallet at any time and delete browser-local state. Off-chain personal data (email, KYB) can be erased on request. On-chain data is immutable by protocol design and cannot be deleted.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">5. Contact</h2>
        <p className="text-zinc-700 text-sm">privacy@synapseprotocol.xyz</p>
      </Card>
    </PageShell>
  );
}
