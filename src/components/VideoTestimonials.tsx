import { motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, Quote, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import './VideoTestimonials.css';

interface Testimonial {
  video: string;
  poster: string;
  name: string;
  role: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    video: '/assets/videos/testimonials/customer-story-1.mp4',
    poster: '/assets/images/testimonials/testimonial-1-poster.png',
    name: 'Ajay',
    role: 'Brigade Exotica',
    quote: 'The team transformed our vision into reality beyond expectations',
  },
  {
    video: '/assets/videos/testimonials/customer-story-2.mp4',
    poster: '/assets/images/testimonials/testimonial-2-poster.jpg',
    name: 'Praveen',
    role: 'Vaishnavi North',
    quote: "It's not only spacious but fantastic in terms of how it is organized",
  },
];

const MASTER_EASE: [number, number, number, number] = [0.625, 0.05, 0, 1];

export default function VideoTestimonials() {
  const reducedMotion = useReducedMotion();
  const [mutedStates, setMutedStates] = useState(() => testimonials.map(() => true));
  const [isPlaying, setIsPlaying] = useState(() => testimonials.map(() => false));
  const [progress, setProgress] = useState(() => testimonials.map(() => 0));
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const intersectionRatios = useRef(testimonials.map(() => 0));
  const activeIndex = useRef<number | null>(null);

  const testimonialsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: testimonials.map((testimonial, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: testimonial.name,
        },
        itemReviewed: {
          '@type': 'LocalBusiness',
          name: 'DezignPool',
          '@id': 'https://dezignpool.com',
          image: 'https://dezignpool.com/assets/images/logo.png',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Goodu. No 1, Greenvalley Cleartitle',
            addressLocality: 'Bangalore',
            postalCode: '560100',
            addressCountry: 'IN',
          },
        },
        reviewBody: testimonial.quote,
      },
    })),
  };

  const updatePlayingState = useCallback((playingIndex: number | null) => {
    setIsPlaying(testimonials.map((_, index) => index === playingIndex));
  }, []);

  const pauseAll = useCallback(() => {
    videoRefs.current.forEach((video) => video?.pause());
    activeIndex.current = null;
    updatePlayingState(null);
  }, [updatePlayingState]);

  const playExclusive = useCallback(async (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    videoRefs.current.forEach((candidate, candidateIndex) => {
      if (candidateIndex !== index) candidate?.pause();
    });

    activeIndex.current = index;

    try {
      await video.play();
      updatePlayingState(index);
    } catch {
      if (activeIndex.current === index) activeIndex.current = null;
      updatePlayingState(null);
    }
  }, [updatePlayingState]);

  useEffect(() => {
    const cleanups = videoRefs.current.map((video, index) => {
      if (!video) return () => undefined;

      const updateProgress = () => {
        const nextProgress = Number.isFinite(video.duration) && video.duration > 0
          ? (video.currentTime / video.duration) * 100
          : 0;

        setProgress((current) => {
          const next = [...current];
          next[index] = nextProgress;
          return next;
        });
      };

      const syncPlayState = () => {
        setIsPlaying((current) => {
          const next = [...current];
          next[index] = !video.paused;
          return next;
        });
      };

      video.addEventListener('timeupdate', updateProgress);
      video.addEventListener('play', syncPlayState);
      video.addEventListener('pause', syncPlayState);

      return () => {
        video.removeEventListener('timeupdate', updateProgress);
        video.removeEventListener('play', syncPlayState);
        video.removeEventListener('pause', syncPlayState);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      pauseAll();
      return undefined;
    }

    const syncMostVisibleVideo = () => {
      if (document.hidden) {
        pauseAll();
        return;
      }

      const mostVisible = intersectionRatios.current.reduce(
        (best, ratio, index) => ratio > best.ratio ? { index, ratio } : best,
        { index: -1, ratio: 0 },
      );

      if (mostVisible.ratio < 0.46) {
        pauseAll();
        return;
      }

      const video = videoRefs.current[mostVisible.index];
      if (activeIndex.current !== mostVisible.index || video?.paused) {
        void playExclusive(mostVisible.index);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number((entry.target as HTMLElement).dataset.testimonialIndex);
          if (Number.isInteger(index)) {
            intersectionRatios.current[index] = entry.isIntersecting ? entry.intersectionRatio : 0;
          }
        });
        syncMostVisibleVideo();
      },
      { threshold: [0, 0.25, 0.46, 0.65, 0.85] },
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });
    document.addEventListener('visibilitychange', syncMostVisibleVideo);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncMostVisibleVideo);
      pauseAll();
    };
  }, [pauseAll, playExclusive, reducedMotion]);

  const togglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      void playExclusive(index);
      return;
    }

    video.pause();
    if (activeIndex.current === index) activeIndex.current = null;
    updatePlayingState(null);
  };

  const toggleMute = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMutedStates((current) => {
      const next = [...current];
      next[index] = nextMuted;
      return next;
    });

    if (!nextMuted && video.paused) void playExclusive(index);
  };

  const seekVideo = (event: React.MouseEvent<HTMLButtonElement>, index: number) => {
    const video = videoRefs.current[index];
    if (!video || !Number.isFinite(video.duration)) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const percentage = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    video.currentTime = percentage * video.duration;
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(testimonialsSchema)}</script>
      </Helmet>

      <section className="dp-video-testimonials" aria-labelledby="client-stories-title">
        <div className="dp-video-testimonials__glow" aria-hidden="true" />
        <div className="dp-video-testimonials__shell">
          <motion.header
            className="dp-video-testimonials__header"
            initial={reducedMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reducedMotion ? 0 : 0.85, ease: MASTER_EASE }}
          >
            <div>
              <p>In their words · Client films</p>
              <h2 id="client-stories-title">Homes remembered.<br /><em>Stories shared.</em></h2>
            </div>
            <p className="dp-video-testimonials__intro">
              Two families reflect on the small decisions, thoughtful details and collaboration
              that transformed their homes.
            </p>
          </motion.header>

          <div className="dp-video-testimonials__list">
            {testimonials.map((testimonial, index) => (
              <motion.article
                key={testimonial.name}
                ref={(node) => { cardRefs.current[index] = node; }}
                data-testimonial-index={index}
                className={`dp-video-testimonial ${index % 2 ? 'is-reversed' : ''} ${isPlaying[index] ? 'is-playing' : ''}`}
                initial={reducedMotion ? false : { opacity: 0, y: 42 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.16 }}
                transition={{ duration: reducedMotion ? 0 : 0.95, ease: MASTER_EASE }}
              >
                <div className="dp-video-testimonial__media">
                  <video
                    ref={(node) => { videoRefs.current[index] = node; }}
                    poster={testimonial.poster}
                    muted={mutedStates[index]}
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`${testimonial.name}'s DezignPool client story`}
                  >
                    <source src={testimonial.video} type="video/mp4" />
                  </video>

                  <div className="dp-video-testimonial__film-label">
                    <span aria-hidden="true" /> Client film · {String(index + 1).padStart(2, '0')}
                  </div>

                  <button
                    type="button"
                    className="dp-video-testimonial__main-play"
                    onClick={() => togglePlay(index)}
                    aria-label={`Play ${testimonial.name}'s client story`}
                    aria-hidden={isPlaying[index]}
                    tabIndex={isPlaying[index] ? -1 : 0}
                  >
                    <Play fill="currentColor" />
                  </button>

                  <div className="dp-video-testimonial__controls">
                    <button
                      type="button"
                      className="dp-video-testimonial__progress"
                      onClick={(event) => seekVideo(event, index)}
                      aria-label={`Seek through ${testimonial.name}'s client story`}
                    >
                      <span style={{ width: `${progress[index]}%` }} />
                    </button>
                    <div>
                      <button type="button" onClick={() => togglePlay(index)} aria-label={isPlaying[index] ? 'Pause video' : 'Play video'}>
                        {isPlaying[index] ? <Pause /> : <Play fill="currentColor" />}
                      </button>
                      <button type="button" onClick={() => toggleMute(index)} aria-label={mutedStates[index] ? 'Turn sound on' : 'Mute video'}>
                        {mutedStates[index] ? <VolumeX /> : <Volume2 />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="dp-video-testimonial__story">
                  <div>
                    <p className="dp-video-testimonial__eyebrow">A home in their own words</p>
                    <Quote className="dp-video-testimonial__quote-icon" aria-hidden="true" />
                    <blockquote>
                      <p>{testimonial.quote}.</p>
                    </blockquote>
                  </div>

                  <div className="dp-video-testimonial__byline">
                    <div>
                      <strong>{testimonial.name}</strong>
                      <span>{testimonial.role}</span>
                    </div>
                    <p className={isPlaying[index] ? 'is-live' : undefined}>
                      <span aria-hidden="true" /> {isPlaying[index] ? 'Playing now' : reducedMotion ? 'Tap to play' : 'Plays in view'}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
