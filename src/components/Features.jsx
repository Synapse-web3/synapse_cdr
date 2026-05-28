import { useEffect, useRef } from 'react';
import RevealText from './RevealText';
import { gsap, ScrollTrigger, attachTilt } from '../lib/animations';

/* ---------- Premium animated decorations for pillar 4 cards ---------- */
const IPSealAnim = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ring = el.querySelector('[data-ring]');
    const seal = el.querySelector('[data-seal]');
    const pulse = el.querySelector('[data-pulse]');
    const particles = el.querySelectorAll('[data-p]');
    gsap.to(ring, { rotation: 360, duration: 18, ease: 'none', repeat: -1, transformOrigin: '50% 50%' });
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(seal, { scale: 0.92 }, { scale: 1.06, duration: 1.6, yoyo: true, repeat: 1, ease: 'sine.inOut' })
      .fromTo(pulse, { scale: 0.6, opacity: 0.7 }, { scale: 2.4, opacity: 0, duration: 1.6, ease: 'power2.out' }, 0);
    particles.forEach((p, i) => {
      gsap.fromTo(p,
        { y: 30, opacity: 0 },
        { y: -50, opacity: 1, duration: 2.4, repeat: -1, delay: i * 0.35, ease: 'sine.out',
          onRepeat: () => gsap.set(p, { y: 30, opacity: 0 }) });
    });
    return () => { tl.kill(); gsap.killTweensOf([ring, seal, pulse, ...particles]); };
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 200 200" className="absolute right-2 top-2 w-32 h-32 pointer-events-none opacity-90">
      <defs>
        <radialGradient id="sealGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,210,77,0.9)" />
          <stop offset="100%" stopColor="rgba(255,210,77,0)" />
        </radialGradient>
      </defs>
      <circle data-pulse cx="100" cy="100" r="36" fill="none" stroke="rgba(255,210,77,0.7)" strokeWidth="1.5" />
      <g data-ring opacity="0.85">
        <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,210,77,0.4)" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" strokeDasharray="1 10" />
      </g>
      <g data-seal>
        <circle cx="100" cy="100" r="34" fill="url(#sealGrad)" />
        <circle cx="100" cy="100" r="28" fill="none" stroke="rgba(255,210,77,0.85)" strokeWidth="1.4" />
        <text x="100" y="106" textAnchor="middle" fill="rgba(255,255,255,0.95)" fontSize="14" fontFamily="monospace" letterSpacing="2">IP</text>
      </g>
      {[0,1,2,3,4].map((i) => (
        <circle key={i} data-p cx={86 + i*7} cy="100" r="1.6" fill="rgba(255,210,77,0.95)" />
      ))}
    </svg>
  );
};

const FleetAnim = () => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const orbits = el.querySelectorAll('[data-orbit]');
    const agents = el.querySelectorAll('[data-agent]');
    const links = el.querySelectorAll('[data-link]');
    const core = el.querySelector('[data-core]');
    orbits.forEach((o, i) => gsap.to(o, {
      rotation: i % 2 ? -360 : 360, duration: 14 + i * 4, ease: 'none', repeat: -1, transformOrigin: '50% 50%',
    }));
    agents.forEach((a, i) => gsap.to(a, {
      scale: 1.5, opacity: 1, duration: 0.8 + i * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%',
    }));
    links.forEach((l, i) => {
      const len = l.getTotalLength?.() || 100;
      gsap.set(l, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(l, { strokeDashoffset: 0, duration: 2, repeat: -1, yoyo: true, delay: i * 0.3, ease: 'sine.inOut' });
    });
    gsap.to(core, { scale: 1.2, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%' });
    return () => gsap.killTweensOf([...orbits, ...agents, ...links, core]);
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 200 200" className="absolute right-2 top-2 w-32 h-32 pointer-events-none">
      <defs>
        <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,245,255,0.95)" />
          <stop offset="100%" stopColor="rgba(0,245,255,0)" />
        </radialGradient>
      </defs>
      <g stroke="rgba(0,245,255,0.55)" strokeWidth="0.8" fill="none">
        <path data-link d="M100 100 L150 60" />
        <path data-link d="M100 100 L60 50" />
        <path data-link d="M100 100 L50 140" />
        <path data-link d="M100 100 L155 145" />
      </g>
      <g data-orbit>
        <circle cx="100" cy="100" r="55" fill="none" stroke="rgba(0,245,255,0.25)" strokeWidth="0.8" strokeDasharray="2 6" />
        <circle data-agent cx="155" cy="100" r="3" fill="rgba(0,245,255,0.95)" opacity="0.7" />
        <circle data-agent cx="45" cy="100" r="2.5" fill="rgba(255,255,255,0.9)" opacity="0.7" />
      </g>
      <g data-orbit>
        <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" strokeDasharray="1 8" />
        <circle data-agent cx="100" cy="22" r="2.4" fill="rgba(0,245,255,0.85)" opacity="0.7" />
        <circle data-agent cx="100" cy="178" r="2.4" fill="rgba(255,255,255,0.85)" opacity="0.7" />
        <circle data-agent cx="178" cy="100" r="2" fill="rgba(0,245,255,0.7)" opacity="0.6" />
      </g>
      <circle data-core cx="100" cy="100" r="22" fill="url(#coreGrad)" />
      <circle cx="100" cy="100" r="6" fill="rgba(255,255,255,0.95)" />
    </svg>
  );
};

