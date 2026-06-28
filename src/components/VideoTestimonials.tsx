import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, PlayCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Testimonial {
  video: string;
  poster: string;
  name: string;
  role: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    video: "/assets/videos/testimonials/customer-story-1.mp4",
    poster: "/assets/images/testimonials/testimonial-1-poster.png",
    name: "Ajay",
    role: "Brigade Exotica",
    quote: "The team transformed our vision into reality beyond expectations"
  },
  {
    video: "/assets/videos/testimonials/customer-story-2.mp4",
    poster: "/assets/images/testimonials/testimonial-2-poster.jpg",
    name: "Praveen",
    role: "Vaishnavi North",
    quote: "It's not only spacious but fantastic in terms of how it is organized"
  }
];

export default function VideoTestimonials() {
  const [activeVideos, setActiveVideos] = useState<Set<number>>(new Set());
  const [mutedStates, setMutedStates] = useState<boolean[]>(new Array(testimonials.length).fill(true));
  const [isPlaying, setIsPlaying] = useState<boolean[]>(new Array(testimonials.length).fill(false));
  const [progress, setProgress] = useState<number[]>(new Array(testimonials.length).fill(0));
  const [hasInteracted, setHasInteracted] = useState<boolean[]>(new Array(testimonials.length).fill(false));
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate structured data for testimonials
  const testimonialsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": testimonials.map((testimonial, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5",
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": testimonial.name
        },
        "itemReviewed": {
          "@type": "LocalBusiness",
          "name": "DezignPool",
          "@id": "https://dezignpool.com",
          "image": "https://dezignpool.com/assets/images/logo.png",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Goodu. No 1, Greenvalley Cleartitle",
            "addressLocality": "Bangalore",
            "postalCode": "560100",
            "addressCountry": "IN"
          }
        },
        "reviewBody": testimonial.quote
      }
    }))
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRefs.current.forEach((video, index) => {
              if (video) {
                setActiveVideos(prev => new Set([...prev, index]));
              }
            });
          } else {
            videoRefs.current.forEach((video, index) => {
              if (video) {
                video.pause();
                setIsPlaying(prev => {
                  const newStates = [...prev];
                  newStates[index] = false;
                  return newStates;
                });
                setActiveVideos(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(index);
                  return newSet;
                });
              }
            });
          }
        });
      },
      { threshold: 0.4 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateProgress = (index: number) => {
      const video = videoRefs.current[index];
      if (video) {
        const newProgress = (video.currentTime / video.duration) * 100;
        setProgress(prev => {
          const newStates = [...prev];
          newStates[index] = newProgress;
          return newStates;
        });
      }
    };

    videoRefs.current.forEach((video, index) => {
      if (video) {
        video.addEventListener('timeupdate', () => updateProgress(index));
      }
    });

    return () => {
      videoRefs.current.forEach((video, index) => {
        if (video) {
          video.removeEventListener('timeupdate', () => updateProgress(index));
        }
      });
    };
  }, []);

  const toggleMute = (index: number) => {
    setMutedStates(prev => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

  const togglePlay = (index: number) => {
    if (playTimeoutRef.current) {
      clearTimeout(playTimeoutRef.current);
    }

    const video = videoRefs.current[index];
    if (!video) return;

    playTimeoutRef.current = setTimeout(() => {
      try {
        if (video.paused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                setIsPlaying(prev => {
                  const newStates = [...prev];
                  newStates[index] = true;
                  return newStates;
                });
              })
              .catch(error => {
                console.error('Playback error:', error);
                setIsPlaying(prev => {
                  const newStates = [...prev];
                  newStates[index] = false;
                  return newStates;
                });
              });
          }
        } else {
          video.pause();
          setIsPlaying(prev => {
            const newStates = [...prev];
            newStates[index] = false;
            return newStates;
          });
        }
        setHasInteracted(prev => {
          const newStates = [...prev];
          newStates[index] = true;
          return newStates;
        });
      } catch (error) {
        console.error('Video control error:', error);
      }
    }, 100);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      video.currentTime = (percentage / 100) * video.duration;
      setProgress(prev => {
        const newStates = [...prev];
        newStates[index] = percentage;
        return newStates;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (playTimeoutRef.current) {
        clearTimeout(playTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(testimonialsSchema)}
        </script>
      </Helmet>

      <section ref={sectionRef} className="py-24 bg-main relative overflow-hidden">
        {/* Rest of the component JSX remains exactly the same */}
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
            <h2 className="text-4xl font-serif mb-4">Client Stories</h2>
            <p className="text-xl text-accent max-w-2xl mx-auto">
              Hear directly from our clients about their journey with DezignPool
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary/10 backdrop-blur-sm border border-secondary/20 mb-6">
                  <video
                    ref={el => videoRefs.current[index] = el}
                    poster={testimonial.poster}
                    muted={mutedStates[index]}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={testimonial.video} type="video/mp4" />
                  </video>

                  <div 
                    className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-300 ${
                      isPlaying[index] ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => togglePlay(index)}
                      className="p-4 rounded-full bg-secondary/90 text-white hover:bg-secondary transition-colors"
                    >
                      <PlayCircle className="h-12 w-12" />
                    </motion.button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div 
                      className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer"
                      onClick={(e) => handleProgressClick(e, index)}
                    >
                      <div 
                        className="h-full bg-secondary rounded-full relative"
                        style={{ width: `${progress[index]}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-secondary rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-200" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => togglePlay(index)}
                        className="p-2 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-sm transition-colors"
                      >
                        {isPlaying[index] ? (
                          <Pause className="h-5 w-5 text-white" />
                        ) : (
                          <Play className="h-5 w-5 text-white" />
                        )}
                      </button>

                      <button
                        onClick={() => toggleMute(index)}
                        className="p-2 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-sm transition-colors"
                      >
                        {mutedStates[index] ? (
                          <VolumeX className="h-5 w-5 text-white" />
                        ) : (
                          <Volume2 className="h-5 w-5 text-white" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 backdrop-blur-sm rounded-xl p-6 border border-secondary/20">
                  <p className="text-white text-lg mb-4 font-medium italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-secondary text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
