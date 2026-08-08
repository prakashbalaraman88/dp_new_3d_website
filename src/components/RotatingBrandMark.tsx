import { useEffect, useRef, type HTMLAttributes } from 'react';
import gsap from 'gsap';

type RotatingBrandMarkProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
  alt?: string;
  rotationProgress?: number;
  turns?: number;
  expansion?: number;
};

type RibbonPart = {
  src: string;
  x: number;
  y: number;
  twist: number;
};

// Each transparent image occupies the same square canvas. At rest they lock
// together into the original mark; during rotation they travel radially away
// from the centre, opening the negative space without scaling the artwork.
const RIBBON_PARTS: RibbonPart[] = [
  { src: '/assets/images/dezignpool-mark-parts/ribbon-1.webp', x: -1, y: 0, twist: -1.15 },
  { src: '/assets/images/dezignpool-mark-parts/ribbon-2.webp', x: 1, y: 0, twist: 0.9 },
  { src: '/assets/images/dezignpool-mark-parts/ribbon-3.webp', x: 0.16, y: -0.99, twist: -0.75 },
  { src: '/assets/images/dezignpool-mark-parts/ribbon-4.webp', x: 0.83, y: 0.56, twist: 1.2 },
];

/**
 * The DezignPool mark behaves like a four-part mechanical assembly. It follows
 * controlled journey progress when provided (hero chapters / quiz steps),
 * otherwise it follows document scroll. The parts open only while the mark is
 * moving and re-lock as soon as it becomes stationary.
 */
export default function RotatingBrandMark({
  alt = 'DezignPool',
  className = '',
  expansion = 7.5,
  rotationProgress,
  style,
  turns = 2,
  ...props
}: RotatingBrandMarkProps) {
  const markRef = useRef<HTMLSpanElement>(null);
  const controlledTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const previousProgressRef = useRef<number | undefined>(undefined);
  const isControlled = rotationProgress !== undefined;

  useEffect(() => {
    const mark = markRef.current;
    if (!mark) return;

    const parts = Array.from(mark.querySelectorAll<HTMLImageElement>('[data-ribbon-part]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const initialRotation = isControlled && !reduceMotion
      ? gsap.utils.clamp(0, 1, rotationProgress ?? 0) * turns * 360
      : 0;

    const context = gsap.context(() => {
      gsap.set(mark, {
        rotation: initialRotation,
        transformOrigin: '50% 50%',
        force3D: true,
      });
      gsap.set(parts, {
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        transformOrigin: '50% 50%',
        force3D: true,
      });
    }, mark);

    if (reduceMotion || isControlled) {
      return () => context.revert();
    }

    const rotationTween = gsap.to(mark, {
      rotation: turns * 360,
      ease: 'none',
      paused: true,
    });
    let settleTimer: number | undefined;
    let lastScrollY = window.scrollY;

    const moveParts = (amount: number, duration: number, ease: string) => {
      gsap.to(parts, {
        xPercent: (index) => RIBBON_PARTS[index].x * expansion * amount,
        yPercent: (index) => RIBBON_PARTS[index].y * expansion * amount,
        rotation: (index) => RIBBON_PARTS[index].twist * amount,
        duration,
        ease,
        overwrite: 'auto',
        force3D: true,
      });
    };

    const updateRotation = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      rotationTween.progress(gsap.utils.clamp(0, 1, window.scrollY / maxScroll));
    };

    const onScroll = () => {
      const currentY = window.scrollY;
      const scrollDelta = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;
      updateRotation();

      // Slow scrolling gives a smaller opening; momentum scrolling engages the
      // full mechanism. Repeated events keep it open until motion stops.
      const activity = gsap.utils.clamp(0.45, 1, scrollDelta / 18);
      moveParts(activity, 0.18, 'power2.out');

      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        moveParts(0, 0.42, 'power3.inOut');
      }, 140);
    };

    updateRotation();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateRotation);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateRotation);
      if (settleTimer !== undefined) window.clearTimeout(settleTimer);
      rotationTween.kill();
      gsap.killTweensOf(parts);
      context.revert();
    };
  }, [expansion, isControlled, turns]);

  useEffect(() => {
    const mark = markRef.current;
    if (!mark || !isControlled || rotationProgress === undefined) {
      previousProgressRef.current = undefined;
      return;
    }

    const progress = gsap.utils.clamp(0, 1, rotationProgress);
    const previousProgress = previousProgressRef.current;
    previousProgressRef.current = progress;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Assemble silently on first render. Only a real progress change should
    // engage the mechanism.
    if (previousProgress === undefined || Math.abs(previousProgress - progress) < 0.0001) {
      return;
    }

    const parts = Array.from(mark.querySelectorAll<HTMLImageElement>('[data-ribbon-part]'));
    controlledTimelineRef.current?.kill();
    controlledTimelineRef.current = gsap.timeline({ defaults: { overwrite: 'auto' } })
      .addLabel('engage', 0)
      .to(mark, {
        rotation: progress * turns * 360,
        duration: 0.85,
        ease: 'power3.inOut',
      }, 'engage')
      .to(parts, {
        xPercent: (index) => RIBBON_PARTS[index].x * expansion,
        yPercent: (index) => RIBBON_PARTS[index].y * expansion,
        rotation: (index) => RIBBON_PARTS[index].twist,
        duration: 0.24,
        ease: 'power2.out',
        force3D: true,
      }, 'engage')
      .addLabel('relock', 0.47)
      .to(parts, {
        xPercent: 0,
        yPercent: 0,
        rotation: 0,
        duration: 0.38,
        ease: 'power3.inOut',
        force3D: true,
      }, 'relock');

    return () => {
      controlledTimelineRef.current?.kill();
      controlledTimelineRef.current = null;
    };
  }, [expansion, isControlled, rotationProgress, turns]);

  return (
    <span
      ref={markRef}
      role="img"
      aria-label={alt}
      className={className}
      style={{
        position: 'relative',
        display: 'block',
        aspectRatio: '1 / 1',
        transformOrigin: '50% 50%',
        willChange: 'transform',
        ...style,
      }}
      {...props}
    >
      {RIBBON_PARTS.map((part, index) => (
        <img
          key={part.src}
          data-ribbon-part={index + 1}
          src={part.src}
          alt=""
          aria-hidden="true"
          width={512}
          height={512}
          loading="eager"
          decoding="async"
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            transformOrigin: '50% 50%',
            willChange: 'transform',
          }}
        />
      ))}
    </span>
  );
}
