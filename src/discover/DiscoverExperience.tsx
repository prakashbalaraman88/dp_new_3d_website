import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { STEPS } from './data';
import type { Answers } from './report';
import AmbientBackground from '../components/AmbientBackground';
import DraftingAccents from './DraftingAccents';
import IntroSection from './IntroSection';
import QuizSection from './QuizSection';
import ChoiceSection from './ChoiceSection';
import FloorPlanSection from './FloorPlanSection';
import ContactSection from './ContactSection';

type Item =
  | { kind: 'intro'; key: string }
  | { kind: 'floorplan'; key: string }
  | { kind: 'contact'; key: string }
  | { kind: 'visual' | 'choice'; key: string; stepIndex: number };

const slide = {
  enter: (d: number) => ({ y: d >= 0 ? '100%' : '-100%', opacity: 0 }),
  center: { y: '0%', opacity: 1 },
  exit: (d: number) => ({ y: d >= 0 ? '-100%' : '100%', opacity: 0 }),
};

function variantFor(item: Item): string {
  if (item.kind === 'intro') return 'kitchen';
  if (item.kind === 'floorplan') return 'plan';
  if (item.kind === 'contact') return 'wall';
  const step = STEPS[item.stepIndex];
  if (step.id === 'kitchen') return 'kitchen';
  if (step.id === 'wardrobe') return 'wardrobe';
  if (step.id === 'living') return 'wall';
  return 'plan';
}

export default function DiscoverExperience({
  onFinish,
  onReturnToHero,
  onProgress,
}: {
  onFinish?: (answers: Answers) => void;
  onReturnToHero?: () => void;
  onProgress?: (p: number) => void;
}) {
  const items = useMemo<Item[]>(() => {
    const list: Item[] = [{ kind: 'intro', key: 'intro' }];
    STEPS.forEach((s, si) => list.push({ kind: s.kind, key: s.id, stepIndex: si }));
    list.push({ kind: 'floorplan', key: 'floorplan' });
    list.push({ kind: 'contact', key: 'contact' });
    return list;
  }, []);
  const last = items.length - 1;

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
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
      const cur = indexRef.current;
      const ni = Math.min(last, Math.max(0, cur + delta));
      if (ni === cur) return;
      lockRef.current = true;
      indexRef.current = ni;
      setDir(delta >= 0 ? 1 : -1);
      setIndex(ni);
      window.setTimeout(() => {
        lockRef.current = false;
      }, 720);
    },
    [last],
  );

  // Lock the page; the deck is driven entirely by gestures.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Ignore leftover scroll momentum right after mount (e.g. carried over from the
  // hero) so the first screen isn't skipped.
  useEffect(() => {
    lockRef.current = true;
    const t = window.setTimeout(() => {
      lockRef.current = false;
    }, 800);
    return () => window.clearTimeout(t);
  }, []);

  // Report quiz progress to the sticky nav.
  useEffect(() => {
    onProgress?.(last > 0 ? index / last : 0);
  }, [index, last, onProgress]);

  // Gesture navigation. Intro + floor-plan advance on a scroll/swipe; question
  // screens advance only on selection. Up-gesture always goes back. The contact
  // screen scrolls internally, so gestures are off there.
  useEffect(() => {
    const cur = () => items[indexRef.current];
    const active = () => cur().kind !== 'contact';
    const canAdvance = () => cur().kind === 'intro' || cur().kind === 'floorplan';
    const goBack = () => {
      // From the very first screen, an up-gesture returns to the hero.
      if (indexRef.current === 0) {
        if (!lockRef.current) returnHeroRef.current?.();
      } else {
        go(-1);
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!active()) return;
      if (e.deltaY > 24) {
        if (canAdvance()) go(1);
      } else if (e.deltaY < -24) {
        goBack();
      }
    };
    let sy = 0;
    const onTS = (e: TouchEvent) => {
      sy = e.touches[0].clientY;
    };
    const onTE = (e: TouchEvent) => {
      if (!active()) return;
      const dy = sy - e.changedTouches[0].clientY;
      if (dy > 55) {
        if (canAdvance()) go(1);
      } else if (dy < -55) {
        goBack();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (!active()) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (canAdvance()) go(1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        goBack();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTS, { passive: true });
    window.addEventListener('touchend', onTE, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTS);
      window.removeEventListener('touchend', onTE);
      window.removeEventListener('keydown', onKey);
    };
  }, [go, items]);

  const select = (stepId: string, optId: string) => {
    setAnswers((a) => ({ ...a, [stepId]: optId }));
    window.setTimeout(() => go(1), 400);
  };

  const renderItem = (item: Item) => {
    if (item.kind === 'intro') return <IntroSection />;
    if (item.kind === 'floorplan') return <FloorPlanSection onChange={(f, n) => { setFloorPlan(f); setNotes(n); }} />;
    if (item.kind === 'contact') return <ContactSection answers={answers} floorPlan={floorPlan} notes={notes} onExplore={() => onFinish?.(answers)} />;
    const step = STEPS[item.stepIndex];
    if (step.kind === 'visual') {
      return (
        <QuizSection
          step={step}
          index={item.stepIndex}
          total={STEPS.length}
          selected={answers[step.id]}
          onSelect={(id) => select(step.id, id)}
        />
      );
    }
    return (
      <ChoiceSection
        step={step}
        index={item.stepIndex}
        total={STEPS.length}
        selected={answers[step.id]}
        onSelect={(id) => select(step.id, id)}
      />
    );
  };

  const current = items[index];

  return (
    <div className="dp-discover relative h-svh overflow-hidden text-white font-sans">
      <AmbientBackground variant="plaster" />

      {index > 0 && (
        <button
          onClick={() => go(-1)}
          aria-label="Go back to the previous step"
          className="fixed bottom-6 left-4 z-[60] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-main/70 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-white/65 transition-colors hover:text-secondary hover:border-secondary/40 active:scale-95"
        >
          <span className="text-sm leading-none">&uarr;</span> Back
        </button>
      )}
      <div className="relative z-10 h-full">
        <AnimatePresence custom={dir} initial={false}>
          <motion.div
            key={current.key}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
            className="absolute inset-0 overflow-y-auto overscroll-contain"
          >
            <DraftingAccents variant={variantFor(current)} />
            <div className="relative min-h-full flex flex-col">
              <div className="m-auto w-full px-5 sm:px-6 pb-16 pt-24">{renderItem(current)}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
