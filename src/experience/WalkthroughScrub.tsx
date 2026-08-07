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
import RotatingBrandMark from '../components/RotatingBrandMark';
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
  fps: number;
};

type FramesManifest = Record<FrameVariantName, FrameVariantManifest>;

const framesManifest = JSON.parse(framesManifestSource) as FramesManifest;

type FrameDirection = -1 | 1;

type FrameState = {
  loaded: boolean;
  decoded: boolean;
  loading: boolean;
  queued: boolean;
  priority: number;
  order: number;
  image?: HTMLImageElement;
  bitmap?: ImageBitmap;
  promise?: Promise<void>;
  resolve?: () => void;
  reject?: (reason: unknown) => void;
};

type FrameRenderResult = {
  index: number;
  caughtUp: boolean;
};

const FRAME_BITMAP_CACHE_LIMIT = 450;
const FRAME_LOAD_CONCURRENCY = 8;
const STARTUP_LOOKAHEAD = 10;
const ROLLING_LOOKAHEAD = 18;
const BACKGROUND_DECODE_PRIORITY = 1;
const TRAVEL_DECODE_PRIORITY = 10;
const LOOKAHEAD_DECODE_PRIORITY = 20;
const WHEEL_BURST_SILENCE_MS = 160;
const WHEEL_EVENT_LIMIT_PX = 80;
const WHEEL_TRIGGER_PX = 32;

class FrameEngine {
  private readonly context: CanvasRenderingContext2D;
  private readonly frames: FrameState[];
  private readonly decodeQueue: number[] = [];
  private readonly bitmapCache = new Map<number, ImageBitmap>();
  private readonly resizeObserver: ResizeObserver;
  private activeLoads = 0;
  private queueOrder = 0;
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
    this.frames = Array.from({ length: manifest.count }, () => ({
      loaded: false,
      decoded: false,
      loading: false,
      queued: false,
      priority: Number.NEGATIVE_INFINITY,
      order: 0,
    }));
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  loadFrame(index: number, priority = 0) {
    const frameIndex = clamp(Math.round(index), 0, this.manifest.count - 1);
    const frame = this.frames[frameIndex];
    if (frame.decoded) {
      this.touchBitmap(frameIndex);
      return Promise.resolve();
    }

    if (!frame.promise) {
      frame.promise = new Promise<void>((resolve, reject) => {
        frame.resolve = resolve;
        frame.reject = reject;
      });
    }

    if (!frame.loading) {
      if (!frame.queued) {
        frame.queued = true;
        this.decodeQueue.push(frameIndex);
      }
      if (priority > frame.priority) {
        frame.priority = priority;
        frame.order = this.queueOrder;
        this.queueOrder += 1;
      }
      this.pumpDecodeQueue();
    }

    return frame.promise;
  }

  async preloadRange(
    start: number,
    end: number,
    direction: FrameDirection,
    priority = 0,
  ) {
    const first = clamp(Math.round(start), 0, this.manifest.count - 1);
    const last = clamp(Math.round(end), 0, this.manifest.count - 1);
    const distance = (last - first) * direction;
    if (distance < 0) return;

    const frames = Array.from(
      { length: distance + 1 },
      (_, index) => first + index * direction,
    );
    await Promise.all(frames.map((frameIndex) => this.loadFrame(frameIndex, priority)));
  }

  preloadLookahead(
    origin: number,
    target: number,
    direction: FrameDirection,
    frameCount: number,
    priority: number,
  ) {
    const start = clamp(Math.round(origin), 0, this.manifest.count - 1);
    const destination = clamp(Math.round(target), 0, this.manifest.count - 1);
    const available = Math.max(0, (destination - start) * direction);
    const lookaheadEnd = start + direction * Math.min(frameCount, available);
    return this.preloadRange(start, lookaheadEnd, direction, priority);
  }

  draw(rawIndex: number) {
    if (this.destroyed || this.manifest.count <= 0) return false;
    const frameIndex = clamp(Math.round(rawIndex), 0, this.manifest.count - 1);
    return this.drawFrame(frameIndex);
  }

