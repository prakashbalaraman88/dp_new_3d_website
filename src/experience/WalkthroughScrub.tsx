import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import {
  ArrowDown,
  ArrowRight,
  ChefHat,
  DoorOpen,
  Sofa,
  Sparkles,
  Trees,
} from 'lucide-react';
import type { ScrollBridge } from './scrollBridge';
import framesManifestSource from './frames.json?raw';
import {
  walkthroughSegments,
  type Act,
  type WalkthroughIcon,
} from './walkthrough';
import './experience.css';

gsap.registerPlugin(CustomEase);

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

type StoryChapter = Act & {
  id: string;
};

const chapters: StoryChapter[] = walkthroughSegments.flatMap((segment) =>
  segment.acts.map((act, actIndex) => ({
    ...act,
    id: `${segment.id}-${actIndex}`,
  })),
);

type FrameVariantName = 'desktop' | 'mobile';

type FrameVariantManifest = {
  count: number;
  width: number;
  height: number;
};

type FramesManifest = Record<FrameVariantName, FrameVariantManifest>;

const framesManifest = JSON.parse(framesManifestSource) as FramesManifest;

class FrameEngine {
  private readonly context: CanvasRenderingContext2D;
  private readonly images: Array<HTMLImageElement | undefined>;
  private readonly loadPromises = new Map<number, Promise<HTMLImageElement>>();
  private readonly resizeObserver: ResizeObserver;
  private lastDrawnIndex = -1;
  private destroyed = false;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly variant: FrameVariantName,
    private readonly manifest: FrameVariantManifest,
  ) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D rendering is unavailable.');
    this.context = context;
    this.images = new Array(manifest.count);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  loadFrame(index: number) {
    const frameIndex = clamp(Math.round(index), 0, this.manifest.count - 1);
    const loaded = this.images[frameIndex];
    if (loaded) return Promise.resolve(loaded);

    const pending = this.loadPromises.get(frameIndex);
    if (pending) return pending;

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (!this.destroyed) this.images[frameIndex] = image;
        resolve(image);
      };
      image.onerror = () => {
        this.loadPromises.delete(frameIndex);
        reject(new Error(`Could not load walkthrough frame ${this.frameUrl(frameIndex)}.`));
      };
      image.src = this.frameUrl(frameIndex);
    });
    this.loadPromises.set(frameIndex, promise);
    return promise;
  }

  async preloadRange(start: number, end: number, concurrency = 6) {
    const first = clamp(Math.floor(start), 0, this.manifest.count - 1);
    const last = clamp(Math.ceil(end), 0, this.manifest.count - 1);
    if (last < first) return;

    const queue = Array.from({ length: last - first + 1 }, (_, index) => first + index);
    let cursor = 0;
    const worker = async () => {
      while (!this.destroyed) {
        const queueIndex = cursor;
        cursor += 1;
        if (queueIndex >= queue.length) return;
        await this.loadFrame(queue[queueIndex]);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(concurrency, queue.length) }, () => worker()),
    );
  }

  draw(rawIndex: number) {
    if (this.destroyed || this.manifest.count <= 0) return false;
    const frameIndex = clamp(Math.round(rawIndex), 0, this.manifest.count - 1);
    if (frameIndex === this.lastDrawnIndex) return true;

    const image = this.images[frameIndex];
    if (!image) return false;

    const sourceWidth = image.naturalWidth || this.manifest.width;
    const sourceHeight = image.naturalHeight || this.manifest.height;
    const scale = Math.max(this.canvas.width / sourceWidth, this.canvas.height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const offsetX = (this.canvas.width - drawWidth) / 2;
    const offsetY = (this.canvas.height - drawHeight) / 2;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    this.lastDrawnIndex = frameIndex;
    return true;
  }

  destroy() {
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.images.length = 0;
    this.loadPromises.clear();
  }

  private frameUrl(index: number) {
    const frameNumber = String(index + 1).padStart(4, '0');
    return `/videos/frames/${this.variant}/f_${frameNumber}.webp`;
  }

  private resize() {
    if (this.destroyed) return;
    const bounds = this.canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const physicalWidth = Math.max(1, bounds.width * pixelRatio);
    const physicalHeight = Math.max(1, bounds.height * pixelRatio);
    const sourceScale = Math.min(
      1,
      this.manifest.width / physicalWidth,
      this.manifest.height / physicalHeight,
    );
    const width = Math.max(1, Math.round(physicalWidth * sourceScale));
    const height = Math.max(1, Math.round(physicalHeight * sourceScale));
    if (this.canvas.width === width && this.canvas.height === height) return;

    const frameToRedraw = this.lastDrawnIndex;
    this.canvas.width = width;
    this.canvas.height = height;
    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = 'high';
    this.lastDrawnIndex = -1;
    if (frameToRedraw >= 0) this.draw(frameToRedraw);
  }
}

