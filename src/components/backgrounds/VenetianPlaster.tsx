import { motion, useReducedMotion } from 'framer-motion';

// Warm limewash / Venetian-plaster wall with soft mottling and a raking light wash.
export default function VenetianPlaster() {
  const reduce = useReducedMotion();
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(130% 120% at 50% 0%, #3a3631 0%, #2a2825 42%, #1b1a18 100%)' }} />
      <svg className="absolute inset-0 h-full w-full opacity-50 mix-blend-soft-light" aria-hidden="true">
        <filter id="dpPlaster">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="7" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#dpPlaster)" />
      </svg>
      <motion.div
        className="absolute top-0 left-0 h-full w-[55%]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,224,178,0.13) 45%, rgba(255,224,178,0.06) 62%, transparent)', willChange: 'transform' }}
        animate={reduce ? undefined : { x: ['-110%', '210%', '-110%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute -bottom-[10%] left-1/2 h-[40vw] w-[120vw] -translate-x-1/2 blur-[80px]"
        style={{ background: 'radial-gradient(ellipse, rgba(224,180,120,0.14), transparent 70%)' }}
      />
    </>
  );
}
