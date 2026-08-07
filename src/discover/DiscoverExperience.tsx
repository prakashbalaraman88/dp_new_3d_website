import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ROUNDS } from './data';
import type { Answers } from './report';
import AmbientBackground from '../components/AmbientBackground';
import DraftingAccents from './DraftingAccents';
import IntroSection from './IntroSection';
import { QuadSection } from './QuizSection';

type Item =
  | { kind: 'intro'; key: string }
  | { kind: 'round'; key: string; roundIndex: number };

const slide = {
  enter: (direction: number) => ({ y: direction >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: '0%', opacity: 1 },
  exit: (direction: number) => ({ y: direction >= 0 ? '-100%' : '100%', opacity: 0 }),
};

function variantFor(item: Item): string {
  if (item.kind === 'intro') return 'kitchen';
  return 'wardrobe';
}

export default function DiscoverExperience({
  onFinish,
  onSkipWebsite,
  onReturnToHero,
  onProgress,
}: {
  onFinish?: (answers: Answers) => void;
  onSkipWebsite?: (answers: Answers) => void;
  onReturnToHero?: () => void;
  onProgress?: (progress: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const items = useMemo<Item[]>(() => {
    const list: Item[] = [{ kind: 'intro', key: 'intro' }];
    ROUNDS.forEach((round, roundIndex) => list.push({ kind: 'round', key: round.id, roundIndex }));
    return list;
  }, []);
  const last = items.length - 1;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});

  const indexRef = useRef(0);
  const lockRef = useRef(false);
  const advanceTimerRef = useRef<number | null>(null);
  const returnHeroRef = useRef(onReturnToHero);
  returnHeroRef.current = onReturnToHero;

  const go = useCallback(
    (delta: number) => {
      if (lockRef.current) return;
      const current = indexRef.current;
      const next = Math.min(last, Math.max(0, current + delta));
      if (next === current) return;
      lockRef.current = true;
      indexRef.current = next;
      setDirection(delta >= 0 ? 1 : -1);
      setIndex(next);
      window.setTimeout(() => {
        lockRef.current = false;
      }, reduceMotion ? 80 : 720);
    },
    [last, reduceMotion],
  );

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
      document.body.style.overflow = previous;
    };
  }, []);

  // Ignore momentum carried over from the walkthrough so the intro remains visible.
  useEffect(() => {
    lockRef.current = true;
    const timer = window.setTimeout(() => {
      lockRef.current = false;
    }, reduceMotion ? 100 : 800);
    return () => window.clearTimeout(timer);
  }, [reduceMotion]);

  useEffect(() => {
    onProgress?.(last > 0 ? index / last : 0);
  }, [index, last, onProgress]);

  useEffect(() => {
    const current = () => items[indexRef.current];
    const canAdvance = () => current().kind === 'intro';
    const goBack = () => {
      if (indexRef.current === 0) {
        if (!lockRef.current) returnHeroRef.current?.();
      } else {
        go(-1);
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 24) {
        if (canAdvance()) go(1);
      } else if (event.deltaY < -24) {
        goBack();
      }
    };
    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0].clientY;
    };
    const onTouchEnd = (event: TouchEvent) => {
      const deltaY = touchStartY - event.changedTouches[0].clientY;
      if (deltaY > 55) {
        if (canAdvance()) go(1);
      } else if (deltaY < -55) {
        goBack();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        if (canAdvance()) go(1);
      } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        goBack();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKey);
    };
  }, [go, items]);

  const completeOrAdvance = (completionAnswers: Answers = answers) => {
    if (indexRef.current === last) onFinish?.(completionAnswers);
    else go(1);
  };

  const select = (roundId: string, imageOrOptionId: string) => {
    const nextAnswers = { ...answers, [roundId]: imageOrOptionId };
    setAnswers(nextAnswers);
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(
      () => completeOrAdvance(nextAnswers),
      reduceMotion ? 100 : 360,
    );
  };

  const renderItem = (item: Item) => {
    if (item.kind === 'intro') return <IntroSection />;

    const round = ROUNDS[item.roundIndex];
    const answer = answers[round.id];
    return (
      <QuadSection
        round={round}
        index={item.roundIndex}
        total={ROUNDS.length}
        selected={answer}
        onSelect={(imageId) => select(round.id, imageId)}
      />
    );
  };

  const current = items[index];

  return (
    <div className="dp-discover relative h-svh overflow-hidden font-sans text-white">
      <AmbientBackground variant="plaster" />

      {index > 0 && (
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Go back to the previous step"
          className="fixed bottom-6 left-4 z-[60] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-main/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/65 transition-colors hover:border-secondary/40 hover:text-secondary active:scale-95"
        >
          <span className="text-sm leading-none">↑</span> Back
        </button>
      )}
      <button
        type="button"
        onClick={() => onSkipWebsite?.(answers)}
        className="fixed bottom-7 right-5 z-[60] text-[12px] font-light lowercase tracking-[0.04em] text-[#f2efe9]/45 underline-offset-4 transition-colors hover:text-[#f2efe9]/75 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98E5F] sm:right-7"
      >
        skip to website
      </button>
      <div className="relative z-10 h-full">
        <AnimatePresence custom={direction} initial={false}>
          <motion.div
            key={current.key}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.7, 0, 0.2, 1] }}
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            <DraftingAccents variant={variantFor(current)} />
            <div className="relative flex min-h-full flex-col">
              <div className="m-auto w-full px-5 pb-20 pt-24 sm:px-6">{renderItem(current)}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
