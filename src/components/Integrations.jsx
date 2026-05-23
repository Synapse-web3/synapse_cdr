import { useEffect, useRef } from 'react';
import RevealText from './RevealText';
import { gsap } from '../lib/animations';

const stack = [
  { icon: 'simple-icons:base', label: 'Base', color: 'text-[#0052FF]' },
  { icon: 'simple-icons:ethereum', label: 'Solidity', color: 'text-[#627EEA]' },
  { icon: 'simple-icons:react', label: 'React 19', color: 'text-[#61DAFB]' },
  { icon: 'simple-icons:nextdotjs', label: 'Next.js 15', color: 'text-black' },
  { icon: 'simple-icons:typescript', label: 'TypeScript', color: 'text-[#3178C6]' },
  { icon: 'simple-icons:mapbox', label: 'Mapbox GL', color: 'text-black' },
  { icon: 'simple-icons:ros', label: 'ROS 2', color: 'text-[#22314E]' },
  { icon: 'simple-icons:metamask', label: 'MetaMask', color: 'text-[#F6851B]' },
];

export default function Integrations() {
  const rootRef = useRef(null);
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    requestAnimationFrame(() => {
      const halfWidth = track.scrollWidth / 2;
      gsap.set(track, { x: 0 });
      tweenRef.current = gsap.to(track, {
        x: -halfWidth,
        duration: 30,
        ease: 'none',
        repeat: -1,
        modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % halfWidth) },
      });
    });

    const onEnter = () => tweenRef.current && gsap.to(tweenRef.current, { timeScale: 0.2, duration: 0.4 });
    const onLeave = () => tweenRef.current && gsap.to(tweenRef.current, { timeScale: 1, duration: 0.6 });
    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);

    return () => {
      tweenRef.current?.kill();
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const items = [...stack, ...stack];

  return (
    <div ref={rootRef} className="w-full max-w-[1400px] mx-auto px-6 py-12 z-10 relative">
      <div className="flex flex-col items-center text-center mb-12 max-w-[1200px] mx-auto">
        <RevealText
          text="Production-Grade Stack."
          className="text-4xl md:text-[4rem] leading-[1.05] text-black font-thin tracking-tighter mb-4"
        />
        <p className="text-lg text-zinc-600 font-geist font-light max-w-2xl">
          EVM contracts on Base · elizaOS v2 agents · viem + wagmi · Flypraxis &amp; ROBA Labs SDKs · x402 micropayments · ERC-2981 royalties.
        </p>
      </div>

      <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div ref={trackRef} className="flex items-center gap-14 md:gap-20 w-max py-6 will-change-transform">
          {items.map((s, i) => (
            <div
              key={`${s.label}-${i}`}
              className="flex items-center gap-3 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer flex-shrink-0"
            >
              <iconify-icon icon={s.icon} width="32" class={s.color}></iconify-icon>
              <span className="text-black font-medium tracking-tight text-lg md:text-xl whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
