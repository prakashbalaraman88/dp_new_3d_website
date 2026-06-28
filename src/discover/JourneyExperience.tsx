import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type Lenis from 'lenis';
import HeroScrub from '../experience/HeroScrub';
import DiscoverExperience from './DiscoverExperience';
import Showcase from './Showcase';
import JourneyNav from './JourneyNav';
import type { Answers } from './report';

/**
 * One continuous journey: scroll-scrubbed video hero → discovery quiz deck →
 * personalized projects/testimonials showcase.
 */
export default function JourneyExperience() {
  const [phase, setPhase] = useState<'hero' | 'quiz' | 'showcase'>('hero');
  const [answers, setAnswers] = useState<Answers>({});
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const [quizProgress, setQuizProgress] = useState(0);
  const showcaseLenis = useRef<Lenis | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const toQuiz = useCallback(() => setPhase('quiz'), []);
  const toHero = useCallback(() => {
    setTargetSection(null);
    setPhase('hero');
  }, []);
  const toShowcase = useCallback((a: Answers) => {
    setAnswers(a);
    setTargetSection(null);
    setPhase('showcase');
  }, []);
  const goToSection = useCallback((id: string) => {
    if (phaseRef.current === 'showcase') {
      showcaseLenis.current?.scrollTo('#' + id, { offset: -64 });
    } else {
      setTargetSection(id);
      setPhase('showcase');
    }
  }, []);

  return (
    <>
      {phase !== 'hero' && <JourneyNav onHome={toHero} onNavigate={goToSection} progress={phase === 'showcase' ? 1 : quizProgress} />}
      <AnimatePresence mode="wait">
      {phase === 'hero' && (
        <motion.div key="hero" exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
          <HeroScrub onComplete={toQuiz} />
        </motion.div>
      )}
      {phase === 'quiz' && (
        <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
          <DiscoverExperience onFinish={toShowcase} onReturnToHero={toHero} onProgress={setQuizProgress} />
        </motion.div>
      )}
      {phase === 'showcase' && (
        <motion.div key="showcase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
          <Showcase answers={answers} initialSection={targetSection} lenisRef={showcaseLenis} />
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
