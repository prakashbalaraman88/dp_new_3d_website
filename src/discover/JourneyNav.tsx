import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

// Pill-shaped sticky nav for the journey (quiz + showcase). Shows a quiz-progress
// fill, hides on scroll-down / shows on scroll-up, and collapses to a menu on mobile.
const LINK = 'text-sm text-accent hover:text-secondary transition-colors duration-300';

export default function JourneyNav({
  onHome,
  onNavigate,
  progress = 0,
}: {
  onHome: () => void;
  onNavigate: (id: string) => void;
  progress?: number;
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
  const pct = Math.max(0, Math.min(1, progress));

  return (
    <nav
      className="fixed inset-x-0 top-0 z-[60] px-3 py-3 transition-transform duration-500 sm:px-4"
      style={{ transform: hidden ? 'translateY(-135%)' : 'translateY(0)' }}
    >
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-full border border-secondary/30 bg-main/90 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
          {/* quiz progress fill */}
          <div className="absolute inset-0 origin-left bg-secondary/12 transition-transform duration-500" style={{ transform: `scaleX(${pct})` }} />
          <div className="absolute bottom-0 left-0 h-[3px] w-full origin-left bg-secondary transition-transform duration-500" style={{ transform: `scaleX(${pct})` }} />

          <div className="relative flex h-14 items-center justify-between px-3 sm:h-16 sm:px-5">
            <button onClick={() => act(onHome)} aria-label="Home" className="shrink-0 transition-transform hover:scale-105">
              <img src="/assets/images/logo.png" alt="DezignPool" className="h-11 w-auto object-contain sm:h-12" style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.7))' }} />
            </button>

            <div className="hidden items-center gap-7 md:flex">
              <button onClick={() => act(onHome)} className={LINK}>Home</button>
              <Link to="/services" className={LINK}>Services</Link>
              <Link to="/about" className={LINK}>About</Link>
              <button onClick={() => act(() => onNavigate('gallery'))} className={LINK}>Projects</button>
              <button
                onClick={() => act(() => onNavigate('contact'))}
                className="rounded-full bg-secondary px-6 py-2 text-main transition-transform hover:scale-105"
              >
                Contact Us
              </button>
            </div>

            <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" className="text-accent transition-colors hover:text-secondary md:hidden">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-2 rounded-3xl border border-white/12 bg-main/95 p-3 md:hidden">
            <div className="flex flex-col gap-1">
              <button onClick={() => act(onHome)} className="rounded-xl px-4 py-3 text-left text-accent transition-colors hover:bg-white/5 hover:text-secondary">Home</button>
              <Link to="/services" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-left text-accent transition-colors hover:bg-white/5 hover:text-secondary">Services</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-left text-accent transition-colors hover:bg-white/5 hover:text-secondary">About</Link>
              <button onClick={() => act(() => onNavigate('gallery'))} className="rounded-xl px-4 py-3 text-left text-accent transition-colors hover:bg-white/5 hover:text-secondary">Projects</button>
              <button onClick={() => act(() => onNavigate('contact'))} className="mt-1 rounded-full bg-secondary px-4 py-3 text-center font-medium text-main">Contact Us</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
