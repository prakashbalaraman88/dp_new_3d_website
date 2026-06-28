import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import images
const images = [
  {
    url: '/assets/images/project-1.png',
    alt: 'Luxury Interior 1',
  },
  {
    url: '/assets/images/project-2.png',
    alt: 'Luxury Interior 2',
  },
  {
    url: '/assets/images/project-3.png',
    alt: 'Luxury Interior 3',
  },
  {
    url: '/assets/images/project-4.png',
    alt: 'Luxury Interior 4',
  },
  {
    url: '/assets/images/project-5.png',
    alt: 'Luxury Interior 5',
  },
  {
    url: '/assets/images/project-6.png',
    alt: 'Luxury Interior 6',
  },
];

interface CarouselItemProps {
  src: string;
  alt: string;
  rotation: number;
  zIndex: number;
  opacity: number;
  scale: number;
  onClick: () => void;
  isMobile: boolean;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ 
  src, 
  alt, 
  rotation, 
  zIndex, 
  opacity, 
  scale,
  onClick,
  isMobile
}) => {
  // Calculate x-offset with larger values for mobile to show card edges
  const xOffset = rotation > 0 
    ? Math.min(rotation * 2.5, 400) 
    : Math.max(rotation * 2.5, -400);
    
  // Reduce the rotation effect on mobile to keep cards more visible
  const mobileRotation = isMobile ? rotation * 0.5 : rotation;
  
  return (
    <motion.div
      className="carousel-item absolute transform-gpu"
      animate={{
        rotateY: mobileRotation,
        x: xOffset, // Enhanced x-offset for better visibility of adjacent cards
        zIndex,
        opacity,
        scale,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center -650px', // Same large distance for spread
      }}
      onClick={onClick}
      whileHover={{ 
        scale: scale * 1.05,
        transition: { duration: 0.2 }
      }}
    >
      <div className="image-container relative aspect-[3/4] w-64 md:w-96 overflow-hidden rounded-xl shadow-lg">
        <div className="absolute inset-0">
          <img 
            src={src} 
            alt={alt} 
            className="w-full h-full object-cover"
            draggable="false"
          />
        </div>
        
        {/* Glossy reflection overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-60 pointer-events-none" />
        
        {/* Edge highlight */}
        <div className="absolute inset-0 border border-white/10 rounded-xl pointer-events-none" />
      </div>
    </motion.div>
  );
};

