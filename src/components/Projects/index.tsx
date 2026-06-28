import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { projects } from './data';

export default function Projects() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean[]>(new Array(projects.length).fill(false));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const observers = videoRefs.current.map((videoRef, index) => {
      if (!videoRef) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsIntersecting(prev => {
              const newState = [...prev];
              newState[index] = entry.isIntersecting;
              return newState;
            });

            if (entry.isIntersecting && hoveredIndex === index) {
              videoRef?.play().catch(() => {});
            } else {
              videoRef?.pause();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(videoRef);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, [hoveredIndex]);

  const handleMouseEnter = (index: number) => {
    if (!isMobile && videoRefs.current[index] && isIntersecting[index]) {
      videoRefs.current[index]?.play().catch(() => {});
    }
    setHoveredIndex(index);
  };

  const handleMouseLeave = (index: number) => {
    if (!isMobile && videoRefs.current[index]) {
      videoRefs.current[index]?.pause();
      if (videoRefs.current[index]) {
        videoRefs.current[index]!.currentTime = 0;
      }
    }
    setHoveredIndex(null);
  };

  return (
    <section id="projects" className="py-24 bg-main relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-serif mb-4">Our Masterpieces</h2>
          <p className="text-xl text-accent max-w-2xl mx-auto">
            A gallery of spaces that make Pinterest boards look like amateur hour
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.8,
                  delay: index * 0.1 
                }
              }}
              viewport={{ once: true, margin: "-100px" }}
              className="group"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <motion.div
                  className="relative h-full transform-gpu transition-all duration-700 ease-out"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.7 }
                  }}
                >
                  <video
                    ref={el => videoRefs.current[index] = el}
                    poster={project.image}
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={project.video} type="video/mp4" />
                  </video>
                  
                  <div 
                    className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-700 ${
                      hoveredIndex === index ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                  
                  <div 
                    className={`absolute inset-x-0 bottom-0 p-6 transition-opacity duration-500 ${
                      hoveredIndex === index ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    <div className="bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <h3 className="text-2xl font-serif mb-1 text-white font-bold">{project.title}</h3>
                      <p className="text-white/90 font-medium mb-1">{project.category}</p>
                      <p className="text-white/80 text-sm">{project.description}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}