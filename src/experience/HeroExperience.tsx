import { useEffect, useRef, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import Lenis from 'lenis';
import gsap from 'gsap';
import Scene from './Scene';
import type { Progress } from './Scene';
import './experience.css';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export default function HeroExperience() {
  const progress = useRef<Progress>({ current: 0 }).current;

  const act1Ref = useRef<HTMLDivElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);
  const act3Ref = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const quality: 'high' | 'low' =
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'low' : 'high';

  useEffect(() => {
    const setEl = (el: HTMLElement | null, opacity: number, ty: number) => {
      if (!el) return;
      el.style.opacity = String(opacity);
      el.style.transform = `translate3d(-50%, calc(-50% + ${ty}px), 0)`;
    };

    const update = (p: number) => {
      const a1 = 1 - smoothstep(0.16, 0.28, p);
      const a2 = Math.min(smoothstep(0.33, 0.42, p), 1 - smoothstep(0.56, 0.66, p));
      const a3 = smoothstep(0.72, 0.82, p);
      setEl(act1Ref.current, a1, (1 - a1) * -26);
      setEl(act2Ref.current, a2, (1 - a2) * 26);
      setEl(act3Ref.current, a3, (1 - a3) * 26);
      if (cueRef.current) cueRef.current.style.opacity = String(1 - smoothstep(0.02, 0.08, p));
      if (barRef.current) barRef.current.style.width = (p * 100).toFixed(2) + '%';
    };

    update(0);

    const docEl = document.documentElement;
    const prevScrollBehavior = docEl.style.scrollBehavior;
    docEl.style.scrollBehavior = 'auto'; // let Lenis (or native) own the scroll

    // Reduced motion: skip smoothing + entrance, drive progress from native scroll.
    if (reducedMotion) {
      const onScroll = () => {
        const max = docEl.scrollHeight - window.innerHeight;
        const p = max > 0 ? window.scrollY / max : 0;
        progress.current = p;
        update(p);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener('scroll', onScroll);
        docEl.style.scrollBehavior = prevScrollBehavior;
      };
    }

    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', () => {
      const p = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
      progress.current = p;
      update(p);
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Entrance choreography for the opening act.
    const ctx = gsap.context(() => {
      gsap.from('.dp-exp__act--1 .dp-exp__line', {
        yPercent: 120,
        opacity: 0,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.15,
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      ctx.revert();
      docEl.style.scrollBehavior = prevScrollBehavior;
    };
  }, [progress, reducedMotion]);

  return (
    <div className="dp-exp">
      <div className="dp-exp__viewport">
        <Canvas
          className="dp-exp__canvas"
          shadows
          dpr={[1, quality === 'high' ? 1.8 : 1.3]}
          camera={{ position: [-1.1, 3, 7.1], fov: 42 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <Scene progress={progress} quality={quality} reducedMotion={reducedMotion} />
          </Suspense>
        </Canvas>

        <div className="dp-exp__vignette" />

        <header className="dp-exp__bar">
          <Link to="/" className="dp-exp__back">&larr; Back to site</Link>
          <span className="dp-exp__tag">DezignPool &middot; Experience &mdash; proof of concept</span>
        </header>

        <div className="dp-exp__progress">
          <span ref={barRef} />
        </div>

        <div ref={act1Ref} className="dp-exp__act dp-exp__act--1">
          <p className="dp-exp__eyebrow">
            <span className="dp-exp__line">Bangalore &middot; Architecture &amp; Interiors</span>
          </p>
          <h1 className="dp-exp__title">
            <span className="dp-exp__line">Not Just Spaces,</span>
            <br />
            <span className="dp-exp__line">
              <em>Living Masterpieces</em>
            </span>
          </h1>
          <p className="dp-exp__sub">
            <span className="dp-exp__line">Scroll to watch it come together.</span>
          </p>
        </div>

        <div ref={act2Ref} className="dp-exp__act">
          <h2 className="dp-exp__title">
            Every detail considered,
            <br />
            <em>assembled around you.</em>
          </h2>
        </div>

        <div ref={act3Ref} className="dp-exp__act">
          <h2 className="dp-exp__title">
            Your space, <em>realized.</em>
          </h2>
          <Link to="/discover" className="dp-exp__cta">
            Step Inside &rarr;
          </Link>
        </div>

        <div ref={cueRef} className="dp-exp__cue" aria-hidden="true">
          <span />
        </div>
      </div>

      <div className="dp-exp__spacer" />
    </div>
  );
}
