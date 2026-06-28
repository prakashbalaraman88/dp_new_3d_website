import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Warm light raking across like sun through a window, with floating dust motes.
export default function SunlitRoom() {
  const reduce = useReducedMotion();
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        s: 1 + Math.random() * 2.5,
        dur: 9 + Math.random() * 10,
        delay: Math.random() * 8,
      })),
    [],
  );

  return (
    <>
      <div
        className="absolute -top-[20%] -left-[10%] h-[95vw] w-[95vw] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(255,214,150,0.30), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-[10%] -right-[10%] h-[60vw] w-[60vw] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(146,161,136,0.18), transparent 70%)' }}
      />
      <motion.div
        className="absolute inset-[-35%]"
        style={{
          background:
            'repeating-linear-gradient(118deg, transparent 0, transparent 64px, rgba(255,226,172,0.05) 84px, rgba(255,226,172,0.10) 98px, rgba(255,226,172,0.05) 112px, transparent 134px)',
        }}
        animate={reduce ? undefined : { x: [0, 46, 0], opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      {!reduce &&
        motes.map((m, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.s, height: m.s, background: 'rgba(255,232,186,0.6)' }}
            animate={{ y: [0, -34, 0], opacity: [0, 0.75, 0] }}
            transition={{ duration: m.dur, repeat: Infinity, ease: 'easeInOut', delay: m.delay }}
          />
        ))}
    </>
  );
}
