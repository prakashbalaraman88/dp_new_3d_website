import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RotatingBrandMark from './RotatingBrandMark';
import ProjectForm from './ProjectForm';

const NAV_LINK = 'relative py-2 text-[11px] uppercase tracking-[1.4px] text-[#f2efe9]/58 transition-colors duration-300 hover:text-[#A98E5F]';

export default function Navbar() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setScrollProgress(window.scrollY / totalHeight);
      setScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navLink = (href: string, label: string) => {
    const isActive = location.pathname === href
      || (href === '/projects' && location.pathname.startsWith('/project/'))
      || (href === '/blog' && location.pathname.startsWith('/blog/'));
    return (
      <Link to={href} className={`${NAV_LINK} ${isActive ? 'text-[#A98E5F]' : ''}`}>
        {label}
        <span className={`absolute inset-x-0 bottom-0 h-px origin-left bg-[#A98E5F] transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
      </Link>
    );
  };

  return (
    <nav className={`fixed inset-x-0 top-0 z-50 px-3 transition-all duration-500 sm:px-4 ${scrolled ? 'py-2' : 'py-3'}`}>
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-full border border-white/10 bg-[#101012]/90 shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <div
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#A98E5F]/65 transition-transform duration-200"
            style={{ transform: `scaleX(${scrollProgress})` }}
          />

          <div className="relative grid h-14 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-3 sm:h-16 sm:px-5">
            <div className="hidden min-w-0 items-center justify-evenly pr-7 md:flex lg:pr-12">
              <span className="group">{navLink('/', 'Home')}</span>
              <span className="group">{navLink('/services', 'Services')}</span>
              <span className="group">{navLink('/blog', 'Journal')}</span>
            </div>

            <Link to="/" aria-label="DezignPool home" className="col-start-2 row-start-1 justify-self-center transition-transform duration-300 hover:scale-105">
              <RotatingBrandMark
                className="h-11 w-11 object-contain sm:h-12 sm:w-12"
                style={{ filter: 'drop-shadow(0 1px 6px rgba(0,0,0,0.7))' }}
              />
            </Link>

            <div className="hidden min-w-0 items-center justify-evenly gap-5 pl-7 md:flex lg:pl-12">
              <span className="group">{navLink('/about', 'About')}</span>
              <span className="group">{navLink('/projects', 'Projects')}</span>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="rounded-full bg-[#f2efe9] px-5 py-2.5 text-[10px] uppercase tracking-[1.35px] text-[#101012] transition-transform duration-300 hover:-translate-y-0.5 lg:px-6"
              >
                Enquire
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="col-start-1 row-start-1 justify-self-start text-[#f2efe9]/65 transition-colors hover:text-[#A98E5F] md:hidden"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="col-start-3 row-start-1 justify-self-end rounded-full bg-[#f2efe9] px-4 py-2 text-[9px] uppercase tracking-[1.15px] text-[#101012] md:hidden"
            >
              Enquire
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-2 rounded-3xl border border-white/10 bg-[#101012]/96 p-3 shadow-2xl backdrop-blur-2xl md:hidden">
            <div className="flex flex-col gap-1">
              {[
                ['/', 'Home'],
                ['/services', 'Services'],
                ['/about', 'About'],
                ['/projects', 'Projects'],
                ['/blog', 'Journal'],
              ].map(([href, label]) => (
                <Link key={href} to={href} className="rounded-xl px-4 py-3 text-left text-sm text-[#f2efe9]/65 transition-colors hover:bg-white/5 hover:text-[#A98E5F]">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <ProjectForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </nav>
  );
}
