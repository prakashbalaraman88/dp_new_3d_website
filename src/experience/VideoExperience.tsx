import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Lenis from 'lenis';
import gsap from 'gsap';
import './experience.css';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

export default function VideoExperience() {
  const act1Ref = useRef<HTMLDivElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);
  const act3Ref = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile =
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const videoSrc = isMobile ? '/videos/kitchen-mobile.mp4' : '/videos/kitchen-desktop.mp4';
  const posterSrc = isMobile ? '/videos/kitchen-mobile-poster.jpg' : '/videos/kitchen-desktop-poster.jpg';

  useEffect(() => {
    let lastP = 0;

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
    docEl.style.scrollBehavior = 'auto';

    if (reducedMotion) {
      const onScroll = () => {
        const max = docEl.scrollHeight - window.innerHeight;
        lastP = max > 0 ? window.scrollY / max : 0;
        update(lastP);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener('scroll', onScroll);
        docEl.style.scrollBehavior = prevScrollBehavior;
      };
    }

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', () => {
      lastP = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
      update(lastP);
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

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
  }, [reducedMotion]);

  return (
    <div className="dp-exp">
      <div className="dp-exp__viewport">
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className="dp-exp__canvas dp-vid__video"
        />
        <video
          className="dp-exp__canvas dp-vid__video dp-vid__autoplay"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={(e) => {
            (e.currentTarget as HTMLVideoElement).style.opacity = '1';
          }}
        />

        <div className="dp-vid__scrim" />
        <div className="dp-exp__vignette" />

        <header className="dp-exp__bar">
          <Link to="/" className="dp-exp__back">&larr; Back to site</Link>
          <span className="dp-exp__tag">DezignPool &middot; Experience &mdash; video</span>
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
            <span className="dp-exp__line">Scroll to continue.</span>
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
