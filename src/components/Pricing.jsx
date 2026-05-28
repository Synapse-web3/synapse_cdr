import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import RevealText from './RevealText';
import { gsap, ScrollTrigger } from '../lib/animations';

export default function Pricing() {
  const rootRef = useRef(null);

  const tiers = [
    {
      name: "ATL Hypothesis Commit",
      price: "10",
      unit: "SYN",
      description: "Burned on every ATL commit — prevents spam, anchors the prediction on Base before any drone or robot mission begins.",
      features: ["keccak256 commit-reveal on Base","Hardware fingerprint linked on-chain","Evidence grade A/B/C/D/X","PoP-Shield biosafety scan"],
      buttonText: "Commit Hypothesis", to: "/hypothesis-lab", isPopular: false, comingSoon: true,
    },
    {
      name: "PoPW Verification", price: "2", unit: "SYN / package",
      description: "Burned per Proof-of-Physical-Work verification — hardware fingerprint, GPS anchor and signed telemetry confirmed on Base.",
      features: ["Hardware attestation","GPS-anchored timestamp","Telemetry signed on Base","Fraud-score routing"],
      buttonText: "Browse Mission Control", to: "/labs", isPopular: true, comingSoon: true,
    },
    {
      name: "IP-NFT Mint", price: "50", unit: "SYN",
      description: "Minted on Grade A/B verified result. 50% burned, 50% to $SYN stakers. ERC-2981 royalties on Base.",
      features: ["Tradeable on OpenSea / Blur","Contribution NFT royalty splits","Auto-filed via USPTO EFS-Web","Patent status on-chain"],
      buttonText: "Open IP-NFT Explorer", to: "/ip-nft", isPopular: false, comingSoon: true,
    },
  ];

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = root.querySelectorAll('[data-tier]');
    const cleans = [];

    // Initial stacked state — fan out as user scrolls into the section
    const initials = [
      { x: 80, rotateZ: -10, scale: 0.92 },
      { x: 0, rotateZ: 0, scale: 0.96 },
      { x: -80, rotateZ: 10, scale: 0.92 },
    ];
    cards.forEach((c, i) => {
      gsap.set(c, { ...initials[i], opacity: 0, y: 100, transformPerspective: 1200, transformOrigin: 'center bottom' });
    });

    const tween = gsap.to(cards, {
      x: 0, rotateZ: 0, scale: 1, opacity: 1, y: 0,
      duration: 1.4, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: root, start: 'top 75%', toggleActions: 'play none none reverse' },
    });
    cleans.push(() => { tween.scrollTrigger?.kill(); tween.kill(); });

    // Feature wipe-in
    root.querySelectorAll('[data-feat]').forEach((card) => {
      const items = card.querySelectorAll('li');
      gsap.set(items, { clipPath: 'inset(0 100% 0 0)', opacity: 0 });
      const t = gsap.to(items, {
        clipPath: 'inset(0 0% 0 0)', opacity: 1,
        duration: 0.7, ease: 'power3.out', stagger: 0.08,
        scrollTrigger: { trigger: card, start: 'top 70%', toggleActions: 'play none none reverse' },
      });
      cleans.push(() => { t.scrollTrigger?.kill(); t.kill(); });
    });


    return () => cleans.forEach((f) => f());
  }, []);

  return (
    <div ref={rootRef} className="z-10 w-full max-w-[1200px] mx-auto pt-12 pb-12 px-6 relative">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10 mb-6">
          <iconify-icon icon="solar:fire-linear" class="text-amber-600 text-sm"></iconify-icon>
          <span className="text-xs font-medium text-zinc-700 uppercase tracking-widest">$SYN Token Economy</span>
        </div>
        <RevealText
          text="One token. Burned across every robot-hour."
          className="text-4xl md:text-[4rem] leading-[1.05] text-black font-thin tracking-tighter mb-4"
        />
        <p className="text-zinc-600 max-w-2xl text-lg font-light">
          $SYN burns on every ATL commit, PoPW verification, marketplace query and IP-NFT mint. Demand is structurally tied to physical AI activity on-chain.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 [perspective:1400px]">
        {tiers.map((plan, i) => {
          const isPop = plan.isPopular;
          return (
            <div data-tier key={i} className="relative h-full will-change-transform">
              {isPop && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2 z-20">
                  <span className="bg-black text-white text-[10px] font-semibold px-3 py-1 rounded-full tracking-widest uppercase">
                    Most Active
                  </span>
                </div>
              )}
              <div className={`relative h-full group rounded-[2rem] p-[1px] overflow-hidden bg-gradient-to-b from-black/40 via-black/20 to-black/80 shadow-[0_20px_50px_rgba(0,0,0,0.25)]`}>
                <div className="absolute inset-[1px] bg-gradient-to-b from-zinc-900 to-black backdrop-blur-xl rounded-[calc(2rem-1px)] z-0"></div>
                {isPop && (
                  <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-indigo-500/15 blur-[60px] rounded-full pointer-events-none z-0"></div>
                    {/* Conic sweep border for popular */}
                    <div className="absolute -inset-[1px] rounded-[2rem] z-0 opacity-70 pointer-events-none animate-[spin_8s_linear_infinite] [background:conic-gradient(from_0deg,transparent_70%,rgba(99,102,241,0.6),transparent)]"></div>
                    <div className="absolute inset-[2px] rounded-[calc(2rem-2px)] bg-gradient-to-b from-zinc-900 to-black z-[1]"></div>
                  </>
                )}
                <div data-feat className="relative z-[2] p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium text-white mb-2">{plan.name}</h3>
                    <p className="text-sm text-zinc-400 font-light min-h-[60px]">{plan.description}</p>
                  </div>
                  <div className="mb-8 flex items-baseline gap-2">
                    <span className="text-4xl lg:text-5xl font-light tracking-tight text-white">{plan.price}</span>
                    <span className="text-zinc-400 text-sm">{plan.unit}</span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 flex-grow">
                    {plan.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-zinc-200">
                        <iconify-icon icon="solar:check-circle-bold" class={`text-lg mt-0.5 ${isPop ? 'text-emerald-400' : 'text-indigo-400'}`}></iconify-icon>
                        <span className="font-light">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={plan.to}
                    className={`block w-full py-3.5 px-6 rounded-full text-sm font-medium tracking-tight text-center transition-opacity hover:opacity-80 ${isPop ? 'bg-white text-black' : 'bg-white/20 text-white border border-white/20'}`}
                  >
                    {plan.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
