import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined' && !gsap.core.globals().ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Reveal on scroll ---------------- */
export function revealOnScroll(container, selector = '[data-anim]', opts = {}) {
  if (!container) return () => {};
  const els = container.querySelectorAll(selector);
  if (!els.length) return () => {};
  if (reduced()) {
    gsap.set(els, { opacity: 1, y: 0, scale: 1, filter: 'blur(0)' });
    return () => {};
  }
  gsap.set(els, { opacity: 0, y: opts.y ?? 60, scale: opts.scale ?? 0.96, filter: 'blur(8px)' });
  const tween = gsap.to(els, {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    duration: opts.duration ?? 1.1,
    ease: 'expo.out',
    stagger: opts.stagger ?? 0.09,
    scrollTrigger: {
      trigger: container,
      start: opts.start ?? 'top 82%',
      toggleActions: 'play none none reverse',
    },
  });
  return () => { tween.scrollTrigger?.kill(); tween.kill(); };
}

/* ---------------- 3D tilt + cursor glare ---------------- */
export function attachTilt(el, max = 8) {
  if (!el || reduced()) return () => {};
  el.style.transformStyle = 'preserve-3d';
  el.style.transition = 'transform 220ms cubic-bezier(.2,.8,.2,1)';
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
    el.style.setProperty('--mx', `${(e.clientX - r.left)}px`);
    el.style.setProperty('--my', `${(e.clientY - r.top)}px`);
  };
  const onLeave = () => { el.style.transform = 'perspective(900px) rotateX(0) rotateY(0)'; };
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  return () => {
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
  };
}

/* ---------------- Parallax (scrubbed) ---------------- */
export function parallax(el, distance = 80) {
  if (!el || reduced()) return () => {};
  const tween = gsap.fromTo(el, { y: distance }, {
    y: -distance, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
  });
  return () => { tween.scrollTrigger?.kill(); tween.kill(); };
}

export function floatIdle(el, opts = {}) {
  if (!el || reduced()) return () => {};
  const tween = gsap.to(el, {
    y: opts.y ?? -8, duration: opts.duration ?? 3.5,
    ease: 'sine.inOut', yoyo: true, repeat: -1,
  });
  return () => tween.kill();
}

/* ---------------- Split words helper ---------------- */
export function splitWords(el) {
  if (!el) return [];
  const text = el.textContent;
  const words = text.split(/(\s+)/);
  el.textContent = '';
  const spans = [];
  words.forEach((w) => {
    if (/\s+/.test(w)) {
      el.appendChild(document.createTextNode(w));
    } else {
      const wrap = document.createElement('span');
      wrap.style.display = 'inline-block';
      wrap.style.overflow = 'hidden';
      wrap.style.verticalAlign = 'bottom';
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.willChange = 'transform,opacity,filter';
      inner.textContent = w;
      wrap.appendChild(inner);
      el.appendChild(wrap);
      spans.push(inner);
    }
  });
  return spans;
}

/* ---------------- Count up numbers ---------------- */
export function countUp(el, target, format = (v) => Math.round(v).toLocaleString(), trigger) {
  if (!el) return () => {};
  if (reduced()) { el.textContent = format(target); return () => {}; }
  const obj = { v: 0 };
  const tween = gsap.to(obj, {
    v: target,
    duration: 2,
    ease: 'power3.out',
    onUpdate: () => { el.textContent = format(obj.v); },
    scrollTrigger: { trigger: trigger || el, start: 'top 85%', toggleActions: 'play none none reverse' },
  });
  return () => { tween.scrollTrigger?.kill(); tween.kill(); };
}

/* ---------------- Magnetic cursor pull ---------------- */
export function magneticCursor(el, strength = 0.35, radius = 90) {
  if (!el || reduced()) return () => {};
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < radius * 2) {
      gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power3.out' });
    } else {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    }
  };
  const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
  window.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', onLeave);
  return () => {
    window.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', onLeave);
  };
}

/* ---------------- Liquid hover (radial follow) ---------------- */
export function liquidHover(el) {
  if (!el) return () => {};
  const onMove = (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--lx', `${e.clientX - r.left}px`);
    el.style.setProperty('--ly', `${e.clientY - r.top}px`);
  };
  el.addEventListener('mousemove', onMove);
  return () => el.removeEventListener('mousemove', onMove);
}

export { gsap, ScrollTrigger };
