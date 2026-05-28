import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from '../lib/animations';
import { useWallet } from './WalletContext';

export default function Hero() {
  const canvasRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const ctaRef = useRef(null);
  const { wallet, setOpen } = useWallet();
  const short = wallet?.address
    ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}`
    : null;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `attribute vec4 aVertexPosition; void main(){ gl_Position = aVertexPosition; }`;
    const fsSource = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 p = uv * 2.0 - 1.0;
          p.x *= u_resolution.x / u_resolution.y;
          p.y += 0.8;
          float radius = 1.6;
          float thickness = 0.5;
          float r = length(p);
          float a = atan(p.y, p.x);
          float dist = abs(r - radius);
          float warp = sin(r * 4.0 - u_time * 0.5) * 0.3;
          float lines = sin((a + warp) * 80.0 + u_time * 2.0);
          lines = smoothstep(0.85, 1.0, lines);
          float mask = smoothstep(thickness, 0.0, dist);
          float coreGlow = 0.05 / (dist * dist + 0.05);
          float intensity = lines * mask * 2.5 + coreGlow * 1.2;
          intensity *= smoothstep(1.5, -0.5, p.y);
          intensity *= smoothstep(3.0, 1.0, r);
          vec3 finalColor = vec3(1.0) - vec3(intensity);
          gl_FragColor = vec4(finalColor, 1.0);
      }`;

    function loadShader(type, source) {
      const s = gl.createShader(type);
      gl.shaderSource(s, source); gl.compileShader(s); return s;
    }
    const program = gl.createProgram();
    gl.attachShader(program, loadShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, loadShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);

    const positions = new Float32Array([-1,1, 1,1, -1,-1, 1,-1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const vp = gl.getAttribLocation(program, 'aVertexPosition');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const timeLoc = gl.getUniformLocation(program, 'u_time');
    let raf, start = Date.now();
    const render = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0,0,w,h); }
      gl.clearColor(1,1,1,1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(vp, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vp);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, (Date.now() - start) * 0.001);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(render);
    };
    render();
    return () => { cancelAnimationFrame(raf); gl.deleteProgram(program); };
  }, []);

  // Kinetic headline + cascade
  useEffect(() => {
    const headline = headlineRef.current;
    if (!headline) return;
    const text = headline.dataset.text || headline.textContent;
    headline.textContent = '';
    const letters = [];
    const gradient = 'linear-gradient(to bottom, rgb(0,0,0) 0%, rgb(0,0,0) 60%, rgba(161,161,170,0.6) 100%)';
    for (const ch of text) {
      const wrap = document.createElement('span');
      wrap.style.display = 'inline-block';
      wrap.style.overflow = 'hidden';
      wrap.style.verticalAlign = 'bottom';
      const inner = document.createElement('span');
      inner.style.display = 'inline-block';
      inner.style.willChange = 'transform,opacity,filter';
      // Re-apply the clipped gradient on each letter (parent's bg-clip is lost on children)
      inner.style.backgroundImage = gradient;
      inner.style.webkitBackgroundClip = 'text';
      inner.style.backgroundClip = 'text';
      inner.style.color = 'transparent';
      inner.style.webkitTextFillColor = 'transparent';
      inner.textContent = ch === ' ' ? '\u00A0' : ch;
      wrap.appendChild(inner);
      headline.appendChild(wrap);
      letters.push(inner);
    }
    gsap.set(letters, { yPercent: 130, opacity: 0, skewY: 6, filter: 'blur(10px)' });
    gsap.set([subRef.current, ctaRef.current], { opacity: 0, y: 24 });

    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(letters, {
      yPercent: 0, opacity: 1, skewY: 0, filter: 'blur(0px)',
      duration: 1.1, ease: 'expo.out', stagger: 0.06,
    })
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5');

    // Breathing scale on headline (subtle)
    const breathe = gsap.to(headline, {
      scale: 1.012, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1,
      transformOrigin: 'center bottom',
    });

    return () => { tl.kill(); breathe.kill(); };
  }, []);

  return (
    <div className="relative w-full max-w-[1400px] min-h-[600px] md:min-h-0 md:aspect-[4/3] max-h-[70vh] bg-white rounded-[2rem] border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"></canvas>

      <div className="relative z-10 flex flex-col h-full w-full p-6 md:p-10 pointer-events-none">
        <main className="flex-1 flex flex-col items-center justify-center md:justify-end pb-4 md:pb-12 pointer-events-auto text-center">
          <div className="flex items-end justify-center mb-4 w-full">
            <h1
              ref={headlineRef}
              data-text="Synapse"
              className="text-[15vw]  md:text-[11rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-black via-black to-zinc-400/60 font-geist font-light tracking-tighter text-center will-change-transform"
            >
              Synapse
            </h1>
          </div>

          <p ref={subRef} className="text-zinc-700 text-center max-w-xl text-sm md:text-lg leading-relaxed font-geist px-2 mx-auto">
            The on-chain intelligence and attestation layer for the physical AI era — connecting aerial physical intelligence, robotic training data and autonomous system outputs to cryptographically verified IP on Base.
          </p>

          <div ref={ctaRef} className="mt-8 flex flex-col items-center gap-2">
            {wallet ? (
              <>
                <Link to="/hypothesis-lab" className="bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-300 tracking-tight font-geist">
                  Commit a Hypothesis
                </Link>
                <span className="text-xs text-zinc-500 font-mono">{short}</span>
              </>
            ) : (
              <button onClick={() => setOpen(true)} className="bg-black text-white px-6 py-3.5 rounded-full text-sm font-medium hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all duration-300 tracking-tight font-geist">
                Connect Wallet
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
