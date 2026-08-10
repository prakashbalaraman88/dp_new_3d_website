import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ParallaxSlideshow from './components/ParallaxSlideshow';
import Services from './components/Services';
import Projects from './components/Projects/index';
import WhyUs from './components/WhyUs';
import Team from './components/Team';
import Testimonials from './components/Testimonials';
import VideoTestimonials from './components/VideoTestimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import IllustratedSection from './components/IllustratedSection';
import About from './pages/About';
import ServicesPage from './pages/Services';
import ScrollToTop from './components/ScrollToTop';
import SEO from './components/SEO';
import Breadcrumbs from './components/Breadcrumbs';
import FAQ from './components/FAQ';
import AnalyticsConsentBanner from './components/AnalyticsConsentBanner';
import Privacy from './pages/Privacy';

// 3D scroll experience is heavy (Three.js) — load it only when its route is visited.
const HeroExperience = lazy(() => import('./experience/HeroExperience'));
const VideoExperience = lazy(() => import('./experience/VideoExperience'));
const JourneyExperience = lazy(() => import('./discover/JourneyExperience'));
// Calculator suite is heavy (Firebase and PDF generation) — lazy-load per route.
const Calculator = lazy(() => import('./pages/Calculator'));
const InteriorCalculator = lazy(() => import('./pages/InteriorCalculator'));
const ProjectDetail = lazy(() => import('./components/Projects/ProjectDetail'));
const ChatWidget = lazy(() => import('./components/ChatWidget'));
const BlogIndex = lazy(() => import('./pages/Blog/BlogIndex'));
const BlogArticle = lazy(() => import('./pages/Blog/BlogArticle'));

function HomePage() {
  const heroVideoUrl = '/assets/videos/hero-video.mp4';
  return (
    <>
      <Hero videoUrl={heroVideoUrl} />
      <ParallaxSlideshow />
      <IllustratedSection
        image="/assets/images/illustrated-kitchen.png"
        title="Where Imagination Meets Reality"
        description="At DezignPool, we don't just design spaces – we craft experiences that make your neighbors question their life choices. Our designs blend innovative architecture with timeless aesthetics, because why settle for ordinary when you can have extraordinary?"
        alt="Modern luxury kitchen design"
      />
      <Services />
      <Projects />
      <VideoTestimonials />
      <WhyUs />
      <Team />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}

function SiteLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Breadcrumbs />
      <Outlet />
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router future={{ v7_startTransition: true }}>
        <ScrollToTop />
        <SEO />
        <Suspense fallback={<div className="min-h-screen bg-main" />}>
          <Routes future={{ v7_relativeSplatPath: true }}>
            <Route path="/" element={<JourneyExperience />} />
            <Route path="/discover" element={<JourneyExperience />} />
            <Route path="/experience" element={<HeroExperience />} />
            <Route path="/experience-video" element={<VideoExperience />} />
            <Route element={<SiteLayout />}>
              <Route path="/classic" element={<HomePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/interior-calculator" element={<InteriorCalculator />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
            </Route>
          </Routes>
        </Suspense>
        <AnalyticsConsentBanner />
      </Router>
    </HelmetProvider>
  );
}
