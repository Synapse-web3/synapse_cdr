import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, countUp } from '../lib/animations';

const stats = [
  { label: "Robot training data market by 2035", value: "$30B", icon: "solar:chart-square-linear", trend: "Deloitte", target: 30, format: (v) => `$${v.toFixed(1)}B` },
  { label: "Industrial robots installed 2026", value: "5.5M", icon: "solar:cpu-bolt-linear", trend: "+15K humanoids", target: 5.5, format: (v) => `${v.toFixed(1)}M` },
  { label: "Base chain share of AI agent payments", value: "65%", icon: "simple-icons:base", trend: "Feb 2026", target: 65, format: (v) => `${Math.round(v)}%` },
  { label: "Connected-vehicle data / month", value: "10 EXB", icon: "solar:car-linear", brand: "simple-icons:tesla", trend: "by 2025", target: 10, format: (v) => `${Math.round(v)} EXB` },
];

export default function Stats() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = root.querySelectorAll('[data-card]');
    const valueEls = root.querySelectorAll('[data-value]');
    const bars = root.querySelectorAll('[data-bar]');

    // Reveal cascade — staggered slide + clip-path reveal
    gsap.set(cards, { opacity: 0, y: 50, clipPath: 'inset(0 0 100% 0)' });
    const reveal = gsap.to(cards, {
      opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)',
      duration: 1.2, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: root, start: 'top 80%', toggleActions: 'play none none reverse' },
    });

    // Count up numbers
    const cleans = [];
    valueEls.forEach((el, i) => {
      cleans.push(countUp(el, stats[i].target, stats[i].format, root));
    });

    // Scrubbed bottom progress bars
    bars.forEach((bar) => {
      gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });
      const t = gsap.to(bar, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: bar.closest('[data-card]'), start: 'top 90%', end: 'top 30%', scrub: true },
      });
      cleans.push(() => { t.scrollTrigger?.kill(); t.kill(); });
    });

    return () => {
      reveal.scrollTrigger?.kill(); reveal.kill();
      cleans.forEach((f) => f());
    };
  }, []);

  return (
    <div ref={rootRef} className="w-full max-w-[1200px] mx-auto px-6 py-12 z-10 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div
            data-card
            key={i}
            className="stats-card relative group rounded-[2rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.25)] transition-shadow duration-500"
          >
            <div className="absolute inset-[1px] bg-gradient-to-b from-zinc-900 to-black backdrop-blur-xl rounded-[calc(2rem-1px)] z-0"></div>
            <div className="absolute inset-[1px] bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] rounded-[calc(2rem-1px)] z-0 opacity-100"></div>

            {/* Iridescent sweep on hover */}
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] z-[1] overflow-hidden">
              <div className="absolute -inset-x-1/2 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] -translate-x-full group-hover:translate-x-[300%] transition-transform duration-[1400ms] ease-out"></div>
            </div>

            <div className="relative z-10 p-6 lg:p-8 flex flex-col justify-between h-full min-h-[200px]">
              <div className="flex justify-between items-start w-full">
                <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white">
                  <iconify-icon icon={stat.icon} width="22"></iconify-icon>
                </div>
                <span className="text-xs font-medium text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                  {stat.trend}
                </span>
              </div>
              <div className="mt-8 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div data-value className="text-3xl lg:text-4xl font-geist font-light tracking-tighter text-white mb-2 tabular-nums">0</div>
                  <div className="text-xs lg:text-sm text-zinc-400 font-medium tracking-wide">{stat.label}</div>
                </div>
                {stat.brand && (
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/90 backdrop-blur-sm" title="Tesla fleet telemetry">
                    <iconify-icon icon={stat.brand} width="20"></iconify-icon>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom progress bar */}
            <div className="absolute bottom-[1px] left-[1px] right-[1px] h-[2px] z-[2] overflow-hidden rounded-b-[calc(2rem-1px)]">
              <div data-bar className="h-full w-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-amber-300"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
