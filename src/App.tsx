import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
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
import LoadingScreen from './components/LoadingScreen';
import IllustratedSection from './components/IllustratedSection';
import About from './pages/About';
import ServicesPage from './pages/Services';
import ScrollToTop from './components/ScrollToTop';
import SEO from './components/SEO';
import Breadcrumbs from './components/Breadcrumbs';
import FAQ from './components/FAQ';

// 3D scroll experience is heavy (Three.js) — load it only when its route is visited.
const HeroExperience = lazy(() => import('./experience/HeroExperience'));
const VideoExperience = lazy(() => import('./experience/VideoExperience'));
const JourneyExperience = lazy(() => import('./discover/JourneyExperience'));
// Calculator suite is heavy (firebase / jspdf / xlsx / openai) — lazy-load per route.
const Calculator = lazy(() => import('./pages/Calculator'));
const InteriorCalculator = lazy(() => import('./pages/InteriorCalculator'));
const ProjectDetail = lazy(() => import('./components/Projects/ProjectDetail'));
const ChatWidget = lazy(() => import('./components/ChatWidget'));

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
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowContent(true), 100);
    }, 2500);

    return () => clearTimeout(loadingTimer);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen />}
      <div className={`min-h-screen transition-opacity duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
        <Navbar />
        <Breadcrumbs />
        <Outlet />
        <Footer />
        <ChatWidget />
      </div>
    </>
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
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/interior-calculator" element={<InteriorCalculator />} />
              <Route path="/project/:id" element={<ProjectDetail />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}
