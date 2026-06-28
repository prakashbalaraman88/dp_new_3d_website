import { motion, useReducedMotion } from 'framer-motion';

// Dark Portoro-style marble: charcoal stone with gold veining + a polished sheen.
const VEINS = [
  'M0,140 C120,90 220,200 340,150 C460,100 560,210 700,150',
  'M0,420 C140,360 260,470 420,400 C560,340 640,440 700,380',
  'M0,700 C120,650 240,760 380,690 C520,620 620,720 700,660',
  'M120,0 C160,140 90,260 180,380 C250,480 180,600 240,1000',
  'M520,0 C480,160 580,300 520,460 C470,600 560,760 500,1000',
];

export default function PortoroMarble() {
  const reduce = useReducedMotion();
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'radial-gradient(120% 120% at 30% 20%, #20262a 0%, #14181a 45%, #0c0f10 100%)' }} />
      <svg viewBox="0 0 700 1000" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <g fill="none" stroke="rgba(212,175,55,0.30)" strokeWidth="1.4" style={{ filter: 'blur(0.4px)' }}>
          {VEINS.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              animate={reduce ? undefined : { opacity: [0.35, 0.62, 0.35] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </g>
        <g fill="none" stroke="rgba(233,227,212,0.12)" strokeWidth="0.7">
          {VEINS.map((d, i) => (
            <path key={i} d={d} transform="translate(14,10)" />
          ))}
        </g>
      </svg>
      <motion.div
        className="absolute -inset-1/3"
        style={{ background: 'linear-gradient(115deg, transparent 35%, rgba(255,240,200,0.10) 48%, rgba(255,240,200,0.18) 52%, transparent 66%)' }}
        animate={reduce ? undefined : { x: ['-30%', '40%', '-30%'], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}
