import { motion } from 'framer-motion';

/**
 * Bold, word-by-word reveal — each word rises + fades in one after another to
 * grab attention. `trigger="mount"` plays on mount; `trigger="inView"` plays
 * when scrolled into view.
 */
export default function KineticText({
  text,
  highlight = [],
  className = '',
  highlightClass = 'text-secondary',
  trigger = 'mount',
  delay = 0,
  stagger = 0.07,
}: {
  text: string;
  highlight?: string[];
  className?: string;
  highlightClass?: string;
  trigger?: 'mount' | 'inView';
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(' ');
  const hi = new Set(highlight.map((w) => w.toLowerCase()));
  const variants = {
    initial: { y: 18, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => {
        const clean = w.replace(/[.,!?;:’']/g, '').toLowerCase();
        const isHi = hi.has(clean);
        const trig =
          trigger === 'inView'
            ? { whileInView: 'show' as const, viewport: { once: true, amount: 0.5 } }
            : { animate: 'show' as const };
        return (
          <span key={i} className="inline-block" aria-hidden="true">
            <motion.span
              className={`inline-block ${isHi ? highlightClass : ''}`}
              variants={variants}
              initial="initial"
              {...trig}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: delay + i * stagger }}
            >
              {w}
              {i < words.length - 1 ? ' ' : ''}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
