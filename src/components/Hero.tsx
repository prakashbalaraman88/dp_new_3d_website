import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProjectForm from './ProjectForm';

interface HeroProps {
  videoUrl?: string;
}

export default function Hero({ videoUrl }: HeroProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (titleRef.current) observer.observe(titleRef.current);
    if (textRef.current) observer.observe(textRef.current);
    if (buttonsRef.current) observer.observe(buttonsRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
      });
    }
  }, []);

  const posterImage = "/assets/images/poster-image.jpg";
  const thumbnailImage = "/assets/images/thumbnail-image.jpg";

  return (
    <>
      <section id="home" className="relative h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {videoUrl ? (
            <div className="relative w-full h-full">
              {/* Blur placeholder */}
              <img
                src={thumbnailImage}
                alt="Loading..."
                className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-500 ${isVideoLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{ filter: 'blur(10px)' }}
              />
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                className={`w-full h-full object-cover scale-105 animate-slowZoom transition-opacity duration-500 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                poster={posterImage}
                preload="auto"
              >
                <source src={videoUrl} type="video/mp4" />
                <img
                  src={posterImage}
                  className="w-full h-full object-cover"
                  alt="DezignPool Hero"
                  width="1920"
                  height="1080"
                  loading="eager"
                />
              </video>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <img
                src={thumbnailImage}
                alt="Loading..."
                className="absolute inset-0 w-full h-full object-cover scale-105"
                style={{ filter: 'blur(10px)' }}
              />
              <img
                src={posterImage}
                className="w-full h-full object-cover scale-105 animate-slowZoom"
                alt="DezignPool Hero"
                width="1920"
                height="1080"
                loading="eager"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-main/80" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center">
          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-serif leading-tight mb-6 opacity-0 translate-y-8 transition-all duration-1000 delay-500"
          >
            Not Just Spaces,<br />
            <span className="text-secondary inline-block hover:scale-105 transition-transform duration-300">
              Living Masterpieces
            </span>
          </h1>
          <p 
            ref={textRef}
            className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-white/90 opacity-0 translate-y-8 transition-all duration-1000 delay-700"
          >
            Because mediocrity is so last season. We create spaces that make your guests gasp, your Instagram followers double-tap, and your neighbors develop a healthy dose of real estate envy.
          </p>
          <div 
            ref={buttonsRef}
            className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 translate-y-8 transition-all duration-1000 delay-900"
          >
            <button
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center justify-center px-8 py-3 bg-secondary text-main rounded-md hover:bg-secondary-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg group"
            >
              Elevate Your Space
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
            <a
              href="#projects"
              className="inline-flex items-center justify-center px-8 py-3 bg-accent/20 backdrop-blur-sm text-white rounded-md hover:bg-accent/30 transition-all duration-300 border border-accent/20 transform hover:scale-105 hover:shadow-lg"
            >
              Feast Your Eyes
            </a>
          </div>
        </div>
      </section>

      <ProjectForm 
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </>
  );
}