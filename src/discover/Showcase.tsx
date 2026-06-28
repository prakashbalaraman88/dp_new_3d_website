import { useEffect, useMemo, useState, type MutableRefObject } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import AmbientBackground from '../components/AmbientBackground';
import KineticText from '../components/KineticText';
import HowItWorks from './HowItWorks';
import { buildReport, type Answers } from './report';
import {
  rankProjects,
  whatsappLink,
  TESTIMONIALS,
  STUDIO_PHONE,
  STUDIO_EMAIL,
  STUDIO_INSTAGRAM,
  type ShowcaseProject,
} from './showcaseData';

function WhatsAppGlyph({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function ProjectCard({ p, inStyle, i, onOpen }: { p: ShowcaseProject; inStyle: boolean; i: number; onOpen: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
      className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 text-left"
    >
      <div className="relative aspect-[4/5]">
        <img src={p.image} alt={p.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        {inStyle && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary/90 px-3 py-1 text-[10px] font-medium tracking-wide text-main">
            In your style
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-secondary">{p.category}</p>
          <h3 className="font-serif text-2xl leading-tight text-white">{p.title}</h3>
          <p className="mt-1 text-sm text-white/70">{p.description}</p>
          <span className="mt-3 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-secondary/80 transition-colors group-hover:text-secondary">
            View project &rarr;
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function Showcase({
  answers,
  initialSection,
  lenisRef,
}: {
  answers: Answers;
  initialSection?: string | null;
  lenisRef?: MutableRefObject<Lenis | null>;
}) {
  const { matched, rest } = useMemo(() => rankProjects(answers), [answers]);
  const report = useMemo(() => buildReport(answers), [answers]);
  const wa = useMemo(() => whatsappLink(answers), [answers]);
  const [active, setActive] = useState<ShowcaseProject | null>(null);

  // Smooth, inertial scrolling on desktop (Lenis uses native touch on mobile).
  // Opens at the top, or jumps to a section if the nav requested one.
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    if (lenisRef) lenisRef.current = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    if (initialSection) {
      requestAnimationFrame(() => lenis.scrollTo('#' + initialSection, { immediate: true, offset: -64 }));
    } else {
      lenis.scrollTo(0, { immediate: true });
    }
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      if (lenisRef) lenisRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lightbox: close on Escape, lock background scroll while open.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  return (
    <div className="dp-showcase relative min-h-svh text-white font-sans">
      <AmbientBackground variant="plaster" />

      <div className="relative z-10">
        <section className="flex min-h-svh flex-col items-center justify-center px-6 py-20 text-center">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-secondary">Your style, realized</p>
          <h2 className="mb-5 font-serif text-3xl font-light sm:text-5xl md:text-6xl">
            <KineticText text="While your designer prepares your concept" trigger="inView" stagger={0.05} />
          </h2>
          <p className="mx-auto mb-8 max-w-md text-white/70">
            Here's our work — starting with <span className="text-secondary">{report.label}</span>, your style.
          </p>
          <span className="text-xs uppercase tracking-[0.2em] text-accent/70">Scroll to explore &darr;</span>
        </section>

        <section id="gallery" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 scroll-mt-20">
          {matched.length > 0 && (
            <>
              <h3 className="mb-6 text-center font-serif text-2xl sm:text-left sm:text-3xl">Projects in your style</h3>
              <div className="mb-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {matched.map((p, i) => (
                  <ProjectCard key={p.id} p={p} inStyle i={i} onOpen={() => setActive(p)} />
                ))}
              </div>
            </>
          )}
          {rest.length > 0 && (
            <>
              <h3 className="mb-6 text-center font-serif text-2xl sm:text-left sm:text-3xl">{matched.length ? 'More of our work' : 'Our work'}</h3>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((p, i) => (
                  <ProjectCard key={p.id} p={p} inStyle={false} i={i} onOpen={() => setActive(p)} />
                ))}
              </div>
            </>
          )}
        </section>

        <section id="reviews" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 scroll-mt-20">
          <h3 className="mb-8 text-center font-serif text-2xl sm:text-3xl">Loved by homeowners across Bangalore</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
                className="rounded-2xl border border-secondary/20 bg-secondary/[0.04] p-6"
              >
                <div className="mb-3 tracking-widest text-secondary">★★★★★</div>
                <p className="mb-4 text-sm leading-relaxed text-white/80">“{t.content}”</p>
                <p className="font-serif text-white">{t.name}</p>
                <p className="text-xs text-white/50">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <HowItWorks />

        <section id="contact" className="px-6 py-24 text-center scroll-mt-20">
          <h3 className="mb-4 font-serif text-3xl font-light sm:text-5xl">Let's design your home.</h3>
          <p className="mx-auto mb-8 max-w-md text-white/70">Your brief is already with our team. Want to talk now?</p>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-secondary px-9 py-4 font-medium text-main transition-transform hover:scale-105 active:scale-95"
          >
            <WhatsAppGlyph />
            Chat with your designer on WhatsApp
          </a>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
            <a href={`tel:${STUDIO_PHONE}`} className="hover:text-secondary">{STUDIO_PHONE}</a>
            <a href={`mailto:${STUDIO_EMAIL}`} className="hover:text-secondary">{STUDIO_EMAIL}</a>
            <a href={STUDIO_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="hover:text-secondary">Instagram</a>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-main"
            >
              <button
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70"
              >
                ✕
              </button>
              {active.video ? (
                <video src={active.video} poster={active.image} autoPlay loop muted playsInline controls className="block max-h-[70vh] w-full bg-black object-contain" />
              ) : (
                <img src={active.image} alt={active.title} className="block max-h-[70vh] w-full bg-black object-contain" />
              )}
              <div className="p-5 sm:p-6">
                <p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-secondary">{active.category}</p>
                <h3 className="font-serif text-2xl text-white">{active.title}</h3>
                <p className="mt-1 text-sm text-white/70">{active.description}</p>
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-medium text-main transition-transform hover:scale-105 active:scale-95"
                >
                  <WhatsAppGlyph className="h-4 w-4" />
                  Get a space like this
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
