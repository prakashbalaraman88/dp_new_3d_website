import { useEffect, useRef, type ImgHTMLAttributes } from 'react';
import gsap from 'gsap';

type RotatingBrandMarkProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  rotationProgress?: number;
  turns?: number;
};

/**
 * The current DezignPool symbol. It follows controlled journey progress when
 * provided (hero chapters / quiz steps), otherwise it follows document scroll.
 */
export default function RotatingBrandMark({
  alt = 'DezignPool',
  className = '',
  rotationProgress,
  style,
  turns = 2,
  ...props
}: RotatingBrandMarkProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const controlledTweenRef = useRef<gsap.core.Tween | null>(null);
  const isControlled = rotationProgress !== undefined;

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      gsap.set(image, {
        rotation: isControlled && !reduceMotion
          ? gsap.utils.clamp(0, 1, rotationProgress ?? 0) * turns * 360
          : 0,
        transformOrigin: '50% 50%',
        force3D: true,
      });
    }, image);

    if (reduceMotion || isControlled) {
      return () => context.revert();
    }

    const rotationTween = gsap.to(image, {
      rotation: turns * 360,
      ease: 'none',
      paused: true,
    });

    const updateRotation = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      rotationTween.progress(gsap.utils.clamp(0, 1, window.scrollY / maxScroll));
    };

    updateRotation();
    window.addEventListener('scroll', updateRotation, { passive: true });
    window.addEventListener('resize', updateRotation);

    return () => {
      window.removeEventListener('scroll', updateRotation);
      window.removeEventListener('resize', updateRotation);
      rotationTween.kill();
      context.revert();
    };
  }, [isControlled, turns]);

  useEffect(() => {
    const image = imageRef.current;
    if (
      !image ||
      !isControlled ||
      rotationProgress === undefined ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;

    controlledTweenRef.current?.kill();
    controlledTweenRef.current = gsap.to(image, {
      rotation: gsap.utils.clamp(0, 1, rotationProgress) * turns * 360,
      duration: 0.85,
      ease: 'power3.inOut',
      overwrite: 'auto',
    });

    return () => {
      controlledTweenRef.current?.kill();
      controlledTweenRef.current = null;
    };
  }, [isControlled, rotationProgress, turns]);

  return (
    <img
      ref={imageRef}
      src="/assets/images/dezignpool-split-ribbon.png"
      alt={alt}
      width={2048}
      height={2048}
      loading="eager"
      decoding="async"
      className={className}
      style={{ transformOrigin: '50% 50%', willChange: 'transform', ...style }}
      {...props}
    />
  );
}
