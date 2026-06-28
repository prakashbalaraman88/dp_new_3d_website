import { motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';

const fallbackProjects = [
  {
    id: 'phoenix-kessaku',
    title: "Phoenix Kessaku",
    category: "Luxury Residential",
    description: "Modern 3BHK with Japanese minimalist design",
    video: "/assets/videos/project-1.mp4",
    poster: "/assets/images/project-1.png"
  },
  {
    id: 'brigade-exotica',
    title: "Brigade Exotica",
    category: "Modern Minimalism",
    description: "Sophisticated 3BHK with panoramic views",
    video: "/assets/videos/project-2.mp4",
    poster: "/assets/images/project-2.png"
  },
  {
    id: 'prestige-golf-view',
    title: "Prestige Golf View",
    category: "Sustainable Luxury",
    description: "Eco-conscious 4BHK villa with premium finishes",
    video: "/assets/videos/project-3.mp4",
    poster: "/assets/images/project-3.png"
  },
  {
    id: 'contemporary-villa',
    title: "Urban Oasis",
    category: "Contemporary Living",
    description: "Luxurious living space with seamless indoor-outdoor flow",
    video: "/assets/videos/project-4.mp4",
    poster: "/assets/images/project-4.png"
  },
  {
    id: 'heritage-modern',
    title: "Modern Grandeur",
    category: "Luxury Living",
    description: "Sophisticated spaces with timeless elegance",
    video: "/assets/videos/project-5.mp4",
    poster: "/assets/images/project-5.png"
  },
  {
    id: 'luxury-penthouse',
    title: "Skyline Sanctuary",
    category: "Luxury Penthouse",
    description: "Opulent penthouse with panoramic city views",
    video: "/assets/videos/project-6.mp4",
    poster: "/assets/images/project-6.png"
  }
];

interface VideoPlayerProps {
  src: string;
  poster: string;
  onLoad?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, poster, onLoad }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Ensure video is muted for autoplay to work
    video.muted = true;

    // Initialize IntersectionObserver with more aggressive thresholds
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        const isIntersecting = entry.isIntersecting;
        setIsVisible(isIntersecting);

        if (isIntersecting) {
          // Try to play when element comes into view
          video.play()
            .then(() => {
              // Ensure video stays playing
              if (!video.paused) return;
              video.play();
            })
            .catch((error) => {
              console.warn('Autoplay failed:', error);
              // Try again with user gesture
              container.addEventListener('click', () => video.play(), { once: true });
            });
        } else {
          // Pause when out of view
          video.pause();
          video.currentTime = 0;
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: [0, 0.1, 0.5, 1] // Multiple thresholds for better detection
      }
    );

    // Start observing
    observer.observe(container);

    // Set up video
    video.load();
    if (onLoad) onLoad();

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [onLoad]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        autoPlay
        preload="auto" // Changed to auto for better mobile performance
        poster={poster}
        webkit-playsinline="true"
        disablePictureInPicture // Prevent PiP on mobile
        controls={false} // Ensure controls don't interfere
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default function Projects() {
  const [loadedVideos, setLoadedVideos] = useState<Set<string>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleVideoLoad = (id: string) => {
    setLoadedVideos(prev => new Set(prev).add(id));
  };

  // Generate structured data for projects
  const projectsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": fallbackProjects.map((project, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "CreativeWork",
        "name": project.title,
        "description": project.description,
        "image": project.poster,
        "video": project.video,
        "creator": {
          "@type": "Organization",
          "name": "DezignPool",
          "@id": "https://dezignpool.com"
        }
      }
    }))
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(projectsSchema)}
        </script>
        {fallbackProjects.map(project => (
          <link 
            key={project.id} 
            rel="preload" 
            as="video" 
            href={project.video} 
            type="video/mp4"
            crossOrigin="anonymous"
          />
        ))}
      </Helmet>

      <section id="projects" className="py-24 bg-main relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-serif mb-4"
            >
              Our Masterpieces
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-accent max-w-2xl mx-auto"
            >
              A gallery of spaces that make Pinterest boards look like amateur hour
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {fallbackProjects.map((project, index) => {
              const isHovered = hoveredIndex === index;
              
              return (
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
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                    <motion.div
                      className="relative h-full transform-gpu transition-all duration-700 ease-out"
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.7 }
                      }}
                    >
                      <VideoPlayer
                        src={project.video}
                        poster={project.poster}
                        onLoad={() => handleVideoLoad(project.id)}
                      />
                      
                      <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent transition-opacity duration-700 ${
                          isHovered ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                      
                      <div 
                        className={`absolute inset-x-0 bottom-0 p-6 transition-opacity duration-500 ${
                          isHovered ? 'opacity-0' : 'opacity-100'
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
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};
