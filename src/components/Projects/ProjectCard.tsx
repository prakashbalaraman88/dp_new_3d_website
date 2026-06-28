import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface ProjectCardProps {
  id: string;
  title: string;
  category: string;
  description: string;
  videoUrl: string;
  posterImage: string;
  onClick: () => void;
  onLoad: () => void;
}

const ProjectCard = ({ id, title, category, videoUrl, posterImage, onClick, onLoad }: ProjectCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    // Preload the poster image
    const img = new Image();
    img.src = posterImage;
    img.onload = () => {
      setIsImageLoaded(true);
      console.log('Poster image loaded:', posterImage);
    };
    img.onerror = () => {
      console.error('Failed to load poster image:', posterImage);
      setHasError(true);
    };
  }, [posterImage]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => setHasError(true);
    const handleLoadedData = () => {
      setHasError(false);
      onLoad();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [onLoad]);

  return (
    <motion.div
      className="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg hover-transition"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="relative w-full h-full">
        {isImageLoaded ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={posterImage}
            preload="metadata"
            playsInline
            muted
            loop
            onMouseEnter={() => {
              if (videoRef.current && !hasError) {
                videoRef.current.play().catch(() => setHasError(true));
              }
            }}
            onMouseLeave={() => {
              if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
            }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gray-800 animate-pulse" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
        <div className="absolute bottom-0 left-0 p-6">
          <h3 className="text-xl font-medium mb-2 text-white">{title}</h3>
          <p className="text-sm text-gray-300">{category}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
