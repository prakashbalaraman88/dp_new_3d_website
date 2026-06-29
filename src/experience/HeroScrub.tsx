import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import './experience.css';

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * Scroll-scrubbed video hero. Calls onComplete once the user scrolls to the end,
 * so a parent can transition straight into the discovery quiz.
 */
export default function HeroScrub({ onComplete }: { onComplete: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const act1Ref = useRef<HTMLDivElement>(null);
  const act2Ref = useRef<HTMLDivElement>(null);
  const act3Ref = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(false);

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const videoSrc = isMobile ? '/videos/kitchen-mobile.mp4' : '/videos/kitchen-desktop.mp4';
  const posterSrc = isMobile ? '/videos/kitchen-mobile-poster.jpg' : '/videos/kitchen-desktop-poster.jpg';

  useEffect(() => {
    const video = videoRef.current;
    let duration = 0;
    let lastP = 0;
    window.scrollTo(0, 0);

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
    const scrub = (p: number) => {
      if (video && duration > 0) video.currentTime = Math.min(duration - 0.01, Math.max(0, p * duration));
    };
    const maybeComplete = (p: number) => {
      if (!doneRef.current && p >= 0.99) {
        doneRef.current = true;
        onComplete();
      }
    };

    update(0);

    // Fade in the video once the browser has decoded the first frame.
    const onLoaded = () => {
      if (video) {
        video.style.transition = 'opacity 0.6s ease';
        video.style.opacity = '1';
      }
    };
    if (video) {
      video.style.opacity = '0';
      if (video.readyState >= 3) {
        onLoaded();
      } else {
        video.addEventListener('loadeddata', onLoaded, { once: true });
      }
    }

    const onMeta = () => {
      duration = video?.duration || 0;
      scrub(reducedMotion ? 1 : lastP);
    };
    if (video) {
      video.muted = true;
      if (video.readyState >= 1) onMeta();
      else video.addEventListener('loadedmetadata', onMeta);
    }

    const docEl = document.documentElement;
    const prevScrollBehavior = docEl.style.scrollBehavior;
    docEl.style.scrollBehavior = 'auto';

    if (reducedMotion) {
      const onScroll = () => {
        const max = docEl.scrollHeight - window.innerHeight;
        lastP = max > 0 ? window.scrollY / max : 0;
        update(lastP);
        maybeComplete(lastP);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener('scroll', onScroll);
        if (video) {
          video.removeEventListener('loadedmetadata', onMeta);
          video.removeEventListener('loadeddata', onLoaded);
        }
        docEl.style.scrollBehavior = prevScrollBehavior;
      };
    }

    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', () => {
      lastP = lenis.limit > 0 ? lenis.scroll / lenis.limit : 0;
      update(lastP);
      maybeComplete(lastP);
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      if (video && duration > 0 && !video.seeking) {
        const target = Math.min(duration - 0.05, Math.max(0, lastP * duration));
        if (Math.abs(video.currentTime - target) > 0.02) video.currentTime = target;
      }
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
      if (video) {
        video.removeEventListener('loadedmetadata', onMeta);
        video.removeEventListener('loadeddata', onLoaded);
      }
      docEl.style.scrollBehavior = prevScrollBehavior;
    };
  }, [reducedMotion, onComplete]);

  return (
    <div className="dp-exp">
      <div className="dp-exp__viewport">
        {/* Poster image: always visible, video fades over it once decoded */}
        <img
          src={posterSrc}
          alt=""
          aria-hidden="true"
          className="dp-exp__canvas dp-vid__video"
          style={{ objectFit: 'cover' }}
        />
        <video
          ref={videoRef}
          className="dp-exp__canvas dp-vid__video"
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          style={{ opacity: 0 }}
        />

        <div className="dp-vid__scrim" />
        <div className="dp-exp__vignette" />

        <header className="dp-exp__bar" style={{ justifyContent: 'center' }}>
          <img
            src="/assets/images/logo.png"
            alt="DezignPool"
            className="h-20 sm:h-24 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 2px 12px rgba(0,0,0,0.55))' }}
          />
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
            Now, <em>let&rsquo;s design yours.</em>
          </h2>
          <p className="dp-exp__sub">
            <span className="dp-exp__line">Keep scrolling &rarr;</span>
          </p>
        </div>

        <div ref={cueRef} className="dp-exp__cue" aria-hidden="true">
          <span />
        </div>
      </div>

      <div className="dp-exp__spacer" />
    </div>
  );
}
