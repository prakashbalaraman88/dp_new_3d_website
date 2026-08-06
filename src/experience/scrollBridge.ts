import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollBridge {
  readonly lenis: Lenis;
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Creates the journey's single smooth-scroll owner. Lenis continues to use the
 * document scroller, so ScrollTrigger needs updates but no scrollerProxy.
 */
export function createScrollBridge(): ScrollBridge | null {
  if (typeof window === 'undefined' || prefersReducedMotion()) return null;

  const lenis = new Lenis({ autoRaf: false, lerp: 0.09, smoothWheel: true });
  const updateScrollTrigger = () => ScrollTrigger.update();
  const tick = (time: number) => lenis.raf(time * 1000);
  let destroyed = false;

  lenis.on('scroll', updateScrollTrigger);
  gsap.ticker.add(tick);

  return {
    lenis,
    start() {
      if (!destroyed) lenis.start();
    },
    stop() {
      if (!destroyed) lenis.stop();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      gsap.ticker.remove(tick);
      lenis.off('scroll', updateScrollTrigger);
      lenis.destroy();
    },
  };
}

export { ScrollTrigger };
