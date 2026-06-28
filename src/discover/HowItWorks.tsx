import { useRef } from 'react';
import { motion, useInView, useReducedMotion, useScroll } from 'framer-motion';

/* ---- Step icons: each loops a tiny animation that mimics the step's action ---- */

function ShareIcon({ active }: { active: boolean }) {
  // Mimics the quiz: a style card gets selected (gold ring + check).
  const cards = [9, 21, 33];
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 text-secondary" fill="none">
      {cards.map((x) => (
        <rect key={x} x={x} y={15} width={9} height={18} rx={2} stroke="currentColor" strokeWidth={1.4} strokeOpacity={0.4} />
      ))}
      <motion.rect
        x={20} y={14} width={11} height={20} rx={2.5} stroke="currentColor" strokeWidth={2}
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={active ? { opacity: [0, 1, 1, 1], scale: [0.7, 1.08, 1, 1] } : { opacity: 1, scale: 1 }}
        transition={active ? { duration: 2.6, times: [0, 0.25, 0.4, 1], repeat: Infinity, repeatDelay: 0.4 } : undefined}
      />
      <motion.path
        d="M22 24.5l2.3 2.4 4.7-5.4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        animate={active ? { pathLength: [0, 0, 1, 1], opacity: [0, 0, 1, 1] } : { pathLength: 1, opacity: 1 }}
        transition={active ? { duration: 2.6, times: [0, 0.3, 0.55, 1], repeat: Infinity, repeatDelay: 0.4 } : undefined}
      />
    </svg>
  );
}

function ConceptIcon({ active }: { active: boolean }) {
  // Mimics drafting: a concept sheet draws itself, then a ₹ quote badge pops.
  const lines = [18, 22, 26];
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 text-secondary" fill="none">
      <motion.rect
        x={11} y={10} width={19} height={27} rx={2} stroke="currentColor" strokeWidth={1.6}
        animate={active ? { pathLength: [0, 1, 1, 1] } : { pathLength: 1 }}
        transition={active ? { duration: 3, times: [0, 0.4, 0.95, 1], repeat: Infinity, repeatDelay: 0.3 } : undefined}
      />
      {lines.map((y, i) => (
        <motion.line
          key={y} x1={15} y1={y} x2={26} y2={y} stroke="currentColor" strokeWidth={1.4} strokeOpacity={0.55} strokeLinecap="round"
          animate={active ? { pathLength: [0, 0, 1, 1] } : { pathLength: 1 }}
          transition={active ? { duration: 3, times: [0, 0.4 + i * 0.07, 0.6 + i * 0.07, 1], repeat: Infinity, repeatDelay: 0.3 } : undefined}
        />
      ))}
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={active ? { scale: [0, 0, 1, 1], opacity: [0, 0, 1, 1] } : { scale: 1, opacity: 1 }}
        transition={active ? { duration: 3, times: [0, 0.65, 0.78, 1], repeat: Infinity, repeatDelay: 0.3 } : undefined}
      >
        <circle cx={33} cy={31} r={7.5} fill="currentColor" />
        <text x={33} y={34.6} textAnchor="middle" fontSize={11} fontWeight={700} fill="#2b2b2b">₹</text>
      </motion.g>
    </svg>
  );
}

function DesignIcon({ active }: { active: boolean }) {
  // Mimics 3D design: an isometric cube gently rotates.
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 text-secondary">
      <motion.g
        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        animate={active ? { rotate: [0, -8, 8, 0] } : { rotate: 0 }}
        transition={active ? { duration: 5, repeat: Infinity, ease: 'easeInOut' } : undefined}
      >
        <polygon points="24,10 35,16.5 24,23 13,16.5" fill="currentColor" fillOpacity={0.95} />
        <polygon points="13,16.5 24,23 24,36 13,29.5" fill="currentColor" fillOpacity={0.4} />
        <polygon points="35,16.5 24,23 24,36 35,29.5" fill="currentColor" fillOpacity={0.65} />
      </motion.g>
    </svg>
  );
}

function BuildIcon({ active }: { active: boolean }) {
  // Mimics construction: bars rise from the ground in sequence.
  const bars = [
    { x: 12, h: 14 },
    { x: 20, h: 21 },
    { x: 28, h: 16 },
    { x: 36, h: 25 },
  ];
  return (
    <svg viewBox="0 0 48 48" className="h-9 w-9 text-secondary">
      <line x1={9} y1={37} x2={41} y2={37} stroke="currentColor" strokeWidth={1.4} strokeOpacity={0.5} strokeLinecap="round" />
      {bars.map((b, i) => (
        <motion.rect
          key={b.x} x={b.x} y={37 - b.h} width={5} height={b.h} rx={1} fill="currentColor" fillOpacity={0.45 + i * 0.12}
          style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}
          animate={active ? { scaleY: [0, 1, 1, 0] } : { scaleY: 1 }}
          transition={active ? { duration: 3.2, times: [0, 0.4, 0.85, 1], delay: i * 0.14, repeat: Infinity, repeatDelay: 0.3 } : undefined}
        />
      ))}
    </svg>
  );
}

const STEPS = [
  { n: '01', t: 'Share your taste', d: 'The quiz you just did — your style, rooms and budget.', Icon: ShareIcon },
  { n: '02', t: 'Concept & quote', d: 'Your designer crafts a first concept and a transparent quote.', Icon: ConceptIcon },
  { n: '03', t: 'Design & finalise', d: '3D designs, materials and finishes — refined together.', Icon: DesignIcon },
  { n: '04', t: 'Build & handover', d: 'On-time execution, quality-checked and warranty-backed.', Icon: BuildIcon },
] as const;

function Step({ step, reduced }: { step: (typeof STEPS)[number]; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.55 });
  const { Icon } = step;
  const active = inView && !reduced;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 34 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col items-center text-center"
    >
      <div className="relative z-10 mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-secondary/25 bg-main/80">
        <Icon active={active} />
      </div>
      <div className="mb-1 font-serif text-xl text-secondary/90">{step.n}</div>
      <h4 className="mb-1 text-white">{step.t}</h4>
      <p className="max-w-[16rem] text-sm text-white/55">{step.d}</p>
    </motion.div>
  );
}

export default function HowItWorks() {
  const reduced = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });

  return (
    <section className="mx-auto max-w-3xl px-5 py-20 sm:px-6">
      <h3 className="mb-14 text-center font-serif text-2xl sm:text-3xl">How it works</h3>
      <div ref={ref} className="relative">
        {/* connector track + scroll-linked gold fill */}
        <div className="absolute left-1/2 top-10 bottom-10 w-px -translate-x-1/2 bg-white/10" />
        <motion.div
          className="absolute left-1/2 top-10 bottom-10 w-px -translate-x-1/2 origin-top bg-gradient-to-b from-secondary to-secondary/30"
          style={{ scaleY: reduced ? 1 : scrollYProgress }}
        />
        <div className="relative flex flex-col gap-16">
          {STEPS.map((s) => (
            <Step key={s.n} step={s} reduced={reduced} />
          ))}
        </div>
      </div>
    </section>
  );
}