  drawDirectional(rawIndex: number, direction: FrameDirection): FrameRenderResult {
    if (this.destroyed || this.lastDrawnIndex < 0) {
      return { index: this.lastDrawnIndex, caughtUp: false };
    }

    const desiredIndex = clamp(
      direction > 0 ? Math.floor(rawIndex) : Math.ceil(rawIndex),
      0,
      this.manifest.count - 1,
    );
    let frontier = this.lastDrawnIndex;

    while ((desiredIndex - frontier) * direction > 0) {
      const nextIndex = frontier + direction;
      if (!this.frames[nextIndex]?.decoded) break;
      this.drawFrame(nextIndex);
      frontier = this.lastDrawnIndex;
    }

    return { index: this.lastDrawnIndex, caughtUp: this.lastDrawnIndex === desiredIndex };
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.resizeObserver.disconnect();
    this.decodeQueue.length = 0;

    const destroyedError = new Error('Walkthrough frame engine was destroyed.');
    this.frames.forEach((frame) => {
      frame.bitmap?.close();
      frame.bitmap = undefined;
      frame.image = undefined;
      frame.decoded = false;
      if (frame.queued) frame.reject?.(destroyedError);
      frame.queued = false;
    });
    this.bitmapCache.clear();
  }

  private drawFrame(frameIndex: number) {
    if (frameIndex === this.lastDrawnIndex) {
      this.touchBitmap(frameIndex);
      return true;
    }

    const frame = this.frames[frameIndex];
    const image = frame.bitmap ?? frame.image;
    if (!frame.decoded || !image) return false;

    const sourceWidth = image instanceof HTMLImageElement
      ? image.naturalWidth || this.manifest.width
      : image.width;
    const sourceHeight = image instanceof HTMLImageElement
      ? image.naturalHeight || this.manifest.height
      : image.height;
    const scale = Math.max(this.canvas.width / sourceWidth, this.canvas.height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const offsetX = (this.canvas.width - drawWidth) / 2;
    const offsetY = (this.canvas.height - drawHeight) / 2;

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    this.lastDrawnIndex = frameIndex;
    this.touchBitmap(frameIndex);
    return true;
  }

  private pumpDecodeQueue() {
    if (this.destroyed) return;
    this.decodeQueue.sort((leftIndex, rightIndex) => {
      const left = this.frames[leftIndex];
      const right = this.frames[rightIndex];
      return right.priority - left.priority || left.order - right.order;
    });

    while (this.activeLoads < FRAME_LOAD_CONCURRENCY && this.decodeQueue.length > 0) {
      const frameIndex = this.decodeQueue.shift();
      if (frameIndex === undefined) return;
      const frame = this.frames[frameIndex];
      if (!frame.queued || frame.decoded) continue;

      frame.queued = false;
      frame.loading = true;
      this.activeLoads += 1;
      void this.decodeFrame(frameIndex)
        .then(() => frame.resolve?.())
        .catch((error: unknown) => {
          frame.loaded = false;
          frame.decoded = false;
          frame.image = undefined;
          frame.bitmap?.close();
          frame.bitmap = undefined;
          frame.reject?.(error);
        })
        .finally(() => {
          frame.loading = false;
          frame.priority = Number.NEGATIVE_INFINITY;
          frame.promise = undefined;
          frame.resolve = undefined;
          frame.reject = undefined;
          this.activeLoads -= 1;
          this.pumpDecodeQueue();
        });
    }
  }

  private async decodeFrame(frameIndex: number) {
    const frame = this.frames[frameIndex];
    const image = new Image();
    image.decoding = 'async';
    frame.image = image;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => {
        reject(new Error(`Could not load walkthrough frame ${this.frameUrl(frameIndex)}.`));
      };
      image.src = this.frameUrl(frameIndex);
    });
    frame.loaded = true;

    let bitmap: ImageBitmap | undefined;
    if (typeof createImageBitmap === 'function') {
      try {
        bitmap = await createImageBitmap(image);
      } catch {
        if (typeof image.decode === 'function') await image.decode();
      }
    } else if (typeof image.decode === 'function') {
      await image.decode();
    }

    if (this.destroyed) {
      bitmap?.close();
      throw new Error('Walkthrough frame engine was destroyed.');
    }