const CARD_ICONS = {
  trees: Trees,
  'door-open': DoorOpen,
  sofa: Sofa,
  'chef-hat': ChefHat,
  sparkles: Sparkles,
} satisfies Record<WalkthroughIcon, typeof Trees>;

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

function AccentTitle({ act }: { act: Act }) {
  const accent = act.accentWord.toLocaleLowerCase();

  return (
    <>
      {act.title.split('\n').map((line, lineIndex) => {
        const accentStart = line.toLocaleLowerCase().indexOf(accent);
        const accentEnd = accentStart + act.accentWord.length;

        return (
          <span className="dp-walk__title-line" key={`${line}-${lineIndex}`}>
            {accentStart < 0 ? (
              line
            ) : (
              <>
                {line.slice(0, accentStart)}
                <em>{line.slice(accentStart, accentEnd)}</em>
                {line.slice(accentEnd)}
              </>
            )}
          </span>
        );
      })}
    </>
  );
}

function ReducedWalkthrough({
  onComplete,
  onSkipWebsite,
}: {
  onComplete: () => void;
  onSkipWebsite: () => void;
}) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  return (
    <div className="dp-walk dp-walk--reduced">
      <button
        type="button"
        onClick={onSkipWebsite}
        className="fixed bottom-4 left-1/2 z-[9] -translate-x-1/2 text-[12px] font-light lowercase tracking-[0.04em] text-[#f2efe9]/45 underline-offset-4 transition-colors hover:text-[#f2efe9]/75 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98E5F]"
      >
        skip to website
      </button>
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
              <h1 className="dp-exp__title dp-walk__still-title">{lead.title}</h1>
              {lead.sub && <p className="dp-exp__sub">{lead.sub}</p>}
              {segment.acts.slice(1).map((act) => (
                <p key={act.title} className="dp-walk__still-note">
                  {act.title.replace('\n', ' ')}
                </p>
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
  onSkipWebsite,
}: {
  bridge: ScrollBridge | null;
  onComplete: () => void;
  onSkipWebsite: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const actRefs = useRef<Array<HTMLDivElement | null>>([]);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const doneRef = useRef(false);
  const currentIndexRef = useRef(0);
  const stepRef = useRef<(direction: -1 | 1) => void>(() => undefined);
  const cancelRef = useRef<() => void>(() => undefined);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ready, setReady] = useState(false);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');

  useEffect(() => {
    if (reducedMotion) return;

    const root = rootRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!root || !stage || !canvas || chapters.length === 0) return;

    doneRef.current = false;
    currentIndexRef.current = 0;
    setCurrentIndex(0);
    setReady(false);
    bridge?.stop();
    bridge?.lenis.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);

    let effectActive = true;
    queueMicrotask(() => {
      if (effectActive) bridge?.stop();
    });

    const variant: FrameVariantName = isMobile ? 'mobile' : 'desktop';
    const variantManifest = framesManifest[variant];
    const hasFrames =
      Number.isInteger(variantManifest.count) &&
      variantManifest.count > 0 &&
      variantManifest.width > 0 &&
      variantManifest.height > 0;
    const maxFrame = hasFrames ? variantManifest.count - 1 : 0;
    const stopFrames = hasFrames
      ? chapters.map((chapter) => clamp(chapter.at, 0, 1) * maxFrame)
      : [];
    let travelling = false;
    let isReady = false;
    let frameId = 0;
    let wheelResetId = 0;
    let wheelDelta = 0;
    let wheelBurstConsumed = false;
    let touchStartY: number | null = null;
    let touchCurrentY: number | null = null;
    let travelTween: gsap.core.Tween | null = null;
    const frameRef = { value: stopFrames[0] ?? 0 };
    const frameEngine = hasFrames ? new FrameEngine(canvas, variant, variantManifest) : null;

    const luxuryEase = CustomEase.create('dp-walk-luxury', '0.625,0.05,0,1');

    const animatedElements = () => {
      const acts = actRefs.current.filter(
        (element): element is HTMLDivElement => element !== null,
      );
      const lines = actRefs.current.flatMap((act) =>
        Array.from(act?.querySelectorAll<HTMLElement>('[data-copy-line]') ?? []),
      );
      const cards = cardRefs.current.filter(
        (element): element is HTMLElement => element !== null,
      );
      return [...acts, ...lines, ...cards];
    };

    const renderFrame = () => {
      frameEngine?.draw(frameRef.value);
      frameId = requestAnimationFrame(renderFrame);
    };

    const context = gsap.context(() => {
      actRefs.current.forEach((act, index) => {
        gsap.set(act, { autoAlpha: index === 0 ? 1 : 0 });
        gsap.set(act?.querySelectorAll('[data-copy-line]') ?? [], {
          autoAlpha: index === 0 ? 1 : 0,
          y: 0,
        });
      });
      cardRefs.current.forEach((card, index) => {
        gsap.set(card, { autoAlpha: index === 0 ? 1 : 0, y: 0 });
      });
    }, root);

    const cancelAnimations = () => {
      travelTween?.kill();
      travelTween = null;
      gsap.killTweensOf(frameRef);
      gsap.killTweensOf(animatedElements());
      travelling = false;
    };
    cancelRef.current = cancelAnimations;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      cancelAnimations();
      onComplete();
    };

    const enterChapter = (index: number) => {
      const act = actRefs.current[index];
      const card = cardRefs.current[index];
      const lines = Array.from(
        act?.querySelectorAll<HTMLElement>('[data-copy-line]') ?? [],
      );

      if (act) {
        act.setAttribute('aria-hidden', 'false');
        gsap.set(act, { autoAlpha: 1 });
      }
      gsap.fromTo(
        lines,
        { autoAlpha: 0, y: (lineIndex) => 28 + lineIndex * 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: luxuryEase,
        },
      );

      if (card) {
        card.setAttribute('aria-hidden', 'false');
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power3.out' },
        );
      }
    };

    const requestStep = (nextDirection: -1 | 1) => {
      if (!isReady || travelling || doneRef.current || stopFrames.length !== chapters.length) {
        return;
      }

      const fromIndex = currentIndexRef.current;
      const nextIndex = fromIndex + nextDirection;
      if (nextIndex < 0) return;
      if (nextIndex >= chapters.length) {
        if (nextDirection > 0) finish();
        return;
      }

      travelling = true;
      const currentAct = actRefs.current[fromIndex];
      const currentCard = cardRefs.current[fromIndex];
      const currentLines = Array.from(
        currentAct?.querySelectorAll<HTMLElement>('[data-copy-line]') ?? [],
      );

      gsap.to(currentLines, {
        autoAlpha: 0,
        y: (lineIndex) => -28 - lineIndex * 10,
        duration: 0.4,
        ease: 'power2.in',
      });
      if (currentCard) {
        gsap.to(currentCard, {
          autoAlpha: 0,
          y: -12,
          duration: 0.4,
          ease: 'power2.in',
        });
      }

      frameRef.value = stopFrames[fromIndex];
      travelTween = gsap.to(frameRef, {
        value: stopFrames[nextIndex],
        duration: 1.6,
        ease: luxuryEase,
        overwrite: false,
        onComplete: () => {
          frameRef.value = stopFrames[nextIndex];
          frameEngine?.draw(frameRef.value);
          currentAct?.setAttribute('aria-hidden', 'true');
          currentCard?.setAttribute('aria-hidden', 'true');
          if (currentAct) gsap.set(currentAct, { autoAlpha: 0 });
          if (currentCard) gsap.set(currentCard, { autoAlpha: 0 });

          currentIndexRef.current = nextIndex;
          setCurrentIndex(nextIndex);
          enterChapter(nextIndex);
          travelling = false;
          travelTween = null;
        },
      });
    };
    stepRef.current = requestStep;

    if (frameEngine) {
      const chapterZeroEnd = Math.ceil(stopFrames[1] ?? stopFrames[0]);
      void (async () => {
        try {
          await frameEngine.loadFrame(stopFrames[0]);
          if (!effectActive) return;
          frameEngine.draw(stopFrames[0]);

          await frameEngine.preloadRange(0, chapterZeroEnd);
          if (!effectActive) return;
          isReady = true;
          setReady(true);

          await frameEngine.preloadRange(chapterZeroEnd + 1, maxFrame);
        } catch (error) {
          if (effectActive) console.error('Walkthrough frame sequence could not be loaded.', error);
        }
      })();
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      window.clearTimeout(wheelResetId);
      wheelResetId = window.setTimeout(() => {
        wheelDelta = 0;
        wheelBurstConsumed = false;
      }, 220);

      if (wheelBurstConsumed || travelling || doneRef.current) return;

      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      wheelDelta += event.deltaY * scale;
      if (Math.abs(wheelDelta) < 32) return;

      wheelBurstConsumed = true;
      requestStep(wheelDelta > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }

      const forwardKey = event.key === 'ArrowDown' || event.key === 'PageDown';
      const reverseKey = event.key === 'ArrowUp' || event.key === 'PageUp';
      if (!forwardKey && !reverseKey) return;

      event.preventDefault();
      if (!event.repeat) requestStep(forwardKey ? 1 : -1);
    };

    const onTouchStart = (event: TouchEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('button, a')) {
        touchStartY = null;
        touchCurrentY = null;
        return;
      }
      touchStartY = event.touches[0]?.clientY ?? null;
      touchCurrentY = touchStartY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchStartY === null) return;
      event.preventDefault();
      touchCurrentY = event.touches[0]?.clientY ?? touchCurrentY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (touchStartY === null || touchCurrentY === null) return;
      event.preventDefault();
      const distance = touchStartY - touchCurrentY;
      touchStartY = null;
      touchCurrentY = null;
      if (Math.abs(distance) >= 48) requestStep(distance > 0 ? 1 : -1);
    };

    const onPointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      actRefs.current.forEach((act) => {
        act?.querySelectorAll<HTMLElement>('[data-layer]').forEach((layer, layerIndex) => {
          const depth = 1 + layerIndex * 0.5;
          layer.style.setProperty('--mouse-x', `${(x * 14 * depth).toFixed(2)}px`);
          layer.style.setProperty('--mouse-y', `${(y * 9 * depth).toFixed(2)}px`);
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

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    stage.addEventListener('touchstart', onTouchStart, { passive: false });
    stage.addEventListener('touchmove', onTouchMove, { passive: false });
    stage.addEventListener('touchend', onTouchEnd, { passive: false });
    if (finePointer) {
      stage.addEventListener('pointermove', onPointerMove, { passive: true });
      stage.addEventListener('pointerleave', resetPointer);
    }

    frameId = requestAnimationFrame(renderFrame);

    return () => {
      effectActive = false;
      window.clearTimeout(wheelResetId);
      cancelAnimationFrame(frameId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      if (finePointer) {
        stage.removeEventListener('pointermove', onPointerMove);
        stage.removeEventListener('pointerleave', resetPointer);
      }
      frameEngine?.destroy();
      cancelAnimations();
      context.revert();
      stepRef.current = () => undefined;
      cancelRef.current = () => undefined;
    };
  }, [bridge, finePointer, isMobile, onComplete, reducedMotion]);

  if (reducedMotion) {
    return <ReducedWalkthrough onComplete={onComplete} onSkipWebsite={onSkipWebsite} />;
  }

  const skip = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelRef.current();
    onComplete();
  };

  const pageLabel = `${String(currentIndex + 1).padStart(2, '0')} \u2014\u2014 ${String(
    chapters.length,
  ).padStart(2, '0')}`;

  return (
    <div ref={rootRef} className="dp-exp dp-walk dp-walk--stepped">
      <div
        ref={stageRef}
        className="dp-exp__viewport dp-walk__stage"
        aria-label="DezignPool cinematic home walkthrough"
      >
        <picture className="dp-walk__still-media" aria-hidden="true">
          <source
            media="(max-width: 767px)"
            srcSet={walkthroughSegments[0].mobilePoster}
          />
          <img src={walkthroughSegments[0].poster} alt="" />
        </picture>
        <canvas
          ref={canvasRef}
          className="dp-exp__canvas"
          style={{ width: '100%', height: '100%', zIndex: 1 }}
          aria-hidden="true"
        />

        <div className="dp-vid__scrim dp-walk__scrim" />
        <div className="dp-exp__vignette dp-walk__vignette" />

        <header className="dp-exp__bar dp-walk__bar">
          <img
            src="/assets/images/logo.png"
            alt="DezignPool"
            className="h-20 w-auto object-contain sm:h-24"
          />
          <button type="button" className="dp-walk__skip" onClick={skip}>
            <span>Discover my style</span>
            <span className="dp-walk__skip-chip" aria-hidden="true">
              <ArrowRight size={16} strokeWidth={1.6} />
            </span>
          </button>
        </header>

        <p className="dp-walk__counter" aria-live="polite">
          {pageLabel}
        </p>

        {chapters.map((act, index) => (
          <div
            key={act.id}
            ref={(node) => {
              actRefs.current[index] = node;
            }}
            className={`dp-exp__act dp-walk__act${index === 0 ? ' dp-walk__act--initial' : ''}`}
            aria-hidden={currentIndex !== index}
          >
            <div className="dp-walk__layer" data-layer="eyebrow">
              {act.eyebrow && (
                <p className="dp-exp__eyebrow" data-copy-line>
                  {act.eyebrow}
                </p>
              )}
            </div>
            <div className="dp-walk__layer" data-layer="title">
              <h1 className="dp-exp__title dp-walk__title" data-copy-line>
                <AccentTitle act={act} />
              </h1>
            </div>
            <div className="dp-walk__layer" data-layer="sub">
              {act.sub && (
                <p className="dp-exp__sub" data-copy-line>
                  {act.sub}
                </p>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          className="dp-walk__badge"
          onClick={() => stepRef.current(1)}
          disabled={!ready}
          aria-label={
            currentIndex === chapters.length - 1
              ? 'Continue to the style quiz'
              : 'Move to the next chapter'
          }
        >
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path
                id="dp-walk-badge-path"
                d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"
              />
            </defs>
            <text>
              <textPath href="#dp-walk-badge-path">
                {'SCROLL \u2014 DEZIGNPOOL \u2014 EXPLORE \u2014 '}
              </textPath>
            </text>
          </svg>
          <span className="dp-walk__badge-arrow" aria-hidden="true">
            <ArrowDown size={22} strokeWidth={1.4} />
          </span>
        </button>

        <div className="dp-walk__cards" aria-live="polite">
          {chapters.map((act, index) => (
            <article
              key={`${act.id}-card`}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              className={`dp-walk__card${index === 0 ? ' dp-walk__card--initial' : ''}`}
              aria-hidden={currentIndex !== index}
            >
              <div className="dp-walk__card-topline">
                <p>{act.card.label}</p>
                <div className="dp-walk__card-icons" aria-hidden="true">
                  {act.card.icons.map((iconName) => {
                    const Icon = CARD_ICONS[iconName];
                    return <Icon key={iconName} size={17} strokeWidth={1.35} />;
                  })}
                </div>
              </div>
              <p className="dp-walk__card-blurb">{act.card.blurb}</p>
            </article>
          ))}
        </div>

        <button
          type="button"
          onClick={onSkipWebsite}
          className="absolute bottom-[140px] left-1/2 z-[9] -translate-x-1/2 text-[12px] font-light lowercase tracking-[0.04em] text-[#f2efe9]/45 underline-offset-4 transition-colors hover:text-[#f2efe9]/75 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98E5F] md:bottom-4"
        >
          skip to website
        </button>
      </div>
    </div>
  );
}
