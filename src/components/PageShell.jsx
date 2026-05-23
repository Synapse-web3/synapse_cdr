import RevealText from './RevealText';

export default function PageShell({ eyebrow, title, intro, children, actions }) {
  return (
    <div className="w-full max-w-[1200px] mx-auto px-6 pt-32 pb-16 flex flex-col gap-12">
      <header className="flex flex-col items-start gap-5 max-w-3xl">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-black/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-medium text-zinc-700 uppercase tracking-widest">{eyebrow}</span>
          </div>
        )}
        <RevealText
          text={title}
          className="text-4xl md:text-[4rem] leading-[1.05] text-black font-thin tracking-tighter"
        />
        {intro && <p className="text-zinc-600 text-base md:text-lg font-light leading-relaxed">{intro}</p>}
        {actions && <div className="flex flex-wrap gap-3 mt-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function Card({ children, className = '', dark = false, id }) {
  return (
    <div id={id} className={`relative rounded-2xl p-[1px] overflow-hidden ${dark ? 'bg-gradient-to-b from-black/40 via-black/20 to-black/80 shadow-[0_12px_30px_rgba(0,0,0,0.2)]' : 'bg-gradient-to-b from-black/15 to-black/5'} ${className}`}>
      <div className={`absolute inset-[1px] rounded-[calc(1rem-1px)] z-0 ${dark ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-black' : 'bg-white'}`}></div>
      <div className="relative z-10 p-6">{children}</div>
    </div>
  );
}

export function GradePill({ grade }) {
  const map = {
    A: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30',
    B: 'bg-sky-500/15 text-sky-700 border-sky-500/30',
    C: 'bg-amber-500/15 text-amber-700 border-amber-500/30',
    D: 'bg-orange-500/15 text-orange-700 border-orange-500/30',
    X: 'bg-rose-500/15 text-rose-700 border-rose-500/30',
  };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-semibold ${map[grade] || map.C}`}>
      {grade}
    </span>
  );
}

export function DomainTag({ domain }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/10 text-[10px] uppercase tracking-widest text-zinc-700 font-medium">
      {domain}
    </span>
  );
}

export function StatusDot({ status }) {
  const map = {
    idle: 'bg-emerald-500',
    busy: 'bg-amber-500 animate-pulse',
    maintenance: 'bg-rose-500',
    online: 'bg-emerald-500',
    offline: 'bg-zinc-400',
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[status] || 'bg-zinc-400'}`}></span>;
}
