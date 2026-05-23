import PageShell, { Card } from '../components/PageShell';

export default function Terms() {
  return (
    <PageShell
      eyebrow="Legal · Effective May 2026"
      title="Terms of Service."
      intro="By accessing the Synapse Protocol interface, smart contracts, or any associated surface (Hypothesis Lab, BioLLM Marketplace, Robotic Lab Network, IP-NFT Explorer, Federated Data Market, Research Campaigns, Agent Console, Dashboard), you agree to these terms."
    >
      <Card>
        <h2 className="text-black text-xl font-medium mb-3">1. Nature of the protocol</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Synapse is autonomous, non-custodial, open-source software deployed on Base. The interface is a thin client. The protocol does not custody funds, hold scientific data, or act as a counterparty to any transaction. All actions are executed by you, signed by your wallet.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">2. $SYNAPSE token</h2>
        <p className="text-zinc-700 text-sm leading-relaxed mb-2">
          $SYNAPSE is an ERC-20 utility token used to coordinate scientific work. It is not an investment, security, or claim on revenue. Flows are protocol-defined:
        </p>
        <ul className="text-zinc-700 text-sm space-y-1.5 list-disc pl-5">
          <li>10 SYNAPSE burned per hypothesis commit</li>
          <li>0.01–0.10 USDC-equivalent per BioLLM inference (x402)</li>
          <li>5% of every lab booking burned</li>
          <li>0.10 SYNAPSE per federated query</li>
          <li>50 SYNAPSE per IP-NFT mint (50% burned, 50% staked to evidence reviewers)</li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">3. IP-NFTs and royalties</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          IP-NFTs may only be minted when the originating hypothesis commit predates the result and the result achieves Grade A or B evidence. Royalties stream to Contribution NFT holders via ERC-2981 on Base. Trading occurs on third-party marketplaces (OpenSea, Blur) at your own risk.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">4. Scientific risk</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          Hypotheses, datasets, model outputs, and lab results published through the protocol are research artifacts, not medical, financial, or safety advice. Do not act on them outside a controlled scientific context. Lab operators are independently responsible for compliance with their jurisdiction.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">5. Prohibited use</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          You may not submit hypotheses or experimental designs that violate the Biosecurity Policy, applicable export controls, sanctions, or laws of your jurisdiction. PoP-Shield will block dual-use biological candidates at commit time; circumventing it is a protocol-level offense.
        </p>
      </Card>

      <Card>
        <h2 className="text-black text-xl font-medium mb-3">6. No warranty · limitation of liability</h2>
        <p className="text-zinc-700 text-sm leading-relaxed">
          The software is provided "as is" without warranty of any kind. To the maximum extent permitted by law, the contributors and the DAO disclaim liability for any losses arising from use of the protocol, smart-contract bugs, oracle failures, or third-party hardware operators.
        </p>
      </Card>
    </PageShell>
  );
}