const CanvasGlobe = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let raf, w, h, t = 0;
    const core = [], ring = [];
    for (let i = 0; i < 180; i++) {
      const phi = Math.acos(-1 + (2*i)/180);
      const theta = Math.sqrt(180*Math.PI) * phi;
      core.push({ x: Math.cos(theta)*Math.sin(phi), y: Math.sin(theta)*Math.sin(phi), z: Math.cos(phi) });
    }
    for (let i = 0; i < 400; i++) {
      const r = 1.2 + Math.random()*0.4;
      const theta = Math.random()*Math.PI*2;
      ring.push({ x: r*Math.cos(theta), y: (Math.random()-0.5)*0.2, z: r*Math.sin(theta) });
    }
    const resize = () => {
      const p = canvas.parentElement;
      w = p.clientWidth; h = p.clientHeight;
      canvas.width = w * devicePixelRatio; canvas.height = h * devicePixelRatio;
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
    };
    window.addEventListener('resize', resize); resize();
    const draw = (p, color, isRing) => {
      const rotY = isRing ? -t*0.5 : t, tilt = 0.4;
      let x1 = p.x*Math.cos(rotY) - p.z*Math.sin(rotY);
      let z1 = p.z*Math.cos(rotY) + p.x*Math.sin(rotY);
      let y2 = p.y*Math.cos(tilt) - z1*Math.sin(tilt);
      let z2 = z1*Math.cos(tilt) + p.y*Math.sin(tilt);
      const zF = z2 + 3.5; if (zF <= 0.1) return;
      const ps = 2.5/zF;
      const xs = (x1*ps)*(w/2) + w/2;
      const ys = (y2*ps)*(w/2) + h/2;
      const size = Math.max(0.1, (isRing?0.8:1.2)*ps*2.5);
      const a = Math.max(0.1, Math.min(1, 1.5 - (z2*0.5))) * (isRing?0.4:0.7);
      ctx.fillStyle = `rgba(${color}, ${a})`;
      ctx.beginPath(); ctx.arc(xs, ys, size, 0, Math.PI*2); ctx.fill();
    };
    const render = () => {
      ctx.clearRect(0,0,w,h); t += 0.01;
      core.forEach(p => draw(p, '24, 24, 27', false));
      ring.forEach(p => draw(p, '99, 102, 241', true));
      raf = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[5] opacity-90 pointer-events-none" />;
};