    if (bitmap) {
      frame.bitmap = bitmap;
      frame.image = undefined;
      this.bitmapCache.set(frameIndex, bitmap);
    }
    frame.decoded = true;
    if (bitmap) this.enforceBitmapCacheLimit();
  }

  private enforceBitmapCacheLimit() {
    while (this.bitmapCache.size > FRAME_BITMAP_CACHE_LIMIT) {
      const oldestIndex = Array.from(this.bitmapCache.keys()).find(
        (frameIndex) => frameIndex !== this.lastDrawnIndex,
      );
      if (oldestIndex === undefined) return;
      const bitmap = this.bitmapCache.get(oldestIndex);
      this.bitmapCache.delete(oldestIndex);
      bitmap?.close();

      const frame = this.frames[oldestIndex];
      frame.bitmap = undefined;
      frame.loaded = false;
      frame.decoded = false;
    }
  }

  private touchBitmap(frameIndex: number) {
    const bitmap = this.bitmapCache.get(frameIndex);
    if (!bitmap) return;
    this.bitmapCache.delete(frameIndex);
    this.bitmapCache.set(frameIndex, bitmap);
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
  onNavigate,
}: {
  bridge: ScrollBridge | null;
  onComplete: () => void;
  onSkipWebsite: () => void;
  onNavigate?: (section: string) => void;
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
  const [logoIndex, setLogoIndex] = useState(0);
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
    setLogoIndex(0);
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
      variantManifest.height > 0 &&
      Number.isFinite(variantManifest.fps) &&
      variantManifest.fps > 0;
    const maxFrame = hasFrames ? variantManifest.count - 1 : 0;
    const stopFrames = hasFrames
      ? chapters.map((chapter) => Math.round(clamp(chapter.at, 0, 1) * maxFrame))
      : [];
    let travelling = false;
    let isReady = false;
    let pendingDirection: FrameDirection | null = null;
    let travelDirection: FrameDirection | null = null;
    let travelTargetFrame = 0;
    let travelToken = 0;
    let buffering = false;
    let rollingLookaheadOrigin = -1;
    let touchStartY: number | null = null;
    let touchCurrentY: number | null = null;
    let travelTween: gsap.core.Tween | null = null;
    const frameRef = { value: stopFrames[0] ?? 0 };
    const frameEngine = hasFrames ? new FrameEngine(canvas, variant, variantManifest) : null;
    const wheelBurst = {
      active: false,
      direction: 1 as FrameDirection,
      accumulator: 0,
      lastAt: 0,
      lastMagnitude: 0,
      peakMagnitude: 0,
      consumed: false,
      tailing: false,
    };

    const luxuryEase = CustomEase.create('dp-walk-luxury', '0.625,0.05,0,1');
    const travelEase = CustomEase.create('dp-walk-travel', '0.65,0,0.35,1');

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
      travelToken += 1;
      travelTween?.kill();
      travelTween = null;
      gsap.killTweensOf(frameRef);
      gsap.killTweensOf(animatedElements());
      travelling = false;
      travelDirection = null;
      pendingDirection = null;
      buffering = false;
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

    const reportFrameError = (error: unknown) => {
      if (effectActive) console.error('Walkthrough frame sequence could not be loaded.', error);
    };

    let startStep: (direction: FrameDirection) => void = () => undefined;

    const drainPendingIntent = () => {
      if (!isReady || travelling || pendingDirection === null || doneRef.current) return;
      const direction = pendingDirection;
      pendingDirection = null;
      startStep(direction);
    };

    const submitIntent = (direction: FrameDirection) => {
      if (doneRef.current) return;
      if (!isReady || travelling) {
        pendingDirection = direction;
        return;
      }
      startStep(direction);
    };
    stepRef.current = submitIntent;

    const pauseForUnderrun = (frontier: number) => {
      if (
        buffering ||
        !frameEngine ||
        travelDirection === null ||
        !travelTween ||
        doneRef.current
      ) {
        return;
      }

      travelTween.pause();
      frameRef.value = frontier;
      buffering = true;
      const token = travelToken;
      void frameEngine
        .preloadLookahead(
          frontier,
          travelTargetFrame,
          travelDirection,
          ROLLING_LOOKAHEAD,
          LOOKAHEAD_DECODE_PRIORITY,
        )
        .then(() => {
          if (
            !effectActive ||
            token !== travelToken ||
            !travelling ||
            doneRef.current
          ) {
            return;
          }
          buffering = false;
          rollingLookaheadOrigin = frontier;
          travelTween?.resume();
        })
        .catch((error: unknown) => {
          buffering = false;
          reportFrameError(error);
        });
    };

    const updateTravelFrame = () => {
      if (!frameEngine || !travelling || travelDirection === null) return;
      const result = frameEngine.drawDirectional(frameRef.value, travelDirection);
      if (
        rollingLookaheadOrigin < 0 ||
        Math.abs(result.index - rollingLookaheadOrigin) >= Math.floor(ROLLING_LOOKAHEAD / 3)
      ) {
        rollingLookaheadOrigin = result.index;
        void frameEngine
          .preloadLookahead(
            result.index,
            travelTargetFrame,
            travelDirection,
            ROLLING_LOOKAHEAD,
            LOOKAHEAD_DECODE_PRIORITY,
          )
          .catch(reportFrameError);
      }
      if (!result.caughtUp) pauseForUnderrun(result.index);
    };

    startStep = (nextDirection) => {
      if (doneRef.current || !frameEngine || stopFrames.length !== chapters.length) return;

      const fromIndex = currentIndexRef.current;
      const nextIndex = fromIndex + nextDirection;
      if (nextIndex < 0) return;
      if (nextIndex >= chapters.length) {
        if (nextDirection > 0) finish();
        return;
      }

      const fromFrame = stopFrames[fromIndex];
      const targetFrame = stopFrames[nextIndex];
      const frameSpan = Math.abs(targetFrame - fromFrame);
      const currentAct = actRefs.current[fromIndex];
      const currentCard = cardRefs.current[fromIndex];
      const currentLines = Array.from(
        currentAct?.querySelectorAll<HTMLElement>('[data-copy-line]') ?? [],
      );

      travelling = true;
      setLogoIndex(nextIndex);
      travelDirection = nextDirection;
      travelTargetFrame = targetFrame;
      rollingLookaheadOrigin = fromFrame;
      buffering = false;
      const token = travelToken + 1;
      travelToken = token;

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

      void frameEngine
        .preloadRange(fromFrame, targetFrame, nextDirection, TRAVEL_DECODE_PRIORITY)
        .catch(reportFrameError);

      void (async () => {
        try {
          await frameEngine.preloadLookahead(
            fromFrame,
            targetFrame,
            nextDirection,
            STARTUP_LOOKAHEAD,
            LOOKAHEAD_DECODE_PRIORITY,
          );
          if (!effectActive || token !== travelToken || doneRef.current) return;

          frameRef.value = fromFrame;
          frameEngine.draw(fromFrame);
          travelTween = gsap.to(frameRef, {
            value: targetFrame,
            duration: clamp(frameSpan / 50, 1.4, 1.9),
            ease: travelEase,
            overwrite: false,
            onUpdate: updateTravelFrame,
            onComplete: () => {
              frameRef.value = targetFrame;
              frameEngine.drawDirectional(targetFrame, nextDirection);
              currentAct?.setAttribute('aria-hidden', 'true');
              currentCard?.setAttribute('aria-hidden', 'true');
              if (currentAct) gsap.set(currentAct, { autoAlpha: 0 });
              if (currentCard) gsap.set(currentCard, { autoAlpha: 0 });

              currentIndexRef.current = nextIndex;
              setCurrentIndex(nextIndex);
              enterChapter(nextIndex);
              travelling = false;
              travelDirection = null;
              buffering = false;
              travelTween = null;
              drainPendingIntent();
            },
          });
        } catch (error) {
          if (!effectActive || token !== travelToken) return;
          travelling = false;
          setLogoIndex(fromIndex);
          travelDirection = null;
          enterChapter(fromIndex);
          reportFrameError(error);
          drainPendingIntent();
        }
      })();
    };

    if (frameEngine) {
      const chapterZeroEnd = stopFrames[1] ?? stopFrames[0];
      void (async () => {
        try {
          await frameEngine.loadFrame(stopFrames[0], LOOKAHEAD_DECODE_PRIORITY);
          if (!effectActive) return;
          frameEngine.draw(stopFrames[0]);

          await frameEngine.preloadLookahead(
            stopFrames[0],
            chapterZeroEnd,
            1,
            STARTUP_LOOKAHEAD,
            LOOKAHEAD_DECODE_PRIORITY,
          );
          if (!effectActive) return;
          isReady = true;
          setReady(true);
          drainPendingIntent();

          await frameEngine.preloadRange(
            stopFrames[0],
            chapterZeroEnd,
            1,
            BACKGROUND_DECODE_PRIORITY,
          );
          if (chapterZeroEnd < maxFrame) {
            await frameEngine.preloadRange(
              chapterZeroEnd + 1,
              maxFrame,
              1,
              BACKGROUND_DECODE_PRIORITY,
            );
          }
        } catch (error) {
          reportFrameError(error);
        }
      })();
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
      const delta = clamp(event.deltaY * scale, -WHEEL_EVENT_LIMIT_PX, WHEEL_EVENT_LIMIT_PX);
      const magnitude = Math.abs(delta);
      if (magnitude < 0.5) return;

      const now = performance.now();
      const direction: FrameDirection = delta > 0 ? 1 : -1;
      // While travelling, inertia tails must never look like new gestures:
      // no same-direction "renewed impulse", and a much longer silence gate.
      const silenceGate = travelling ? 450 : WHEEL_BURST_SILENCE_MS;
      const afterSilence =
        (!wheelBurst.active || now - wheelBurst.lastAt >= silenceGate) &&
        (!travelling || magnitude >= 15);
      const reversed =
        wheelBurst.active &&
        direction !== wheelBurst.direction &&
        (!travelling || magnitude >= 20);
      const renewedImpulse =
        !travelling &&
        wheelBurst.active &&
        wheelBurst.consumed &&
        wheelBurst.tailing &&
        direction === wheelBurst.direction &&
        magnitude >= Math.max(28, wheelBurst.lastMagnitude * 1.8);

      if (afterSilence || reversed || renewedImpulse) {
        wheelBurst.active = true;
        wheelBurst.direction = direction;
        wheelBurst.accumulator = 0;
        wheelBurst.lastMagnitude = 0;
        wheelBurst.peakMagnitude = 0;
        wheelBurst.consumed = false;
        wheelBurst.tailing = false;
      }

      wheelBurst.accumulator += delta;
      if (wheelBurst.consumed) {
        if (
          magnitude <= wheelBurst.lastMagnitude * 0.82 ||
          magnitude <= wheelBurst.peakMagnitude * 0.3
        ) {
          wheelBurst.tailing = true;
        }
        wheelBurst.lastAt = now;
        wheelBurst.lastMagnitude = magnitude;
        return;
      }

      wheelBurst.lastAt = now;
      wheelBurst.lastMagnitude = magnitude;
      wheelBurst.peakMagnitude = Math.max(wheelBurst.peakMagnitude, magnitude);
      if (Math.abs(wheelBurst.accumulator) < WHEEL_TRIGGER_PX) return;

      wheelBurst.consumed = true;
      submitIntent(wheelBurst.accumulator > 0 ? 1 : -1);
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
      if (!event.repeat) submitIntent(forwardKey ? 1 : -1);
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
      if (Math.abs(distance) >= 48) submitIntent(distance > 0 ? 1 : -1);
    };

    const onTouchCancel = () => {
      touchStartY = null;
      touchCurrentY = null;
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
    stage.addEventListener('touchcancel', onTouchCancel);
    if (finePointer) {
      stage.addEventListener('pointermove', onPointerMove, { passive: true });
      stage.addEventListener('pointerleave', resetPointer);
    }

    return () => {
      effectActive = false;
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      stage.removeEventListener('touchstart', onTouchStart);
      stage.removeEventListener('touchmove', onTouchMove);
      stage.removeEventListener('touchend', onTouchEnd);
      stage.removeEventListener('touchcancel', onTouchCancel);
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
          <nav className="dp-walk__nav" aria-label="Site">
            {[
              ['Home', ''],
              ['Services', 'services'],
              ['Projects', 'projects'],
            ].map(([label, section]) => (
              <button
                key={label}
                type="button"
                className="dp-walk__nav-link"
                onClick={() => (section && onNavigate ? onNavigate(section) : undefined)}
              >
                {label}
              </button>
            ))}
          </nav>
          <RotatingBrandMark
            className="dp-walk__logo object-contain"
            rotationProgress={chapters.length > 1 ? logoIndex / (chapters.length - 1) : 0}
          />
          <div className="dp-walk__bar-end">
            <nav className="dp-walk__nav dp-walk__nav--secondary" aria-label="More">
              {[
                ['About', 'about'],
                ['Contact', 'contact'],
              ].map(([label, section]) => (
                <button
                  key={label}
                  type="button"
                  className="dp-walk__nav-link"
                  onClick={() => (onNavigate ? onNavigate(section) : undefined)}
                >
                  {label}
                </button>
              ))}
            </nav>
            <button type="button" className="dp-walk__skip" onClick={skip}>
              <span className="dp-walk__live-dot" aria-hidden="true" />
              <span>Discover my style</span>
              <span className="dp-walk__skip-chip" aria-hidden="true">
                <ArrowRight size={16} strokeWidth={1.6} />
              </span>
            </button>
          </div>
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
          data-loading={!ready ? 'true' : 'false'}
          aria-busy={!ready}
          aria-label={
            !ready
              ? 'Loading walkthrough; activate to queue the next chapter'
              : currentIndex === chapters.length - 1
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
          <span className="dp-walk__badge-loader" aria-hidden="true" />
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
          className="absolute bottom-[248px] left-1/2 z-[9] -translate-x-1/2 text-[12px] font-light lowercase tracking-[0.04em] text-[#f2efe9]/45 underline-offset-4 transition-colors hover:text-[#f2efe9]/75 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A98E5F] md:bottom-6 md:left-auto md:right-[clamp(22px,3.5vw,54px)] md:translate-x-0"
        >
          skip to website
        </button>
      </div>
    </div>
  );
}
