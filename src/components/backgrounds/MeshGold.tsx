import { motion, useReducedMotion } from 'framer-motion';

// Bold, flowing mesh-gradient: gold / bronze / sage / amber blobs morphing.
const BLOBS = [
  { cls: '-top-[15%] -left-[10%] h-[65vw] w-[65vw] blur-[90px]', c: 'rgba(212,175,55,0.50)', anim: { x: [0, 80, -30, 0], y: [0, 60, -20, 0], scale: [1, 1.15, 0.95, 1] }, d: 20 },
  { cls: 'top-[8%] -right-[12%] h-[60vw] w-[60vw] blur-[90px]', c: 'rgba(176,122,42,0.45)', anim: { x: [0, -70, 30, 0], y: [0, 40, -40, 0], scale: [1, 0.9, 1.1, 1] }, d: 24 },
  { cls: '-bottom-[15%] left-[12%] h-[72vw] w-[72vw] blur-[100px]', c: 'rgba(146,161,136,0.42)', anim: { x: [0, 50, -50, 0], y: [0, -30, 30, 0], scale: [1, 1.1, 0.95, 1] }, d: 28 },
  { cls: 'top-[34%] left-[28%] h-[46vw] w-[46vw] blur-[80px]', c: 'rgba(224,162,60,0.40)', anim: { x: [0, -40, 40, 0], y: [0, 40, -30, 0], scale: [1, 1.12, 1, 1] }, d: 22 },
  { cls: 'bottom-[8%] right-[8%] h-[40vw] w-[40vw] blur-[80px]', c: 'rgba(40,55,51,0.55)', anim: { x: [0, 30, -30, 0], y: [0, -40, 20, 0] }, d: 26 },
];

export default function MeshGold() {
  const reduce = useReducedMotion();
  return (
    <>
      {BLOBS.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${b.cls}`}
          style={{ background: `radial-gradient(circle, ${b.c}, transparent 70%)` }}
          animate={reduce ? undefined : b.anim}
          transition={{ duration: b.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </>
  );
}
