import { motion, useReducedMotion } from 'framer-motion';

// Nested golden archways receding toward a warm vanishing-point glow.
function arch(cx: number, w: number, top: number, baseY: number) {
  const x1 = cx - w / 2;
  const x2 = cx + w / 2;
  const r = w / 2;
  return `M${x1},${baseY} L${x1},${top + r} A${r},${r} 0 0 1 ${x2},${top + r} L${x2},${baseY}`;
}

const ARCHES = [
  { w: 620, top: 120, op: 0.16 },
  { w: 470, top: 230, op: 0.24 },
  { w: 340, top: 330, op: 0.34 },
  { w: 230, top: 420, op: 0.44 },
];

export default function Arches() {
  const reduce = useReducedMotion();
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(62% 52% at 50% 42%, #2b302e 0%, #181c1d 55%, #0e1112 100%)' }} />
      <motion.div
        className="absolute left-1/2 top-[42%] h-[36vw] w-[36vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
        style={{ background: 'radial-gradient(circle, rgba(224,180,120,0.32), transparent 70%)' }}
        animate={reduce ? undefined : { opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />
      <svg viewBox="0 0 700 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <motion.g
          style={{ transformOrigin: '50% 42%' }}
          animate={reduce ? undefined : { scale: [1, 1.015, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          {ARCHES.map((a, i) => (
            <path key={i} d={arch(350, a.w, a.top, 1000)} fill="none" stroke={`rgba(212,175,55,${a.op})`} strokeWidth="1.6" />
          ))}
        </motion.g>
      </svg>
    </>
  );
}
