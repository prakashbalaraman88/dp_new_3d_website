import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import KineticText from '../components/KineticText';
import { STYLE_PROFILES, type ImageOption, type QuadRound } from './data';

function StepHeading({ kicker, question, index, total }: { kicker: string; question: string; index: number; total: number }) {
  return (
    <>
      <p className="mb-2 text-center text-[10px] uppercase tracking-[0.22em] text-accent sm:text-xs">
        {kicker} · Step {index + 1} of {total}
      </p>
      <h2 className="mb-6 px-2 text-center font-serif text-2xl font-light text-white sm:mb-8 sm:text-4xl md:text-5xl">
        <KineticText text={question} trigger="inView" stagger={0.045} />
      </h2>
    </>
  );
}

function ImageSurface({ image, label, eager = false }: { image: ImageOption; label: string; eager?: boolean }) {
  const [loaded, setLoaded] = useState(true);
  const palette = STYLE_PROFILES[image.style]?.palette || ['#302d2a', '#857565', '#d2c4ae'];
  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(145deg, ${palette[0]}, ${palette[1] || palette[0]} 58%, ${palette[2] || palette[0]})` }}
    >
      {loaded && (
        <img
          src={image.image}
          alt={`${label}, ${image.room.replaceAll('-', ' ')}`}
          loading={eager ? 'eager' : 'lazy'}
          onError={() => setLoaded(false)}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />
    </div>
  );
}

function PickCard({
  image,
  label,
  selected,
  delay,
  className,
  onSelect,
}: {
  image: ImageOption;
  label: string;
  selected: boolean;
  delay: number;
  className: string;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : delay }}
      aria-pressed={selected}
      className={`group relative overflow-hidden rounded-2xl border text-left transition-colors ${className} ${
        selected ? 'border-secondary ring-2 ring-secondary/50' : 'border-white/10 hover:border-secondary/55'
      }`}
    >
      <ImageSurface image={image} label={label} eager={delay === 0} />
      <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-main/65 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm sm:bottom-4 sm:left-4">
        {label}
      </span>
      {selected && (
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm text-main">✓</span>
      )}
    </motion.button>
  );
}

export function QuadSection({
  round,
  index,
  total,
  selected,
  onSelect,
}: {
  round: QuadRound;
  index: number;
  total: number;
  selected?: string;
  onSelect: (imageId: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <StepHeading kicker={round.kicker} question={round.question} index={index} total={total} />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {round.options.map((image, optionIndex) => (
          <PickCard
            key={image.id}
            image={image}
            label={`Option ${optionIndex + 1}`}
            selected={selected === image.id}
            delay={optionIndex * 0.07}
            className="aspect-[4/5] sm:aspect-[3/4]"
            onSelect={() => onSelect(image.id)}
          />
        ))}
      </div>
      <p className="mt-5 text-center text-[11px] text-white/35">Tap the one that feels like you</p>
    </div>
  );
}
