import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Menu, X } from 'lucide-react';
import RotatingBrandMark from '../components/RotatingBrandMark';

// Pill-shaped sticky nav for the journey (quiz + site). Shows a quiz-progress
// bar, hides on scroll-down / shows on scroll-up, and collapses to a menu on mobile.
const LINK = 'text-[12px] uppercase tracking-[1.4px] text-[#f2efe9]/60 transition-colors duration-300 hover:text-[#A98E5F]';

export default function JourneyNav({
  onHome,
  onNavigate,
  progress = 0,
  showProgress = false,
}: {
  onHome: () => void;
  onNavigate: (id: string) => void;
  progress?: number;
  showProgress?: boolean;
}) {
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (!menuOpen) setHidden(y > lastY.current && y > 90);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  const act = (fn: () => void) => {
    setMenuOpen(false);
    fn();
  };
  const followJourney = (event: MouseEvent<HTMLAnchorElement>, fn: () => void) => {
    event.preventDefault();
    act(fn);
  };
  const pct = Math.max(0, Math.min(1, progress));

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[60] px-3 py-3 transition-transform duration-500 sm:px-4"
      style={{ transform: hidden ? 'translateY(-135%)' : 'translateY(0)' }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-full border border-white/10 bg-[#101012]/90 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div className="relative grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-3 sm:h-16 sm:px-5">
            <div className="hidden min-w-0 items-center justify-evenly pr-5 md:flex lg:pr-10">
              <a href="/" onClick={(event) => followJourney(event, onHome)} className={LINK}>Home</a>
              <a href="/services" onClick={(event) => followJourney(event, () => onNavigate('services'))} className={LINK}>Services</a>
              <a href="/blog" className={LINK}>Journal</a>
            </div>

            <a
              href="/#contact"
              onClick={(event) => followJourney(event, () => onNavigate('lead-form'))}
              className="col-start-1 row-start-1 justify-self-start rounded-full border border-[#A98E5F]/55 px-3 py-2 text-[10px] uppercase tracking-[1.1px] text-[#f2efe9] transition-colors hover:border-[#A98E5F] hover:text-[#A98E5F] md:hidden"
            >
              Enquire
            </a>

            <button onClick={() => act(onHome)} aria-label="Home" className="col-start-2 row-start-1 justify-self-center transition-transform hover:scale-105">
              <RotatingBrandMark
                key={showProgress ? 'quiz-logo' : 'site-logo'}
                className="h-11 w-11 object-contain sm:h-12 sm:w-12"
                rotationProgress={showProgress ? pct : undefined}
                style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.7))' }}
              />
            </button>

            <div className="hidden min-w-0 items-center justify-evenly pl-5 md:flex lg:pl-10">
              <a href="/about" onClick={(event) => followJourney(event, () => onNavigate('about'))} className={LINK}>About</a>
              <a href="/projects" onClick={(event) => followJourney(event, () => onNavigate('gallery'))} className={LINK}>Projects</a>
              <a
                href="/#contact"
                onClick={(event) => followJourney(event, () => onNavigate('lead-form'))}
                className="rounded-full bg-[#f2efe9] px-5 py-2 text-[12px] uppercase tracking-[1.4px] text-[#101012] transition-transform hover:-translate-y-0.5 lg:px-6"
              >
                Enquire
              </a>
            </div>

            <button onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} className="col-start-3 row-start-1 justify-self-end text-[#f2efe9]/65 transition-colors hover:text-[#A98E5F] md:hidden">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {showProgress && (
          <div
            className="mx-5 mt-2 h-[3px] overflow-hidden rounded-full bg-[#f2efe9]/10 sm:mx-7"
            role="progressbar"
            aria-label="Style quiz progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct * 100)}
          >
            <div
              className="h-full w-full origin-left rounded-full bg-[#A98E5F] shadow-[0_0_12px_rgba(169,142,95,0.72)] transition-transform duration-500"
              style={{ transform: `scaleX(${pct})` }}
            />
          </div>
        )}

        {menuOpen && (
          <div className="mt-2 rounded-3xl border border-white/10 bg-[#101012]/95 p-3 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-1">
              <a href="/" onClick={(event) => followJourney(event, onHome)} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">Home</a>
              <a href="/services" onClick={(event) => followJourney(event, () => onNavigate('services'))} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">Services</a>
              <a href="/about" onClick={(event) => followJourney(event, () => onNavigate('about'))} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">About</a>
              <a href="/projects" onClick={(event) => followJourney(event, () => onNavigate('gallery'))} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">Projects</a>
              <a href="/blog" className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">Journal</a>
              <a href="/#contact" onClick={(event) => followJourney(event, () => onNavigate('lead-form'))} className="mt-1 rounded-full bg-[#f2efe9] px-4 py-3 text-center text-[12px] uppercase tracking-[1.4px] text-[#101012]">Enquire</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
