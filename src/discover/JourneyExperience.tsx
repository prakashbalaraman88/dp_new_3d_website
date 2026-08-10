import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type Lenis from 'lenis';
import WalkthroughScrub from '../experience/WalkthroughScrub';
import { createScrollBridge, type ScrollBridge } from '../experience/scrollBridge';
import DiscoverExperience from './DiscoverExperience';
import Showcase from './Showcase';
import JourneyNav from './JourneyNav';
import type { Answers } from './report';
import { trackQuizComplete } from '../utils/analytics';

/**
 * Paid traffic is sent to /discover?quiz=1 so it lands on the quiz instead of
 * paying for the cinematic intro first. Organic visitors still get the intro.
 */
function initialPhase(): 'hero' | 'quiz' {
  if (typeof window === 'undefined') return 'hero';
  try {
    return new URLSearchParams(window.location.search).get('quiz') === '1' ? 'quiz' : 'hero';
  } catch {
    return 'hero';
  }
}

/**
 * One continuous journey: cinematic canvas hero → optional discovery quiz →
 * personalized full site.
 */
export default function JourneyExperience() {
  const [phase, setPhase] = useState<'hero' | 'quiz' | 'site'>(initialPhase);
  const [answers, setAnswers] = useState<Answers>({});
  const [showStyleReport, setShowStyleReport] = useState(false);
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const [quizProgress, setQuizProgress] = useState(0);
  const showcaseLenis = useRef<Lenis | null>(null);
  const bridgeRef = useRef<ScrollBridge | null>(null);
  const [bridge, setBridge] = useState<ScrollBridge | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    const journeyBridge = createScrollBridge();
    bridgeRef.current = journeyBridge;
    setBridge(journeyBridge);
    return () => {
      journeyBridge?.destroy();
      bridgeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase === 'quiz') bridge?.stop();
    else bridge?.start();
  }, [bridge, phase]);

  const toQuiz = useCallback(() => {
    bridgeRef.current?.lenis.scrollTo(0, { immediate: true });
    bridgeRef.current?.stop();
    window.scrollTo(0, 0);
    setPhase('quiz');
  }, []);
  const toHero = useCallback(() => {
    setTargetSection(null);
    setShowStyleReport(false);
    bridgeRef.current?.start();
    bridgeRef.current?.lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    setPhase('hero');
  }, []);
  const toSite = useCallback((a: Answers = {}, quizComplete = false) => {
    if (quizComplete) trackQuizComplete();
    setAnswers(a);
    setShowStyleReport(quizComplete);
    setTargetSection(null);
    bridgeRef.current?.start();
    bridgeRef.current?.lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    setPhase('site');
  }, []);
  const goToSection = useCallback((id: string) => {
    if (phaseRef.current === 'site') {
      if (showcaseLenis.current) showcaseLenis.current.scrollTo('#' + id, { offset: -64 });
      else document.getElementById(id)?.scrollIntoView();
    } else {
      setTargetSection(id);
      setShowStyleReport(false);
      setPhase('site');
    }
  }, []);

  return (
    <>
      {phase !== 'hero' && (
        <JourneyNav
          onHome={toHero}
          onNavigate={goToSection}
          progress={quizProgress}
          showProgress={phase === 'quiz'}
        />
      )}
      <AnimatePresence mode="wait">
      {phase === 'hero' && (
        <motion.div key="hero" exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
          <WalkthroughScrub bridge={bridge} onComplete={toQuiz} onSkipWebsite={() => toSite()} onNavigate={goToSection} />
        </motion.div>
      )}
      {phase === 'quiz' && (
        <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
          <DiscoverExperience
            onFinish={(quizAnswers) => toSite(quizAnswers, true)}
            onSkipWebsite={(partialAnswers) => toSite(partialAnswers, false)}
            onReturnToHero={toHero}
            onProgress={setQuizProgress}
          />
        </motion.div>
      )}
      {phase === 'site' && (
        <motion.div key="site" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: 'easeInOut' }}>
          <Showcase
            answers={answers}
            showStyleReport={showStyleReport}
            initialSection={targetSection}
            lenisRef={showcaseLenis}
            scrollBridge={bridge}
          />
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
