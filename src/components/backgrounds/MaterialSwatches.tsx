import { motion, useReducedMotion } from 'framer-motion';

// Soft-focus discs of real material tones drifting in parallax depth.
const SW = [
  { cls: 'top-[6%] left-[6%] h-[34vw] w-[34vw] blur-[52px]', c: 'rgba(107,79,47,0.55)', a: { x: [0, 44, 0], y: [0, -28, 0] }, d: 24 },
  { cls: 'top-[14%] right-[4%] h-[26vw] w-[26vw] blur-[42px]', c: 'rgba(233,227,212,0.50)', a: { x: [0, -30, 0], y: [0, 40, 0] }, d: 28 },
  { cls: 'top-[42%] left-[34%] h-[30vw] w-[30vw] blur-[48px]', c: 'rgba(201,162,75,0.50)', a: { x: [0, 40, 0], y: [0, 30, 0] }, d: 22 },
  { cls: 'bottom-[20%] left-[8%] h-[28vw] w-[28vw] blur-[46px]', c: 'rgba(146,161,136,0.50)', a: { x: [0, -38, 0], y: [0, -36, 0] }, d: 30 },
  { cls: 'bottom-[8%] right-[12%] h-[24vw] w-[24vw] blur-[42px]', c: 'rgba(168,103,76,0.50)', a: { x: [0, 30, 0], y: [0, 44, 0] }, d: 26 },
  { cls: 'top-[60%] right-[26%] h-[20vw] w-[20vw] blur-[38px]', c: 'rgba(216,199,168,0.50)', a: { x: [0, -46, 0], y: [0, 18, 0] }, d: 32 },
];

export default function MaterialSwatches() {
  const reduce = useReducedMotion();
  return (
    <>
      {SW.map((s, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${s.cls}`}
          style={{ background: `radial-gradient(circle, ${s.c}, transparent 72%)` }}
          animate={reduce ? undefined : s.a}
          transition={{ duration: s.d, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <motion.div
        className="absolute left-0 top-0 h-[55vw] w-[55vw] rounded-full blur-[70px]"
        style={{ background: 'radial-gradient(circle, rgba(255,236,200,0.12), transparent 70%)' }}
        animate={reduce ? undefined : { x: ['-10%', '120%', '40%', '-10%'], y: ['10%', '70%', '140%', '10%'] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}
