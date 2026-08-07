import { useEffect, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import KineticText from '../components/KineticText';
import { STYLE_PROFILES, STYLE_WORDS, type ImageOption, type QuadRound } from './data';
import './quiz.css';

const CARD_ROTATIONS = [-6, -2, 3, 7] as const;
const CARD_OFFSETS = [18, -6, 4, 22] as const;
const CARD_PASTELS = [
  { tint: 'rgb(245 233 214 / 92%)', chip: '#ddc9aa' },
  { tint: 'rgb(243 217 212 / 92%)', chip: '#dbbcb5' },
  { tint: 'rgb(220 231 218 / 92%)', chip: '#bfd0bc' },
  { tint: 'rgb(214 228 238 / 92%)', chip: '#b9cedc' },
  { tint: 'rgb(227 220 239 / 92%)', chip: '#c8bed7' },
] as const;

interface CardMotion {
  delay: number;
  dealRotation: number;
  offset: number;
  reduceMotion: boolean;
  rotation: number;
}

const cardVariants = {
  hidden: ({ dealRotation, offset, reduceMotion, rotation }: CardMotion) =>
    reduceMotion
      ? { opacity: 1, rotate: 0, y: 0 }
      : { opacity: 0, rotate: rotation + dealRotation, y: offset + 40 },
  idle: ({ delay, offset, reduceMotion, rotation }: CardMotion) => ({
    opacity: 1,
    rotate: reduceMotion ? 0 : rotation,
    scale: 1,
    y: reduceMotion ? 0 : offset,
    transition: reduceMotion
      ? { duration: 0 }
      : { delay, duration: 0.55, ease: [0.165, 0.84, 0.44, 1] },
  }),
  selected: ({ offset, reduceMotion, rotation }: CardMotion) => ({
    opacity: 1,
    rotate: reduceMotion ? 0 : rotation,
    scale: reduceMotion ? 1 : [1, 1.045, 1.015],
    y: reduceMotion ? 0 : offset,
    transition: reduceMotion ? { duration: 0 } : { duration: 0.32, ease: 'easeOut' },
  }),
};

type PastelProperties = CSSProperties & {
  '--quiz-card-chip': string;
  '--quiz-card-tint': string;
};

function useDesktopFan() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 1024px)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isDesktop;
}

function formatRoom(room: string) {
  return room.replace(/-/g, ' ');
}

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
          alt={`${label}, ${formatRoom(image.room)}`}
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
  dealRotation,
  offset,
  pastel,
  rotation,
  onSelect,
}: {
  image: ImageOption;
  label: string;
  selected: boolean;
  delay: number;
  dealRotation: number;
  offset: number;
  pastel: (typeof CARD_PASTELS)[number];
  rotation: number;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const room = formatRoom(image.room);
  const motionSettings: CardMotion = {
    delay,
    dealRotation,
    offset,
    reduceMotion: Boolean(reduceMotion),
    rotation,
  };
  const pastelProperties: PastelProperties = {
    '--quiz-card-chip': pastel.chip,
    '--quiz-card-tint': pastel.tint,
  };

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      variants={cardVariants}
      custom={motionSettings}
      initial="hidden"
      animate={selected ? 'selected' : 'idle'}
      whileHover={
        reduceMotion
          ? undefined
          : {
              rotate: 0,
              scale: 1.05,
              y: -10,
              transition: { type: 'spring', stiffness: 260, damping: 20 },
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      aria-pressed={selected}
      aria-label={`${label}, ${room}`}
      className={`dp-quiz-card group ${selected ? 'is-selected' : ''}`}
      style={pastelProperties}
    >
      <div className="dp-quiz-card__image">
        <ImageSurface image={image} label={label} eager={delay === 0} />
      </div>
      <span className="dp-quiz-card__chip" aria-hidden="true">
        <ArrowUpRight size={16} strokeWidth={1.8} />
      </span>
      <span className="dp-quiz-card__label">
        <span className="dp-quiz-card__kicker">{room}</span>
        <span className="dp-quiz-card__name">{label}</span>
      </span>
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
  const isDesktop = useDesktopFan();

  return (
    <div className="mx-auto w-full max-w-6xl">
      <StepHeading kicker={round.kicker} question={round.question} index={index} total={total} />
      <div className="dp-quiz-fan">
        {round.options.map((image, optionIndex) => {
          const layoutScale = isDesktop ? 1 : 0.5;
          return (
            <div className="dp-quiz-card-slot" key={image.id}>
              <PickCard
                image={image}
                label={STYLE_WORDS[image.style] ?? `Option ${String(optionIndex + 1).padStart(2, '0')}`}
                selected={selected === image.id}
                delay={optionIndex * 0.08}
                dealRotation={optionIndex % 2 === 0 ? -6 : 6}
                offset={CARD_OFFSETS[optionIndex] * layoutScale}
                pastel={CARD_PASTELS[optionIndex % CARD_PASTELS.length]}
                rotation={CARD_ROTATIONS[optionIndex] * layoutScale}
                onSelect={() => onSelect(image.id)}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-center text-[11px] text-white/35">Tap the one that feels like you</p>
    </div>
  );
}
