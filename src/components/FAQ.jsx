import { useState, useEffect, useRef } from 'react';
import RevealText from './RevealText';
import { gsap, magneticCursor } from '../lib/animations';

const faqs = [
  {
    question: "What is Synapse Protocol?",
    answer: "Synapse is the on-chain intelligence and attestation layer for the physical AI era — drones, ground robots, humanoids and autonomous vehicles. It is deployed on Base as three contracts: SynapseProtocol (hypothesis lifecycle, lab booking, revenue routing), the SYNAPSE ERC-20 token (6 decimals, burn-on-use), and SynapseIPNFT (ERC-721 + ERC-2981 royalties). Together they connect real-world robotic outputs to cryptographically verified, community-owned IP via ATL hypothesis attestation, Proof-of-Physical-Work and a robotic training data marketplace."
  },
  {
    question: "What is Proof-of-Physical-Work (PoPW)?",
    answer: "PoPW verifies that a physical robot or drone actually executed the work it claims. An operator calls bookLab on SynapseProtocol — paying USDC plus SYNAPSE — to reserve lab time. After the mission, the result hash is stored on-chain via submitExperimentResult. Each PoPW package carries a hardware fingerprint, a GPS-anchored timestamp, and signed telemetry, all confirmed on Base. If fraud is detected the evidenceGrader can call slashOperator, removing the operator from the network and slashing their stake."
  },
  {
    question: "How does ATL work for a drone or robot mission?",
    answer: "Before the mission, the operator calls commitHypothesis on SynapseProtocol, passing a bytes8 shortId, a domain uint8, a gradeTarget uint8 (A=1 through X=5), and a bytes32 saltedHash computed as keccak256(abi.encodePacked(salt, plaintext)). The contract burns 10 SYNAPSE from the caller via burnFrom and emits EvtHypothesisCommitted. Post-mission, revealHypothesis is called with the original salt and plaintext; the contract recomputes the hash and reverts with HashMismatch if it does not match. The evidenceGrader address then calls setHypothesisGrade, which emits EvtHypothesisGraded. Only a Grade A or B result satisfies the mintIpnft call — lower grades revert with GradeInsufficient."
  },
  {
    question: "How does Synapse relate to Flypraxis and ROBA Labs?",
    answer: "Complementary, not competing. Flypraxis turns drone feeds into operational intelligence. ROBA Labs builds the open robotics platform and creator hub. Synapse is the on-chain layer above both — it makes Flypraxis detections scientifically attested and IP-monetisable via SynapseIPNFT, and gives ROBA operators a path to earn SYNAPSE for verified training data contributions that pass PoPW. Inference revenue from both networks is routed 70% to the operator and 30% to the protocol treasury via routeInferenceRevenue; data query revenue is split 80/20 via routeDataQueryRevenue."
  },
  {
    question: "What is $SYN used for?",
    answer: "SYNAPSE is an ERC-20 with 6 decimal places. It is burned directly inside SynapseProtocol via burnFrom on every action: 10 SYNAPSE on commitHypothesis, 2 SYNAPSE per PoPW package, 0.5 SYNAPSE per data marketplace query, and 50 SYNAPSE on mintIpnft (50% of that mint burn goes to stakers recorded via stakeSynapse). Operators who contribute inference compute earn the 70% share of routeInferenceRevenue; data contributors earn the 80% share of routeDataQueryRevenue. Physical AI activity — drones flying, robots working, data being collected — drives structural demand for SYNAPSE at the contract level."
  },
  {
    question: "How does defense drone intelligence stay compliant?",
    answer: "Via the PoPS Shield (Proof-of-Physical-Safety): before any hypothesis can proceed to reveal or IP-NFT mint, the PoPS clearance address must call setPopsClearance(hypothesisKey, true) on SynapseProtocol. If the biosafety scan flags a risk, the contract stores cleared=false and any downstream call reverts with PopsShieldFlagged; if the scan is still running, calls revert with PopsShieldPending. This gate is combined with ZK geofence proofs: the mission hypothesis is committed on-chain before the flight, and detection outputs are attested post-mission without revealing classified coordinates — the proof confirms the prediction without exposing the underlying telemetry."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const items = root.querySelectorAll('[data-faq]');
    gsap.set(items, { opacity: 0, x: 60, clipPath: 'inset(0 0 0 100%)' });
    const tween = gsap.to(items, {
      opacity: 1, x: 0, clipPath: 'inset(0 0 0 0%)',
      duration: 1, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: root, start: 'top 82%', toggleActions: 'play none none reverse' },
    });

    const offs = [];
    root.querySelectorAll('[data-magnet]').forEach((el) => offs.push(magneticCursor(el, 0.3, 80)));

    return () => {
      tween.scrollTrigger?.kill(); tween.kill();
      offs.forEach((f) => f());
    };
  }, []);

  return (
    <div ref={rootRef} className="w-full max-w-[820px] mx-auto px-6 z-10 relative">
      <div className="flex flex-col items-center text-center mb-12">
        <RevealText
          text="Protocol Questions."
          className="text-3xl md:text-[3.5rem] leading-[1.05] text-black font-thin tracking-tighter mb-4"
        />
        <p className="text-base text-zinc-600 font-geist font-light max-w-lg">
          Everything drone operators, robotics researchers and community funders ask before joining the Synapse network.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              data-faq
              key={index}
              className={`relative group rounded-2xl p-[1px] transition-all duration-500 overflow-hidden ${
                isOpen
                  ? 'bg-gradient-to-b from-black/30 via-black/15 to-black/80 shadow-[0_8px_20px_rgba(0,0,0,0.15)]'
                  : 'bg-gradient-to-b from-black/10 to-transparent hover:from-black/20'
              }`}
            >
              <div className="absolute inset-[1px] bg-white/95 backdrop-blur-xl rounded-[calc(1rem-1px)] z-0"></div>

              <div className="relative z-10">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between cursor-pointer outline-none"
                  aria-expanded={isOpen}
                >
                  <h3 className={`text-base md:text-lg font-geist tracking-tight transition-colors duration-300 ${isOpen ? 'text-black' : 'text-zinc-700 group-hover:text-black'}`}>
                    {faq.question}
                  </h3>
                  <div
                    data-magnet
                    className={`flex-shrink-0 ml-4 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-500 ${
                      isOpen ? 'bg-black border-black text-white rotate-180 scale-110' : 'border-black/15 text-zinc-500 group-hover:text-zinc-700 group-hover:border-black/30'
                    }`}
                    style={{ transitionTimingFunction: 'cubic-bezier(.34,1.56,.64,1)' }}
                  >
                    <iconify-icon icon="solar:alt-arrow-down-linear" width="18"></iconify-icon>
                  </div>
                </button>

                <div className={`grid transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-6 text-zinc-600 font-geist leading-relaxed text-sm md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
