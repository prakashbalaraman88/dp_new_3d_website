import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import type { ProjectImage } from './data';

interface ProjectGalleryProps {
  images: ProjectImage[];
  title: string;
}

export default function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();

  const navigateImage = (direction: 'previous' | 'next') => {
    setSelectedImageIndex((current) => {
      if (current === null) return current;
      return direction === 'previous'
        ? (current - 1 + images.length) % images.length
        : (current + 1) % images.length;
    });
  };

  useEffect(() => {
    if (selectedImageIndex === null) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedImageIndex(null);
      if (event.key === 'ArrowLeft') navigateImage('previous');
      if (event.key === 'ArrowRight') navigateImage('next');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedImageIndex]);

  const selectedImage = selectedImageIndex === null ? null : images[selectedImageIndex];

  return (
    <>
      <div className="dp-project-gallery" aria-label={`${title} project photography`}>
        {images.map((image, index) => (
          <motion.button
            type="button"
            key={image.src}
            className="dp-project-gallery__item"
            style={{ aspectRatio: `${image.width} / ${image.height}` }}
            initial={reducedMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.08 }}
            transition={{ duration: reducedMotion ? 0 : 0.75, delay: Math.min(index * 0.035, 0.2) }}
            onClick={() => setSelectedImageIndex(index)}
            aria-label={`Open photograph ${index + 1} of ${images.length}: ${image.alt}`}
          >
            <img
              src={image.preview}
              alt={image.alt}
              width={image.width}
              height={image.height}
              loading={index < 2 ? 'eager' : 'lazy'}
              decoding="async"
            />
            <span className="dp-project-gallery__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="dp-project-gallery__expand" aria-hidden="true"><Expand size={17} /></span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && selectedImageIndex !== null && (
          <motion.div
            className="dp-project-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} photograph ${selectedImageIndex + 1} of ${images.length}`}
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setSelectedImageIndex(null);
            }}
          >
            <div className="dp-project-lightbox__bar">
              <span>{String(selectedImageIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setSelectedImageIndex(null)}
                aria-label="Close gallery"
              >
                Close <X size={18} />
              </button>
            </div>

            <motion.img
              key={selectedImage.src}
              src={selectedImage.src}
              alt={selectedImage.alt}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.35 }}
            />

            <button
              type="button"
              className="dp-project-lightbox__nav is-previous"
              onClick={() => navigateImage('previous')}
              aria-label="Previous photograph"
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              className="dp-project-lightbox__nav is-next"
              onClick={() => navigateImage('next')}
              aria-label="Next photograph"
            >
              <ChevronRight />
            </button>

            <p>{selectedImage.alt}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