export default function Features() {
  const rootRef = useRef(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleans = [];

    const left = root.querySelectorAll('[data-dir="left"]');
    const right = root.querySelectorAll('[data-dir="right"]');
    const center = root.querySelectorAll('[data-dir="center"]');

    gsap.set(left, { opacity: 0, x: -120, rotateY: 12, transformPerspective: 1200 });
    gsap.set(right, { opacity: 0, x: 120, rotateY: -12, transformPerspective: 1200 });
    gsap.set(center, { opacity: 0, scale: 0.7, filter: 'blur(20px)' });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top 70%', toggleActions: 'play none none reverse' },
    });
    tl.to(left, { opacity: 1, x: 0, rotateY: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1 }, 0)
      .to(right, { opacity: 1, x: 0, rotateY: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1 }, 0)
      .to(center, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'expo.out' }, 0.15);
    cleans.push(() => { tl.scrollTrigger?.kill(); tl.kill(); });

    const cards = root.querySelectorAll('[data-tilt]');
    cards.forEach((c) => cleans.push(attachTilt(c, 6)));

    return () => cleans.forEach((f) => f());
  }, []);
  return (
    <div ref={rootRef} className="relative max-w-[1200px] mx-auto px-6 py-12 md:py-24 z-10 flex flex-col justify-center">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 lg:px-8">
        <RevealText
          text="Four Pillars — One Physical AI Protocol."
          className="text-5xl md:text-[5rem] w-full md:w-[65%] leading-[1.05] text-black font-thin tracking-tighter"
          as="h1"
        />
        <p className="text-sm md:text-base text-zinc-600 w-full md:w-[30%] max-w-sm text-balance mb-2 md:mb-4 font-normal animate-fade-up opacity-0 delay-200">
          Aerial physical intelligence, robotic training data, hypothesis attestation and an autonomous agent fleet — unified on Base with Proof-of-Physical-Work.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 h-auto md:h-[580px] lg:px-8">
        <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 h-full">

          <div data-dir="left" data-tilt className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 flex-1 overflow-hidden min-h-[160px] shadow-[0_8px_20px_rgba(0,0,0,0.25)] cursor-not-allowed opacity-75">
            <div className="absolute inset-[1px] bg-gradient-to-b from-zinc-900 to-black backdrop-blur-xl rounded-[calc(2rem-1px)] z-0"></div>
            <div className="relative z-10 p-7 h-full flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-cyan-300/90 mb-3 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span> Pillar 1
                </span>
                <h3 className="text-xl lg:text-2xl font-geist font-light tracking-tighter text-white w-full">Aerial Physical Intelligence Attestation.</h3>
              </div>
              <span className="flex items-center justify-between bg-white/10 rounded-full px-4 py-2.5 border border-white/20 mt-4 w-full">
                <span className="text-xs font-normal text-white/60 font-geist">Flypraxis bridge · ATL on Base</span>
                <iconify-icon icon="solar:arrow-right-up-linear" class="text-white/40 text-lg"></iconify-icon>
              </span>
            </div>
          </div>

          <div data-dir="left" data-tilt className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 flex-1 overflow-hidden min-h-[160px] shadow-[0_8px_20px_rgba(0,0,0,0.25)] cursor-not-allowed opacity-75">
            <div className="absolute inset-[1px] bg-gradient-to-b from-zinc-900 to-black backdrop-blur-xl rounded-[calc(2rem-1px)] z-0"></div>
            <div className="relative z-10 p-7 h-full flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-orange-300/90 mb-3 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span> Pillar 2
                </span>
                <h3 className="text-xl lg:text-2xl font-geist font-light tracking-tighter text-white w-full">Robotic Training Data Marketplace.</h3>
              </div>
              <div className="flex justify-end">
                <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/40">
                  <iconify-icon icon="solar:arrow-right-linear" class="text-xl"></iconify-icon>
                </span>
              </div>
            </div>
          </div>

          <div data-dir="left" data-tilt className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 flex-1 overflow-hidden min-h-[160px] shadow-[0_8px_20px_rgba(0,0,0,0.25)] cursor-not-allowed opacity-75">
            <div className="absolute inset-[1px] bg-gradient-to-b from-zinc-900 to-black backdrop-blur-xl rounded-[calc(2rem-1px)] z-0"></div>
            <CanvasGlobe />
            <div className="relative z-10 p-7 h-full flex flex-col justify-between pointer-events-none">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-indigo-300/90 mb-3 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span> Pillar 3
                </span>
                <h3 className="text-xl lg:text-2xl font-geist font-light tracking-tighter text-white w-3/4">Hypothesis Market for Robotics R&amp;D.</h3>
              </div>
              <div className="flex justify-end">
                <span className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/40">
                  <iconify-icon icon="solar:arrow-right-linear" class="text-xl"></iconify-icon>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div data-dir="center" data-tilt className="md:col-span-4 h-[400px] md:h-full relative rounded-[2rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 overflow-hidden cursor-not-allowed opacity-75 shadow-[0_12px_24px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] overflow-hidden z-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.6),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.4),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          </div>
          <div className="relative z-10 h-full p-7 flex flex-col justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-max">
              <iconify-icon icon="solar:shield-check-linear" class="text-emerald-300 text-sm"></iconify-icon>
              <span className="text-xs font-normal text-white font-geist">Proof-of-Physical-Work</span>
            </div>
            <div>
              <h3 className="text-2xl lg:text-3xl font-geist font-light tracking-tighter text-white leading-tight mb-3">PoPW Verified<br/>Robot Telemetry.</h3>
              <p className="text-sm text-zinc-300 font-light max-w-[260px] leading-relaxed">
                Hardware fingerprint, GPS anchor and signed telemetry on Base. Every robot-hour cryptographically real.
              </p>
            </div>
            <div className="flex justify-between items-end gap-4">
              <span className="text-xs uppercase tracking-widest text-zinc-400">Base · viem · ERC-2981</span>
              <span className="w-11 h-11 rounded-full bg-white/20 text-white/40 flex flex-shrink-0 items-center justify-center">
                <iconify-icon icon="solar:arrow-right-up-linear" class="text-xl"></iconify-icon>
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 flex flex-col gap-4 lg:gap-6 h-full">

          <div data-dir="right" data-tilt className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 flex-1 overflow-hidden min-h-[250px] cursor-not-allowed opacity-75 shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] overflow-hidden z-0 bg-gradient-to-br from-zinc-900 to-black">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_30%,rgba(255,210,77,0.4),transparent_55%)]"></div>
            </div>
            <IPSealAnim />
            <div className="relative z-10 h-full p-7 flex flex-col justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-max">
                <iconify-icon icon="solar:hand-money-linear" class="text-amber-300 text-sm"></iconify-icon>
                <span className="text-xs font-normal text-white font-geist">IP-NFT · Community Funded</span>
              </div>
              <div className="flex justify-between items-end gap-4">
                <h3 className="text-xl lg:text-2xl font-geist font-light tracking-tighter text-white leading-tight">Robot-Generated<br/>Science IP.</h3>
                <span className="w-10 h-10 rounded-full bg-white/20 text-white/40 flex flex-shrink-0 items-center justify-center">
                  <iconify-icon icon="solar:arrow-right-up-linear" class="text-lg"></iconify-icon>
                </span>
              </div>
            </div>
          </div>

          <div data-dir="right" data-tilt className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 flex-1 overflow-hidden min-h-[250px] cursor-not-allowed opacity-75 shadow-[0_10px_20px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-[1px] rounded-[calc(2rem-1px)] overflow-hidden z-0 bg-gradient-to-br from-zinc-900 to-black">
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_70%,rgba(0,245,255,0.35),transparent_55%)]"></div>
            </div>
            <FleetAnim />
            <div className="relative z-10 h-full p-7 flex flex-col justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-max">
                <iconify-icon icon="solar:cpu-bolt-linear" class="text-cyan-300 text-sm"></iconify-icon>
                <span className="text-xs font-normal text-white font-geist">Pillar 4 · elizaOS v2</span>
              </div>
              <div className="flex justify-between items-end gap-4">
                <h3 className="text-xl lg:text-2xl font-geist font-light tracking-tighter text-white leading-tight">Autonomous<br/>Agent Fleet.</h3>
                <span className="w-10 h-10 rounded-full bg-white/20 text-white/40 flex flex-shrink-0 items-center justify-center">
                  <iconify-icon icon="solar:arrow-right-up-linear" class="text-lg"></iconify-icon>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
