import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ROUNDS } from './data';
import type { Answer, Answers, BoardDecisions } from './report';
import AmbientBackground from '../components/AmbientBackground';
import DraftingAccents from './DraftingAccents';
import IntroSection from './IntroSection';
import { BoardSection, DuelSection, QuadSection } from './QuizSection';
import ChoiceSection from './ChoiceSection';
import FloorPlanSection from './FloorPlanSection';
import ContactSection from './ContactSection';

type Item =
  | { kind: 'intro'; key: string }
  | { kind: 'floorplan'; key: string }
  | { kind: 'contact'; key: string }
  | { kind: 'round'; key: string; roundIndex: number };

const slide = {
  enter: (direction: number) => ({ y: direction >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: '0%', opacity: 1 },
  exit: (direction: number) => ({ y: direction >= 0 ? '-100%' : '100%', opacity: 0 }),
};

function variantFor(item: Item): string {
  if (item.kind === 'intro') return 'kitchen';
  if (item.kind === 'floorplan') return 'plan';
  if (item.kind === 'contact') return 'wall';
  const round = ROUNDS[item.roundIndex];
  if (round.kind === 'duel') return 'kitchen';
  if (round.kind === 'board') return 'wall';
  if (round.kind === 'quad') return 'wardrobe';
  return 'plan';
}

function selectedId(answer: Answer | undefined): string | undefined {
  return typeof answer === 'string' ? answer : undefined;
}

function boardDecisions(answer: Answer | undefined): BoardDecisions {
  return answer && typeof answer === 'object' && !Array.isArray(answer) ? answer : {};
}

export default function DiscoverExperience({
  onFinish,
  onReturnToHero,
  onProgress,
}: {
  onFinish?: (answers: Answers) => void;
  onReturnToHero?: () => void;
  onProgress?: (progress: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const items = useMemo<Item[]>(() => {
    const list: Item[] = [{ kind: 'intro', key: 'intro' }];
    ROUNDS.forEach((round, roundIndex) => list.push({ kind: 'round', key: round.id, roundIndex }));
    list.push({ kind: 'floorplan', key: 'floorplan' });
    list.push({ kind: 'contact', key: 'contact' });
    return list;
  }, []);
  const last = items.length - 1;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const indexRef = useRef(0);
  const lockRef = useRef(false);
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
    const active = () => current().kind !== 'contact';
    const canAdvance = () => current().kind === 'intro' || current().kind === 'floorplan';
    const goBack = () => {
      if (indexRef.current === 0) {
        if (!lockRef.current) returnHeroRef.current?.();
      } else {
        go(-1);
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!active()) return;
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
      if (!active()) return;
      const deltaY = touchStartY - event.changedTouches[0].clientY;
      if (deltaY > 55) {
        if (canAdvance()) go(1);
      } else if (deltaY < -55) {
        goBack();
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (!active()) return;
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

  const select = (roundId: string, imageOrOptionId: string) => {
    setAnswers((current) => ({ ...current, [roundId]: imageOrOptionId }));
    window.setTimeout(() => go(1), reduceMotion ? 100 : 360);
  };

  const decideBoard = (roundId: string, imageId: string, decision: 'keep' | 'toss') => {
    setAnswers((current) => {
      const previous = boardDecisions(current[roundId]);
      return { ...current, [roundId]: { ...previous, [imageId]: decision } };
    });
  };

  const renderItem = (item: Item) => {
    if (item.kind === 'intro') return <IntroSection />;
    if (item.kind === 'floorplan') {
      return <FloorPlanSection onChange={(file, nextNotes) => { setFloorPlan(file); setNotes(nextNotes); }} />;
    }
    if (item.kind === 'contact') {
      return <ContactSection answers={answers} floorPlan={floorPlan} notes={notes} onExplore={() => onFinish?.(answers)} />;
    }

    const round = ROUNDS[item.roundIndex];
    const answer = answers[round.id];
    if (round.kind === 'quad') {
      return (
        <QuadSection
          round={round}
          index={item.roundIndex}
          total={ROUNDS.length}
          selected={selectedId(answer)}
          onSelect={(imageId) => select(round.id, imageId)}
        />
      );
    }
    if (round.kind === 'duel') {
      return (
        <DuelSection
          round={round}
          index={item.roundIndex}
          total={ROUNDS.length}
          selected={selectedId(answer)}
          onSelect={(imageId) => select(round.id, imageId)}
        />
      );
    }
    if (round.kind === 'board') {
      return (
        <BoardSection
          round={round}
          index={item.roundIndex}
          total={ROUNDS.length}
          decisions={boardDecisions(answer)}
          onDecide={(imageId, decision) => decideBoard(round.id, imageId, decision)}
          onDone={() => go(1)}
        />
      );
    }
    return (
      <ChoiceSection
        step={round}
        index={item.roundIndex}
        total={ROUNDS.length}
        selected={selectedId(answer)}
        onSelect={(optionId) => select(round.id, optionId)}
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
