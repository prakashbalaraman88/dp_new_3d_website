import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, []);

  // Sparkle positions for the animation
  const sparkles = [
    { x: '20%', y: '20%', delay: 0 },
    { x: '80%', y: '30%', delay: 0.2 },
    { x: '40%', y: '70%', delay: 0.4 },
    { x: '70%', y: '60%', delay: 0.6 },
    { x: '30%', y: '40%', delay: 0.8 },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-md px-8 relative">
        {/* Animated sparkles */}
        {sparkles.map((sparkle, index) => (
          <motion.div
            key={index}
            className="absolute"
            style={{ left: sparkle.x, top: sparkle.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="h-6 w-6 text-secondary" />
          </motion.div>
        ))}

        {/* Loading caption */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-serif text-secondary mb-2">Loading Dreams</h2>
          <p className="text-accent text-sm">Where imagination takes form</p>
        </motion.div>

        {/* Logo */}
        <div className="flex justify-center mb-12">
          <motion.img 
            src="https://res.cloudinary.com/dnu3ijmha/image/upload/v1731918485/1-01_gqois3.png"
            alt="DezignPool Logo"
            className="h-32 w-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1.1, 1],
              opacity: 1
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              times: [0, 0.7, 1]
            }}
            style={{
              imageRendering: 'auto',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden'
            }}
          />
        </div>

        {/* Progress bar */}
        <div className="relative">
          <motion.div 
            className="h-[2px] bg-white/10 overflow-hidden rounded-full"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="absolute left-0 top-0 h-full bg-secondary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
          <motion.div 
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="font-serif text-secondary text-xl">{progress}%</span>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}