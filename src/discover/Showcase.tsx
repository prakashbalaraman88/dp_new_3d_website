import { useEffect, useMemo, type MutableRefObject, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type Lenis from 'lenis';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import Projects from '../components/Projects/index';
import Services from '../components/Services';
import Team from '../components/Team';
import VideoTestimonials from '../components/VideoTestimonials';
import WhyUs from '../components/WhyUs';
import type { ScrollBridge } from '../experience/scrollBridge';
import LeadForm from './LeadForm';
import { buildReport, type Answers, type DesignReport } from './report';
import './showcase.css';

const MASTER_EASE: [number, number, number, number] = [0.625, 0.05, 0, 1];

function SiteSection({
  id,
  children,
  reducedMotion,
}: {
  id?: string;
  children: ReactNode;
  reducedMotion: boolean | null;
}) {
  return (
    <motion.div
      id={id}
      className="dp-showcase-section scroll-mt-20"
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.04 }}
      transition={{ duration: reducedMotion ? 0 : 0.9, ease: MASTER_EASE }}
    >
      {children}
    </motion.div>
  );
}

function StyleReport({ report }: { report: DesignReport }) {
  const signals = [...report.materials.slice(0, 4), ...report.motifs.slice(0, 3)];

  return (
    <section id="style-report" className="dp-report scroll-mt-20" aria-labelledby="style-report-title">
      <div className="dp-report__header">
        <div>
          <p className="dp-site__eyebrow">Your design direction</p>
          <h1 id="style-report-title">
            Quietly yours. <em>{report.primaryStyle.label}</em>
          </h1>
        </div>
        <p>{report.tagline}</p>
      </div>

      <div className="dp-report__layout">
        <div className="dp-report__montage" aria-label={`${report.primaryStyle.label} inspiration`}>
          {report.primaryStyle.montage.slice(0, 6).map((image, index) => (
            <figure key={image}>
              <img
                src={image}
                alt={`${report.primaryStyle.label} interior inspiration ${index + 1}`}
                loading={index > 1 ? 'lazy' : 'eager'}
              />
            </figure>
          ))}
        </div>

        <aside className="dp-report__card">
          <p className="dp-site__eyebrow">Primary expression</p>
          <h2>{report.primaryStyle.label}</h2>
          <p>{report.primaryStyle.essence}</p>

          <div className="dp-report__palette" aria-label="Suggested palette">
            {report.primaryStyle.palette.map((color) => (
              <span key={color} style={{ backgroundColor: color }} title={color} />
            ))}
          </div>

          <div className="dp-report__secondary">
            <span>Complementary note</span>
            <strong>{report.secondaryStyle.label}</strong>
          </div>

          {signals.length > 0 && (
            <div className="dp-report__signals" aria-label="Your material and motif signals">
              {signals.map((signal) => <span key={signal}>{signal}</span>)}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default function Showcase({
  answers,
  showStyleReport,
  initialSection,
  lenisRef,
  scrollBridge,
}: {
  answers: Answers;
  showStyleReport: boolean;
  initialSection?: string | null;
  lenisRef?: MutableRefObject<Lenis | null>;
  scrollBridge?: ScrollBridge | null;
}) {
  const reducedMotion = useReducedMotion();
  const report = useMemo(() => buildReport(answers), [answers]);

  useEffect(() => {
    const lenis = scrollBridge?.lenis ?? null;
    if (lenisRef) lenisRef.current = lenis;
    scrollBridge?.start();

    const frame = requestAnimationFrame(() => {
      if (lenis) {
        lenis.scrollTo(initialSection ? `#${initialSection}` : 0, {
          immediate: true,
          ...(initialSection ? { offset: -64 } : {}),
        });
      } else if (initialSection) {
        document.getElementById(initialSection)?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
      if (lenisRef) lenisRef.current = null;
    };
  }, [initialSection, lenisRef, scrollBridge]);

  return (
    <main className="dp-showcase-site">
      {showStyleReport && (
        <SiteSection reducedMotion={reducedMotion}>
          <StyleReport report={report} />
        </SiteSection>
      )}

      <SiteSection id="gallery" reducedMotion={reducedMotion}>
        <Projects />
      </SiteSection>
      <SiteSection reducedMotion={reducedMotion}>
        <Services />
      </SiteSection>
      <SiteSection id="about" reducedMotion={reducedMotion}>
        <WhyUs />
      </SiteSection>
      <SiteSection id="reviews" reducedMotion={reducedMotion}>
        <VideoTestimonials />
      </SiteSection>
      <SiteSection reducedMotion={reducedMotion}>
        <Team />
      </SiteSection>
      <SiteSection reducedMotion={reducedMotion}>
        <FAQ />
      </SiteSection>
      <SiteSection id="contact" reducedMotion={reducedMotion}>
        <LeadForm answers={answers} />
      </SiteSection>
      <Footer />
    </main>
  );
}
