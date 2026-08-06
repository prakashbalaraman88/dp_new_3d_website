import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import type { ScrollBridge } from './scrollBridge';
import { ScrollTrigger } from './scrollBridge';
import { walkthroughSegments, type Act } from './walkthrough';
import './experience.css';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

type StoryAct = Act & { segmentIndex: number; globalProgress: number };

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [query]);

  return matches;
}

function ReducedWalkthrough({ onComplete }: { onComplete: () => void }) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  return (
    <div className="dp-walk dp-walk--reduced">
      {walkthroughSegments.map((segment, index) => {
        const lead = segment.acts[0];
        return (
          <section
            key={segment.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            className="dp-walk__still"
          >
            <picture className="dp-walk__still-media">
              <source media="(max-width: 767px)" srcSet={segment.mobilePoster} />
              <img src={segment.poster} alt="" />
            </picture>
            <div className="dp-vid__scrim" />
            <div className="dp-exp__vignette" />
            <div className="dp-walk__still-copy">
              {lead.eyebrow && <p className="dp-exp__eyebrow">{lead.eyebrow}</p>}
              <h1 className="dp-exp__title">{lead.title}</h1>
              {lead.sub && <p className="dp-exp__sub">{lead.sub}</p>}
              {segment.acts.slice(1).map((act) => (
                <p key={act.title} className="dp-walk__still-note">{act.title}</p>
              ))}
              <button
                type="button"
                className="dp-exp__cta"
                onClick={() => {
                  if (index === walkthroughSegments.length - 1) onComplete();
                  else sectionRefs.current[index + 1]?.scrollIntoView();
                }}
              >
                {index === walkthroughSegments.length - 1 ? 'Discover my style' : 'Next space'}
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function WalkthroughScrub({
  bridge,
  onComplete,
}: {
  bridge: ScrollBridge | null;
  onComplete: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const actRefs = useRef<Array<HTMLDivElement | null>>([]);
  const markerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  const { acts, totalWeight } = useMemo(() => {
    const weight = walkthroughSegments.reduce((sum, segment) => sum + segment.weightVh, 0);
    let before = 0;
    const storyActs: StoryAct[] = [];

    walkthroughSegments.forEach((segment, segmentIndex) => {
      segment.acts.forEach((act) => {
        storyActs.push({
          ...act,
          segmentIndex,
          globalProgress: (before + act.at * segment.weightVh) / weight,
        });
      });
      before += segment.weightVh;
    });

    return { acts: storyActs, totalWeight: weight };
  }, []);

  useEffect(() => {
    if (reducedMotion || !bridge) return;

    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    doneRef.current = false;
    bridge.start();
    bridge.lenis.scrollTo(0, { immediate: true });

    const durations = walkthroughSegments.map(() => 0);
    let refreshFrame = 0;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onComplete();
    };

    const updateVideoPool = (activeIndex: number) => {
      videoRefs.current.forEach((video, index) => {
        if (!video) return;
        const shouldLoad = Math.abs(index - activeIndex) <= 1;
        const source = isMobile ? walkthroughSegments[index].mobileSrc : walkthroughSegments[index].src;

        if (shouldLoad && video.getAttribute('src') !== source) {
          video.setAttribute('src', source);
          video.load();
        } else if (!shouldLoad && video.hasAttribute('src')) {
          video.removeAttribute('src');
          durations[index] = 0;
          video.load();
        }
      });
    };

    const setActiveSegment = (index: number) => {
      videoRefs.current.forEach((video, videoIndex) => {
        if (!video) return;
        const active = videoIndex === index;
        video.style.opacity = active ? '1' : '0';
        video.style.zIndex = active ? '1' : '0';
        video.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      updateVideoPool(index);
    };

    const setLayerOffset = (element: HTMLElement | null, y: number) => {
      element?.style.setProperty('--story-y', `${y.toFixed(2)}px`);
    };

    const updateActs = (segmentIndex: number, progress: number) => {
      acts.forEach((act, actIndex) => {
        const element = actRefs.current[actIndex];
        if (!element) return;

        let opacity = 0;
        let travel = 0;
        if (act.segmentIndex === segmentIndex) {
          const fade = Math.min(0.075, Math.max(0.035, act.hold * 0.35));
          const fadeIn = smoothstep(act.at - fade, act.at, progress);
          const fadeOut = 1 - smoothstep(act.at + act.hold, act.at + act.hold + fade, progress);
          opacity = Math.min(fadeIn, fadeOut);
          const passage = clamp(
            (progress - (act.at - fade)) / (act.hold + fade * 2),
            0,
            1,
          );
          travel = (0.5 - passage) * 30;
        }

        element.style.opacity = opacity.toFixed(3);
        element.setAttribute('aria-hidden', opacity > 0.05 ? 'false' : 'true');
        setLayerOffset(element.querySelector<HTMLElement>('[data-layer="eyebrow"]'), travel * 0.55);
        setLayerOffset(element.querySelector<HTMLElement>('[data-layer="title"]'), travel);
        setLayerOffset(element.querySelector<HTMLElement>('[data-layer="sub"]'), travel * 1.35);
      });
    };

    const updateJourneyProgress = (segmentIndex: number, localProgress: number) => {
      const precedingWeight = walkthroughSegments
        .slice(0, segmentIndex)
        .reduce((sum, segment) => sum + segment.weightVh, 0);
      const globalProgress = clamp(
        (precedingWeight + walkthroughSegments[segmentIndex].weightVh * localProgress) / totalWeight,
        0,
        1,
      );

      if (progressRef.current) progressRef.current.style.width = `${(globalProgress * 100).toFixed(2)}%`;
      markerRefs.current.forEach((marker, markerIndex) => {
        const reached = globalProgress >= acts[markerIndex].globalProgress - 0.005;
        marker?.classList.toggle('is-reached', reached);
      });
    };

    const metadataHandlers = videoRefs.current.map((video, index) => {
      const onMetadata = () => {
        const duration = video?.duration ?? 0;
        durations[index] = Number.isFinite(duration) ? duration : 0;
      };
      video?.addEventListener('loadedmetadata', onMetadata);
      if (video && video.readyState >= 1) onMetadata();
      return onMetadata;
    });

    setActiveSegment(0);
    updateActs(0, 0);
    updateJourneyProgress(0, 0);

    const context = gsap.context(() => {
      walkthroughSegments.forEach((segment, segmentIndex) => {
        const section = sectionRefs.current[segmentIndex];
        if (!section) return;
        const snapPoints = Array.from(new Set([0, ...segment.acts.map((act) => act.at), 1]));

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          snap: {
            snapTo: snapPoints,
            duration: { min: 0.12, max: 0.25 },
            delay: 0.08,
            ease: 'power1.inOut',
          },
          onEnter: () => setActiveSegment(segmentIndex),
          onEnterBack: () => setActiveSegment(segmentIndex),
          onLeaveBack: () => {
            if (segmentIndex > 0) setActiveSegment(segmentIndex - 1);
          },
          onUpdate: (self) => {
            if (self.isActive) setActiveSegment(segmentIndex);

            const video = videoRefs.current[segmentIndex];
            const duration = durations[segmentIndex];
            if (video && duration > 0 && !video.seeking) {
              const target = clamp(self.progress * duration, 0, Math.max(0, duration - 0.05));
              if (Math.abs(video.currentTime - target) > 0.02) video.currentTime = target;
            }

            if (self.isActive) {
              updateActs(segmentIndex, self.progress);
              updateJourneyProgress(segmentIndex, self.progress);
            }
            if (segmentIndex === walkthroughSegments.length - 1 && self.progress >= 0.99) finish();
          },
        });
      });
    }, root);

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      actRefs.current.forEach((act) => {
        act?.querySelectorAll<HTMLElement>('[data-layer]').forEach((layer, layerIndex) => {
          const depth = 1 + layerIndex * 0.45;
          layer.style.setProperty('--mouse-x', `${(x * 12 * depth).toFixed(2)}px`);
          layer.style.setProperty('--mouse-y', `${(y * 8 * depth).toFixed(2)}px`);
        });
      });
    };
    const resetPointer = () => {
      actRefs.current.forEach((act) => {
        act?.querySelectorAll<HTMLElement>('[data-layer]').forEach((layer) => {
          layer.style.setProperty('--mouse-x', '0px');
          layer.style.setProperty('--mouse-y', '0px');
        });
      });
    };

    if (finePointer) {
      stage.addEventListener('pointermove', onPointerMove, { passive: true });
      stage.addEventListener('pointerleave', resetPointer);
    }

    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      if (finePointer) {
        stage.removeEventListener('pointermove', onPointerMove);
        stage.removeEventListener('pointerleave', resetPointer);
      }
      context.revert();
      videoRefs.current.forEach((video, index) => {
        video?.removeEventListener('loadedmetadata', metadataHandlers[index]);
      });
    };
  }, [acts, bridge, finePointer, isMobile, onComplete, reducedMotion, totalWeight]);

  if (reducedMotion) return <ReducedWalkthrough onComplete={onComplete} />;

  const jumpToAct = (actIndex: number) => {
    if (actIndex === acts.length - 1) {
      if (!doneRef.current) {
        doneRef.current = true;
        onComplete();
      }
      return;
    }

    const act = acts[actIndex];
    const section = sectionRefs.current[act.segmentIndex];
    if (!section) return;
    const destination = section.offsetTop + section.offsetHeight * act.at;
    if (bridge) bridge.lenis.scrollTo(destination, { duration: 1.1 });
    else window.scrollTo({ top: destination, behavior: 'smooth' });
  };

  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  };

  return (
    <div ref={rootRef} className="dp-exp dp-walk">
      <div ref={stageRef} className="dp-exp__viewport dp-walk__stage">
        {walkthroughSegments.map((segment, index) => (
          <video
            key={segment.id}
            ref={(node) => {
              videoRefs.current[index] = node;
            }}
            className="dp-exp__canvas dp-vid__video dp-walk__video"
            poster={isMobile ? segment.mobilePoster : segment.poster}
            muted
            playsInline
            preload="metadata"
            aria-label={`${segment.id.replace(/-/g, ' ')} walkthrough`}
          />
        ))}

        <div className="dp-vid__scrim" />
        <div className="dp-exp__vignette" />

        <header className="dp-exp__bar dp-walk__bar">
          <img
            src="/assets/images/logo.png"
            alt="DezignPool"
            className="h-20 w-auto object-contain sm:h-24"
          />
          <button type="button" className="dp-walk__skip" onClick={skip}>
            Discover my style <span aria-hidden="true">→</span>
          </button>
        </header>

        {acts.map((act, index) => (
          <div
            key={`${act.segmentIndex}-${act.at}-${act.title}`}
            ref={(node) => {
              actRefs.current[index] = node;
            }}
            className="dp-exp__act dp-walk__act"
            aria-hidden="true"
          >
            {act.eyebrow && <p className="dp-exp__eyebrow dp-walk__layer" data-layer="eyebrow">{act.eyebrow}</p>}
            <h1 className="dp-exp__title dp-walk__layer" data-layer="title">{act.title}</h1>
            {act.sub && <p className="dp-exp__sub dp-walk__layer" data-layer="sub">{act.sub}</p>}
          </div>
        ))}

        <div className="dp-exp__progress dp-walk__progress">
          <span ref={progressRef} />
          {acts.map((act, index) => (
            <button
              key={`${act.segmentIndex}-${act.at}`}
              ref={(node) => {
                markerRefs.current[index] = node;
              }}
              type="button"
              className="dp-walk__marker"
              style={{ left: `${(act.globalProgress * 100).toFixed(2)}%` }}
              onClick={() => jumpToAct(index)}
              aria-label={index === acts.length - 1 ? 'Start the style quiz' : `Jump to story stop ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div aria-hidden="true">
        {walkthroughSegments.map((segment, index) => (
          <section
            key={segment.id}
            ref={(node) => {
              sectionRefs.current[index] = node;
            }}
            className="dp-walk__segment"
            style={{ height: `${segment.weightVh}vh` }}
          />
        ))}
      </div>
    </div>
  );
}
