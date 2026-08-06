import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import KineticText from '../components/KineticText';
import { STYLE_PROFILES, type BoardRound, type DuelRound, type ImageOption, type QuadRound } from './data';
import type { BoardDecisions } from './report';

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

export function DuelSection({
  round,
  index,
  total,
  selected,
  onSelect,
}: {
  round: DuelRound;
  index: number;
  total: number;
  selected?: string;
  onSelect: (imageId: string) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <StepHeading kicker={round.kicker} question={round.question} index={index} total={total} />
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {round.options.map((image, optionIndex) => (
          <PickCard
            key={image.id}
            image={image}
            label={optionIndex === 0 ? 'A' : 'B'}
            selected={selected === image.id}
            delay={optionIndex * 0.1}
            className="aspect-[3/4] sm:aspect-[4/3]"
            onSelect={() => onSelect(image.id)}
          />
        ))}
      </div>
      <p className="mt-5 text-center text-[11px] text-white/35">Choose on instinct</p>
    </div>
  );
}

function BoardCard({
  image,
  decision,
  index,
  onDecide,
}: {
  image: ImageOption;
  decision?: 'keep' | 'toss';
  index: number;
  onDecide: (decision: 'keep' | 'toss') => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : index * 0.055 }}
      className={`group relative aspect-[4/3] overflow-hidden rounded-xl border transition-colors sm:rounded-2xl ${
        decision === 'keep'
          ? 'border-secondary ring-2 ring-secondary/35'
          : decision === 'toss'
            ? 'border-white/10 opacity-55'
            : 'border-white/10'
      }`}
    >
      <ImageSurface image={image} label={`Board image ${index + 1}`} />
      <div className="absolute inset-x-2 bottom-2 grid grid-cols-2 gap-1.5 sm:inset-x-3 sm:bottom-3 sm:gap-2">
        <button
          type="button"
          onClick={() => onDecide('toss')}
          aria-pressed={decision === 'toss'}
          className={`rounded-full border px-2 py-2 text-[9px] uppercase tracking-[0.12em] backdrop-blur-md transition-colors sm:text-[10px] ${
            decision === 'toss' ? 'border-white/50 bg-white/80 text-main' : 'border-white/25 bg-main/60 text-white/75 hover:bg-main/85'
          }`}
        >
          Toss
        </button>
        <button
          type="button"
          onClick={() => onDecide('keep')}
          aria-pressed={decision === 'keep'}
          className={`rounded-full border px-2 py-2 text-[9px] uppercase tracking-[0.12em] backdrop-blur-md transition-colors sm:text-[10px] ${
            decision === 'keep' ? 'border-secondary bg-secondary text-main' : 'border-secondary/45 bg-main/60 text-secondary hover:bg-main/85'
          }`}
        >
          Keep
        </button>
      </div>
    </motion.div>
  );
}

export function BoardSection({
  round,
  index,
  total,
  decisions,
  onDecide,
  onDone,
}: {
  round: BoardRound;
  index: number;
  total: number;
  decisions: BoardDecisions;
  onDecide: (imageId: string, decision: 'keep' | 'toss') => void;
  onDone: () => void;
}) {
  const count = round.images.filter((image) => decisions[image.id]).length;
  const canFinish = count >= 3;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <StepHeading kicker={round.kicker} question={round.question} index={index} total={total} />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
        {round.images.map((image, imageIndex) => (
          <BoardCard
            key={image.id}
            image={image}
            decision={decisions[image.id]}
            index={imageIndex}
            onDecide={(decision) => onDecide(image.id, decision)}
          />
        ))}
      </div>
      <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <p className="text-[11px] text-white/45">{count} of 6 sorted · choose at least 3</p>
        <button
          type="button"
          onClick={onDone}
          disabled={!canFinish}
          className="rounded-full bg-secondary px-7 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-main transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
        >
          {count === round.images.length ? 'All sorted — continue' : 'Done'}
        </button>
      </div>
    </div>
  );
}
