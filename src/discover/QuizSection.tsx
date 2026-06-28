import { useState } from 'react';
import { motion } from 'framer-motion';
import KineticText from '../components/KineticText';
import type { VisualStep, StyleOption } from './data';

function Card({ opt, i, selected, onClick }: { opt: StyleOption; i: number; selected: boolean; onClick: () => void }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className={`group relative text-left rounded-2xl overflow-hidden border transition-all ${
        selected ? 'border-secondary ring-2 ring-secondary/50' : 'border-white/10 hover:border-secondary/50'
      }`}
    >
      <div
        className="relative aspect-[3/4] w-full overflow-hidden"
        style={{ background: `linear-gradient(150deg, ${opt.palette[0]}, ${opt.palette[1]} 55%, ${opt.palette[2]})` }}
      >
        {imgOk && (
          <img
            src={opt.image}
            alt={`${opt.philosophy} — ${opt.title}`}
            onError={() => setImgOk(false)}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <p className="text-secondary text-[9px] sm:text-[11px] tracking-[0.18em] uppercase mb-0.5 sm:mb-1">{opt.philosophy}</p>
          <h3 className="font-serif text-white text-base sm:text-xl leading-tight">{opt.title}</h3>
          <p className="text-white/70 text-[11px] sm:text-xs mt-0.5 sm:mt-1 leading-snug line-clamp-2">{opt.blurb}</p>
        </div>
        {selected && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-secondary text-main flex items-center justify-center text-sm">&#10003;</div>
        )}
      </div>
    </motion.button>
  );
}

export default function QuizSection({
  step,
  index,
  total,
  selected,
  onSelect,
}: {
  step: VisualStep;
  index: number;
  total: number;
  selected?: string;
  onSelect: (optId: string) => void;
}) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <p className="text-center text-accent tracking-[0.22em] uppercase text-[10px] sm:text-xs mb-2">
        {step.room} · Step {index + 1} of {total}
      </p>
      <h2 className="text-center font-serif font-light text-2xl sm:text-4xl md:text-5xl text-white mb-7 sm:mb-10 px-2">
        <KineticText text={step.question} trigger="inView" stagger={0.06} />
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {step.options.map((opt, i) => (
          <Card key={opt.id} opt={opt} i={i} selected={selected === opt.id} onClick={() => onSelect(opt.id)} />
        ))}
      </div>
      <p className="text-center text-white/35 text-[11px] mt-6">Tap the one that feels like you</p>
    </div>
  );
}
