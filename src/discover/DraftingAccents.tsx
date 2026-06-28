import { motion } from 'framer-motion';

// Minimal, edge-only decoration: architect's corner marks + a small interior
// glyph tucked in a free corner. Nothing crosses the central content.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const drawn = (d: number) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: 1, opacity: 1 },
  transition: { duration: 0.8, ease: 'easeInOut' as const, delay: d },
});

const Ln = (p: { x1: number; y1: number; x2: number; y2: number; d: number }) => (
  <motion.line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} {...S} {...drawn(p.d)} />
);
const Pt = (p: { path: string; d: number }) => <motion.path d={p.path} {...S} {...drawn(p.d)} />;
const Rc = (p: { x: number; y: number; w: number; h: number; d: number }) => (
  <motion.rect x={p.x} y={p.y} width={p.w} height={p.h} rx={2} {...S} {...drawn(p.d)} />
);

function Bracket({ corner }: { corner: 'tr' | 'bl' }) {
  const map = {
    tr: { d: 'M2,2 L30,2 L30,30', pos: 'top-4 right-4' },
    bl: { d: 'M2,2 L2,30 L30,30', pos: 'bottom-7 left-4' },
  } as const;
  const { d, pos } = map[corner];
  return (
    <motion.svg
      viewBox="0 0 32 32"
      className={`absolute ${pos} h-8 w-8`}
      animate={{ opacity: [0.22, 0.45, 0.22] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.path d={d} {...S} {...drawn(0.15)} />
    </motion.svg>
  );
}

const GLYPH: Record<string, () => JSX.Element> = {
  kitchen: () => (
    <>
      <Pt path="M30,52 L70,52 L66,76 L34,76 Z" d={0.2} />
      <Ln x1={26} y1={52} x2={74} y2={52} d={0.45} />
      <Ln x1={50} y1={52} x2={50} y2={45} d={0.6} />
      <Ln x1={70} y1={58} x2={92} y2={54} d={0.7} />
    </>
  ),
  wardrobe: () => (
    <>
      <Pt path="M50,30 q9,0 9,9 q0,5 -7,7" d={0.2} />
      <Pt path="M50,46 L26,70 L74,70 Z" d={0.45} />
    </>
  ),
  wall: () => (
    <>
      <Rc x={28} y={26} w={44} h={40} d={0.2} />
      <Pt path="M34,58 L46,46 L56,54 L68,40" d={0.5} />
      <Pt path="M61,35 a3.5,3.5 0 1 0 0.1,0" d={0.7} />
    </>
  ),
  plan: () => (
    <>
      <Pt path="M50,24 L60,60 L50,52 L40,60 Z" d={0.2} />
      <Ln x1={36} y1={70} x2={64} y2={70} d={0.5} />
    </>
  ),
};

export default function DraftingAccents({ variant }: { variant: string }) {
  const glyph = GLYPH[variant] || GLYPH.plan;
  return (
    <div className="absolute inset-0 z-0 pointer-events-none text-secondary/75">
      <Bracket corner="tr" />
      <Bracket corner="bl" />
      <motion.div
        className="absolute bottom-7 right-5 h-16 w-16 text-secondary/60"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="h-full w-full">{glyph()}</svg>
      </motion.div>
    </div>
  );
}
