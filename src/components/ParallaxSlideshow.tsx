import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

// Import images
const images = [
  {
    url: '/assets/images/project-1.png',
    speed: 0.2,
  },
  {
    url: '/assets/images/project-2.png',
    speed: -0.3,
  },
  {
    url: '/assets/images/project-3.png',
    speed: 0.4,
  },
  {
    url: '/assets/images/project-4.png',
    speed: -0.2,
  },
  {
    url: '/assets/images/project-5.png',
    speed: 0.3,
  },
  {
    url: '/assets/images/project-6.png',
    speed: -0.25,
  },
];

export default function ParallaxSlideshow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    const images = document.querySelectorAll('.parallax-image');
    images.forEach(image => observer.observe(image));

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative py-16 md:py-32 bg-main overflow-hidden"
      style={{ minHeight: 'calc(100vh - 100px)', position: 'relative' }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-light/5 rounded-full blur-3xl" />
        <div className="absolute left-1/4 top-1/4 w-12 h-12 border-2 border-secondary/20 rotate-45 animate-pulse" />
        <div className="absolute right-1/3 bottom-1/3 w-16 h-16 border-2 border-accent-light/20 rounded-full animate-pulse" />
        <div className="absolute left-2/3 top-1/2 w-8 h-8 bg-accent-dark/20 rotate-12 animate-pulse" />
      </div>
      
      {/* Image Grid */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 lg:gap-12">
          {images.map((image, index) => {
            const y = prefersReducedMotion 
              ? 0 
              : useTransform(
                  scrollYProgress,
                  [0, 1],
                  [0, image.speed * 100]
                );

            return (
              <motion.div
                key={index}
                className="relative aspect-[3/4] rounded-xl md:rounded-3xl overflow-hidden parallax-image opacity-0 translate-y-8 transition-all duration-1000 group"
                style={{ 
                  willChange: 'transform',
                  y: prefersReducedMotion ? 0 : y,
                  position: 'relative'
                }}
              >
                <div className="absolute inset-0 w-full h-full">
                  <div 
                    className="absolute -inset-4 bg-gradient-to-tr from-accent/20 to-secondary/20 opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700"
                  />
                  
                  <motion.div
                    className="relative h-full w-full transform-gpu transition-all duration-700 ease-out"
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.7 }
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`Luxury Interior ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-main/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .parallax-image {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }
        
        .parallax-image.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        @media (prefers-reduced-motion: reduce) {
          .parallax-image {
            transition: opacity 0.8s ease-out;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}