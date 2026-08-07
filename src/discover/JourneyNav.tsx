import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';

// Pill-shaped sticky nav for the journey (quiz + site). Shows a quiz-progress
// fill, hides on scroll-down / shows on scroll-up, and collapses to a menu on mobile.
const LINK = 'text-[12px] uppercase tracking-[1.4px] text-[#f2efe9]/60 transition-colors duration-300 hover:text-[#A98E5F]';

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
        <div className="relative overflow-hidden rounded-full border border-white/10 bg-[#101012]/90 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          {/* quiz progress fill */}
          <div className="absolute inset-0 origin-left bg-[#A98E5F]/10 transition-transform duration-500" style={{ transform: `scaleX(${pct})` }} />
          <div className="absolute bottom-0 left-0 h-px w-full origin-left bg-[#A98E5F] transition-transform duration-500" style={{ transform: `scaleX(${pct})` }} />

          <div className="relative flex h-14 items-center justify-between px-3 sm:h-16 sm:px-5">
            <button onClick={() => act(onHome)} aria-label="Home" className="shrink-0 transition-transform hover:scale-105">
              <img src="/assets/images/logo.png" alt="DezignPool" className="h-11 w-auto object-contain sm:h-12" style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.7))' }} />
            </button>

            <div className="hidden items-center gap-7 md:flex">
              <button onClick={() => act(onHome)} className={LINK}>Home</button>
              <button onClick={() => act(() => onNavigate('services'))} className={LINK}>Services</button>
              <button onClick={() => act(() => onNavigate('about'))} className={LINK}>About</button>
              <button onClick={() => act(() => onNavigate('gallery'))} className={LINK}>Projects</button>
              <button
                onClick={() => act(() => onNavigate('lead-form'))}
                className="rounded-full bg-[#f2efe9] px-6 py-2 text-[12px] uppercase tracking-[1.4px] text-[#101012] transition-transform hover:-translate-y-0.5"
              >
                Enquire
              </button>
            </div>

            <button onClick={() => setMenuOpen((o) => !o)} aria-label="Menu" className="text-[#f2efe9]/65 transition-colors hover:text-[#A98E5F] md:hidden">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-2 rounded-3xl border border-white/10 bg-[#101012]/95 p-3 backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-1">
              <button onClick={() => act(onHome)} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">Home</button>
              <button onClick={() => act(() => onNavigate('services'))} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">Services</button>
              <button onClick={() => act(() => onNavigate('about'))} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">About</button>
              <button onClick={() => act(() => onNavigate('gallery'))} className="rounded-xl px-4 py-3 text-left text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">Projects</button>
              <button onClick={() => act(() => onNavigate('lead-form'))} className="mt-1 rounded-full bg-[#f2efe9] px-4 py-3 text-center text-[12px] uppercase tracking-[1.4px] text-[#101012]">Enquire</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
