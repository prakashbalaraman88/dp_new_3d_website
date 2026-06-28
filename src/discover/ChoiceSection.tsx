import { motion } from 'framer-motion';
import KineticText from '../components/KineticText';
import type { ChoiceStep } from './data';

export default function ChoiceSection({
  step,
  index,
  total,
  selected,
  onSelect,
}: {
  step: ChoiceStep;
  index: number;
  total: number;
  selected?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <p className="text-accent tracking-[0.22em] uppercase text-[10px] sm:text-xs mb-2">
        {step.kicker} · Step {index + 1} of {total}
      </p>
      <h2 className="font-serif font-light text-2xl sm:text-4xl md:text-5xl text-white mb-4 sm:mb-6 px-2">
        <KineticText text={step.question} trigger="inView" stagger={0.05} />
      </h2>
      {step.why && <p className="text-white/45 text-xs sm:text-sm max-w-sm mx-auto mb-6 sm:mb-8 -mt-1">{step.why}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
        {step.options.map((o, i) => (
          <motion.button
            key={o.id}
            onClick={() => onSelect(o.id)}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: i * 0.07 }}
            className={`rounded-2xl border px-5 py-4 text-left transition-all ${
              selected === o.id
                ? 'border-secondary bg-secondary/10 ring-2 ring-secondary/40'
                : 'border-white/15 bg-white/[0.03] hover:border-secondary/50'
            }`}
          >
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="block font-serif text-lg text-white">{o.label}</span>
                {o.hint && <span className="block text-white/45 text-xs mt-0.5">{o.hint}</span>}
              </span>
              {selected === o.id && <span className="text-secondary text-lg">&#10003;</span>}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