function FloatingGallery3D() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [hoverNav, setHoverNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle auto rotation
  useEffect(() => {
    let intervalId: number | undefined;
    
    if (autoRotate && !isDragging) {
      intervalId = window.setInterval(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 3000);
    }
    
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [autoRotate, isDragging]);

  // Handle rotation
  const rotateLeft = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const rotateRight = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  // Calculate the positions of all items
  const getItemStyles = (index: number) => {
    // Calculate the angle based on the active index and this item's index
    const totalItems = images.length;
    // Reduce angle step more aggressively for a flatter arrangement
    const angleStep = (360 / totalItems) * 0.6; 
    
    // Calculate the difference between this item's index and the active index
    let indexDiff = index - activeIndex;
    
    // Ensure we get the shortest path around the circle
    if (indexDiff > totalItems / 2) {
      indexDiff -= totalItems;
    } else if (indexDiff < -totalItems / 2) {
      indexDiff += totalItems;
    }
    
    // Calculate rotation
    const rotation = indexDiff * angleStep;
    
    // Calculate z-index (items in front have higher z-index)
    const isActive = index === activeIndex;
    const isAdjacent = Math.abs(indexDiff) === 1;
    const isFront = Math.abs(rotation) < 90;
    
    // Higher z-index for active and adjacent items to ensure visibility
    const zIndex = isActive ? 30 : isAdjacent ? 25 : isFront ? 20 : 10;
    
    // Calculate opacity - keep adjacent items more visible on mobile
    const opacity = isActive ? 1 : 
                   isAdjacent && isMobile ? 0.9 : 
                   isFront ? 0.8 : 0.6;
    
    // Calculate scale - make active item larger but still show adjacent ones
    const scale = isActive ? 1.1 : 
                 isAdjacent && isMobile ? 0.9 : 0.85;
    
    return { rotation, zIndex, opacity, scale };
  };

  // Handle mouse/touch events for dragging with enhanced sensitivity for mobile
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    setAutoRotate(false);
    
    // Get the initial position
    if ('touches' in e) {
      setStartX(e.touches[0].clientX);
    } else {
      setStartX(e.clientX);
    }
  };
  
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    // Get the current position
    const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    
    // Use lower threshold for swipe on mobile
    const threshold = 'touches' in e ? 30 : 50;
    
    // If the drag is significant, rotate the carousel
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        rotateLeft();
      } else {
        rotateRight();
      }
      
      // Reset the start position
      setStartX(currentX);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => setAutoRotate(true), 5000); // Resume auto-rotation after 5 seconds
  };

  // Select a specific item
  const handleItemClick = (index: number) => {
    if (index === activeIndex) {
      // Handle click on active item (e.g., show fullscreen view)
      console.log(`Selected item: ${images[index].alt}`);
    } else {
      // Set clicked item as active
      setActiveIndex(index);
    }
  };
  
  useEffect(() => {
    // Animate progress indicator when activeIndex changes
    if (progressRef.current) {
      const progress = (activeIndex / (images.length - 1)) * 100;
      progressRef.current.style.width = `${progress}%`;
    }
  }, [activeIndex, images.length]);

  return (
    <section className="relative py-12 md:py-20 bg-main overflow-hidden">
      <div className="container-fluid mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl font-serif text-center mb-8 md:mb-12"
        >
          Our Featured Designs
        </motion.h2>
        
        <div className="flex flex-col justify-center items-center">
          {/* 3D Carousel Container */}
          <div 
            ref={carouselRef}
            className="carousel-container relative h-[460px] md:h-[600px] w-full vw-100 mb-10 px-6 md:px-0"
            style={{ 
              perspective: '1600px',
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <div 
              className="carousel-items-wrapper absolute inset-0 flex justify-center items-center"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {images.map((image, index) => {
                const { rotation, zIndex, opacity, scale } = getItemStyles(index);
                return (
                  <CarouselItem
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    rotation={rotation}
                    zIndex={zIndex}
                    opacity={opacity}
                    scale={scale}
                    onClick={() => handleItemClick(index)}
                    isMobile={isMobile}
                  />
                );
              })}
            </div>
          </div>
            
          {/* Navigation Controls - Luxury style */}
          <motion.div 
            className="carousel-navigation mt-10 relative max-w-2xl w-full mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            onMouseEnter={() => setHoverNav(true)}
            onMouseLeave={() => setHoverNav(false)}
          >
            {/* Progress bar */}
            <div className="h-[2px] w-full bg-gray-700 relative overflow-hidden">
              <motion.div 
                ref={progressRef}
                className="h-full bg-white absolute left-0 top-0"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(activeIndex / (images.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            
            {/* Indicator points */}
            <div className="flex items-center justify-between absolute -top-2 w-full">
              {images.map((_, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;
                
                return (
                  <motion.button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className="group relative focus:outline-none"
                    aria-label={`Go to slide ${index + 1}`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div 
                      className={`w-4 h-4 rounded-full flex items-center justify-center relative z-10
                        ${isActive ? 'bg-white' : isPast ? 'bg-gray-400' : 'bg-gray-600'}`}
                      animate={{ 
                        scale: isActive ? 1 : 0.7,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 1)' : 
                                       isPast ? 'rgba(180, 180, 180, 1)' : 
                                       'rgba(80, 80, 80, 1)'
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 bg-white rounded-full"
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.6, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                          style={{ opacity: 0.3 }}
                        />
                      )}
                    </motion.div>
                    
                    <motion.div
                      className="absolute top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={{ y: 10, opacity: 0 }}
                      whileHover={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-xs text-white/80 whitespace-nowrap px-2 py-1 bg-gray-800/80 backdrop-blur-sm rounded-md">
                        {`${index + 1}`}
                      </span>
                    </motion.div>
                  </motion.button>
                );
              })}
            </div>
            
            {/* Arrow Controls */}
            <div className="flex justify-between mt-8 px-1">
              <motion.button
                className="group flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                onClick={rotateLeft}
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div
                  animate={{ x: hoverNav ? -4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                </motion.div>
                <motion.span
                  className="text-sm uppercase tracking-widest opacity-0"
                  animate={{ opacity: hoverNav ? 0.9 : 0, x: hoverNav ? 0 : -10 }}
                  transition={{ duration: 0.3 }}
                >
                  Prev
                </motion.span>
              </motion.button>
              
              <motion.button
                className="group flex items-center text-gray-400 hover:text-white transition-colors focus:outline-none"
                onClick={rotateRight}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.span
                  className="text-sm uppercase tracking-widest opacity-0"
                  animate={{ opacity: hoverNav ? 0.9 : 0, x: hoverNav ? 0 : 10 }}
                  transition={{ duration: 0.3 }}
                >
                  Next
                </motion.span>
                <motion.div
                  animate={{ x: hoverNav ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-5 h-5 ml-1" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-accent-light/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-secondary/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}

export default FloatingGallery3D;
