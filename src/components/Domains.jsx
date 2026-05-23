import { useEffect, useRef, useState } from 'react';
import RevealText from './RevealText';
import { gsap } from '../lib/animations';

const domains = [
  { icon: 'solar:leaf-linear', name: 'Environmental Drone Surveys', desc: 'Wildlife corridors, deforestation, reef health, agricultural monitoring. ATL-committed missions, IP-NFT findings cited in policy.', accent: '#10b981' },
  { icon: 'solar:settings-linear', name: 'Robotic Manufacturing', desc: 'Industrial robot telemetry feeds process-optimisation hypotheses. PoPW-verified results licensed to manufacturers.', accent: '#f97316' },
  { icon: 'solar:routing-linear', name: 'Autonomous Navigation', desc: 'Sidewalk rovers, delivery drones and ground robots contribute trajectories. AV labs license verified hours via x402.', accent: '#06b6d4' },
  { icon: 'solar:hand-shake-linear', name: 'Humanoid Dexterity', desc: 'Grasping, folding and assembly hypotheses tested on ROBA / open-hardware humanoids with sim-to-real telemetry.', accent: '#6366f1' },
  { icon: 'solar:shield-keyhole-linear', name: 'Defense Drone Intelligence', desc: 'Kalder-integrated compliance layer with ZK geofence proofs. Mission attested without revealing classified coordinates.', accent: '#ec4899' },
  { icon: 'solar:medal-ribbon-star-linear', name: 'Aerial IP & Patentable Findings', desc: 'IP Scout Agent identifies novel sensor outputs. Provisional patents auto-filed via USPTO EFS-Web.', accent: '#f59e0b' },
];

export default function Domains() {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Wait a frame for layout
    requestAnimationFrame(() => {
      const halfWidth = track.scrollWidth / 2;
      gsap.set(track, { x: 0 });
      tweenRef.current = gsap.to(track, {
        x: -halfWidth,
        duration: 60,
        ease: 'none',
        repeat: -1,
        modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % halfWidth) },
      });
    });

    return () => { tweenRef.current?.kill(); };
  }, []);

  const onEnter = () => tweenRef.current && gsap.to(tweenRef.current, { timeScale: 0.15, duration: 0.6 });
  const onLeave = () => { tweenRef.current && gsap.to(tweenRef.current, { timeScale: 1, duration: 0.8 }); setHovered(null); };

  // Duplicate for seamless loop
  const items = [...domains, ...domains];

  return (
    <div className="w-full overflow-hidden relative bg-white py-20">
      {/* Section background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.55]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,white_85%)]"></div>
      </div>

      {/* Header */}
      <div className="relative max-w-[1200px] mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10 mb-6">
              <iconify-icon icon="solar:global-linear" class="text-indigo-600 text-sm"></iconify-icon>
              <span className="text-xs font-medium text-zinc-700 uppercase tracking-widest">Physical AI Use Cases</span>
            </div>
            <RevealText
              text="Every robot. Every drone."
              className="text-4xl md:text-[4rem] leading-[1.05] text-black font-thin tracking-tighter"
            />
          </div>
          <p className="max-w-sm text-sm md:text-base text-zinc-600 font-light">
            One protocol, every form of physical AI. ATL attestation and PoPW verification generalize across drones, ground robots, humanoids and autonomous vehicles.
          </p>
        </div>
      </div>

      {/* Marquee carousel — edges fade */}
      <div
        className="relative [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        <div ref={trackRef} className="flex items-stretch gap-6 w-max will-change-transform py-4">
          {items.map((d, i) => {
            const isHover = hovered === i;
            return (
              <article
                key={`${d.name}-${i}`}
                onMouseEnter={() => setHovered(i)}
                className="relative flex-shrink-0 w-[320px] h-[340px] rounded-[1.5rem] bg-white border border-black/10 overflow-hidden group transition-all duration-500"
                style={{
                  boxShadow: isHover
                    ? `0 30px 70px -20px ${d.accent}55, 0 8px 22px -8px rgba(0,0,0,0.12)`
                    : `0 10px 30px -12px rgba(0,0,0,0.10)`,
                  transform: isHover ? 'translateY(-6px)' : 'translateY(0)',
                }}
              >
                <div
                  className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-[60px] opacity-40 transition-opacity duration-500 group-hover:opacity-70"
                  style={{ backgroundColor: d.accent }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 h-[2px] origin-left transition-transform duration-500"
                  style={{
                    background: `linear-gradient(to right, transparent, ${d.accent}, transparent)`,
                    transform: isHover ? 'scaleX(1)' : 'scaleX(0.4)',
                  }}
                />

                <div className="relative z-10 p-7 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-auto">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-black border border-black/10 bg-white/80 backdrop-blur-sm"
                      style={{ boxShadow: `0 6px 20px -8px ${d.accent}66` }}
                    >
                      <iconify-icon icon={d.icon} width="24"></iconify-icon>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: d.accent }} />
                      <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: d.accent }}>Live</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-[10px] font-mono text-zinc-400 mb-2.5 tracking-widest">
                      USE CASE — {String((i % domains.length) + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-xl font-geist font-thin tracking-tight text-black leading-[1.15] mb-3">
                      {d.name}
                    </h3>
                    <p className="text-[13px] text-zinc-600 font-light leading-relaxed line-clamp-4">
                      {d.desc}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Hint */}
      <div className="relative mt-10 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest text-zinc-500">
        <iconify-icon icon="solar:refresh-linear" class="text-base animate-spin" style={{ animationDuration: '8s' }}></iconify-icon>
        <span>Continuous · Hover to slow · 06 Use Cases</span>
      </div>
    </div>
  );
}
