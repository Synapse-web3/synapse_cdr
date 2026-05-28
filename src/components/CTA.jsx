import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger, splitWords, liquidHover } from '../lib/animations';

export default function CTA() {
  const rootRef = useRef(null);
  const cardRef = useRef(null);
  const headlineRef = useRef(null);
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);
  const gridRef = useRef(null);
  const subRef = useRef(null);
  const btnsRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cleans = [];

    // Split headline into words
    const words = splitWords(headlineRef.current);
    gsap.set(words, { yPercent: 130, rotate: 8, opacity: 0 });
    gsap.set(subRef.current, { opacity: 0, y: 30 });
    gsap.set(btnsRef.current, { opacity: 0, y: 30 });
    gsap.set(cardRef.current, { opacity: 0, scale: 0.96, y: 60 });

    // Pinned timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top 70%',
        end: '+=600',
        scrub: 0.6,
        pin: false,
      },
    });
    tl.to(cardRef.current, { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out' })
      .to(words, { yPercent: 0, rotate: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.12 }, '-=0.4')
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3')
      .to(btnsRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.3');
    cleans.push(() => { tl.scrollTrigger?.kill(); tl.kill(); });

    // Parallax blobs + grid scale (scrubbed across whole card transit)
    const blobTl = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    blobTl
      .fromTo(blob1Ref.current, { x: -120, y: -40 }, { x: 120, y: 40, ease: 'none' }, 0)
      .fromTo(blob2Ref.current, { x: 120, y: 40 }, { x: -120, y: -40, ease: 'none' }, 0)
      .fromTo(gridRef.current, { scale: 0.95 }, { scale: 1.1, ease: 'none' }, 0);
    cleans.push(() => { blobTl.scrollTrigger?.kill(); blobTl.kill(); });

    // Liquid hover on buttons
    root.querySelectorAll('[data-liquid]').forEach((b) => cleans.push(liquidHover(b)));

    return () => cleans.forEach((f) => f());
  }, []);

  return (
    <div ref={rootRef} className="w-full max-w-[1200px] mx-auto px-6 py-12 z-10 relative">
      <div ref={cardRef} className="relative rounded-[3rem] p-[1px] bg-gradient-to-b from-black/40 via-black/20 to-black/80 overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.2)] group will-change-transform">
        <div className="absolute inset-[1px] rounded-[calc(3rem-1px)] z-0 bg-gradient-to-br from-zinc-900 via-zinc-900 to-black overflow-hidden">
          <div ref={blob1Ref} className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none will-change-transform"></div>
          <div ref={blob2Ref} className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-pink-500/15 blur-[100px] rounded-full pointer-events-none will-change-transform"></div>
          <div ref={gridRef} className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] will-change-transform"></div>
        </div>

        <div className="relative z-10 p-12 md:p-24 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-xs font-medium text-white uppercase tracking-widest">Base Mainnet · Live</span>
          </div>

          <h2
            ref={headlineRef}
            className="text-4xl md:text-[5rem] lg:text-[6rem] leading-[1.05] text-white font-thin tracking-tighter font-geist"
          >
            Commit. Fly. Mint.
          </h2>

          <p ref={subRef} className="text-zinc-300 max-w-xl text-lg md:text-xl font-light">
            Commit a hypothesis on-chain, dispatch a drone or robot mission, earn an IP-NFT when PoPW verifies the result.
          </p>

          <div ref={btnsRef} className="flex flex-col sm:flex-row gap-4 mt-8 w-full sm:w-auto">
            <Link to="/hypothesis-lab" data-liquid className="relative overflow-hidden bg-white px-8 py-4 rounded-full text-base font-medium tracking-tight flex justify-center items-center gap-2 text-black hover:bg-white/90 transition-colors">
              <span className="relative z-10">Open Hypothesis Lab</span>
              <iconify-icon icon="solar:arrow-right-up-linear" class="text-xl relative z-10"></iconify-icon>
            </Link>
            <Link to="/labs" data-liquid className="relative overflow-hidden bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full text-base font-medium tracking-tight flex justify-center items-center gap-2 hover:bg-white/20 transition-colors">
              <span className="relative z-10">Open Mission Control</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
