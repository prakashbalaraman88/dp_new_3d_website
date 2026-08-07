import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SEED = 'dezignpool-journey-v1';
const TARGET_IMAGE_COUNT = 200;
const MAX_IMAGE_BYTES = 200 * 1024;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const samplesFile = join(repoRoot, '.tagteam', 'library-samples.md');
const outputRoot = join(repoRoot, 'public', 'images', 'discover');
const manifestFile = join(repoRoot, 'src', 'discover', 'quizAssets.json');

const ROUND_BLUEPRINTS = [
  { kind: 'quad', id: 'living-room', kicker: 'Living room', question: 'Which room feels most like your kind of welcome?', rooms: ['living-room', 'living-room', 'living-room', 'living-room'] },
  { kind: 'quad', id: 'kitchen', kicker: 'Kitchen', question: 'Which kitchen would make everyday rituals feel better?', rooms: ['kitchen', 'kitchen', 'kitchen', 'kitchen'] },
  { kind: 'quad', id: 'master-bedroom', kicker: 'Master bedroom', question: 'Where would you exhale at the end of the day?', rooms: ['master-bedroom', 'master-bedroom', 'master-bedroom', 'master-bedroom'] },
  { kind: 'quad', id: 'foyer', kicker: 'Foyer', question: 'How should your home introduce itself?', rooms: ['foyer', 'foyer', 'foyer', 'foyer'] },
  { kind: 'quad', id: 'dining', kicker: 'Dining', question: 'Which setting makes you want to gather longer?', rooms: ['dining', 'dining', 'dining', 'dining'] },
  { kind: 'quad', id: 'wardrobe', kicker: 'Wardrobe', question: 'Which wardrobe language would you live with?', rooms: ['wardrobe', 'wardrobe', 'wardrobe', 'wardrobe'] },
  { kind: 'quad', id: 'wall-panel', kicker: 'Material mood', question: 'Which composition has the texture you are drawn to?', rooms: ['wall-panel', 'wall-panel', 'wall-panel', 'wall-panel'] },
  { kind: 'quad', id: 'final-instinct', kicker: 'One last instinct', question: 'No overthinking. Which space is simply you?', rooms: ['living-room', 'kitchen', 'master-bedroom', 'dining'] },
];

function fail(message) {
  console.error(`build-quiz-assets: ${message}`);
  process.exit(1);
}

function readLibraryRoot() {
  const root = resolve(process.env.STYLE_LIBRARY_ROOT || 'D:/dezignpool/style-library');
  if (!existsSync(root)) fail(`Style library not found at ${root} — set STYLE_LIBRARY_ROOT to override.`);
  return root;
}

function hash(text) {
  let value = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function uniqueStrings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))];
}

function completeCaption(record) {
  const caption = record?.caption;
  return Boolean(
    record
      && typeof record.image === 'string'
      && caption
      && Array.isArray(caption.palette)
      && Array.isArray(caption.materials)
      && Array.isArray(caption.furniture_forms)
      && Array.isArray(caption.props)
      && typeof caption.lighting === 'string'
      && Array.isArray(caption.textiles)
      && Array.isArray(caption.motifs),
  );
}

function captionKey(style, room, image) {
  return `${style}/${room}/${basename(image)}`.toLowerCase();
}

function loadCaptions(libraryRoot) {
  const captionsRoot = join(libraryRoot, 'distill', 'captions');
  if (!existsSync(captionsRoot)) fail(`Caption directory is missing: ${captionsRoot}`);
  const captions = new Map();

  for (const file of readdirSync(captionsRoot).filter((name) => name.endsWith('.jsonl')).sort()) {
    const stem = basename(file, '.jsonl');
    const separator = stem.indexOf('__');
    if (separator < 1) continue;
    const style = stem.slice(0, separator);
    const room = stem.slice(separator + 2);
    const lines = readFileSync(join(captionsRoot, file), 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/);

    for (const [lineIndex, line] of lines.entries()) {
      if (!line.trim()) continue;
      let record;
      try {
        record = JSON.parse(line);
      } catch (error) {
        fail(`${file}:${lineIndex + 1} is invalid JSON (${error.message}).`);
      }
      if (!completeCaption(record)) continue;
      captions.set(captionKey(style, room, record.image), record.caption);
    }
  }

  return captions;
}

function orderedSheetValues(index) {
  return Object.entries(index)
    .sort(([a], [b]) => {
      const an = Number(a);
      const bn = Number(b);
      return Number.isFinite(an) && Number.isFinite(bn) ? an - bn : a.localeCompare(b);
    })
    .map(([, value]) => value)
    .filter((value) => typeof value === 'string');
}

function loadCandidates(libraryRoot, styleOrder, captions) {
  const sheetsRoot = join(libraryRoot, 'sheets');
  const libraryImagesRoot = join(libraryRoot, 'library');
  if (!existsSync(sheetsRoot)) fail(`Sheets directory is missing: ${sheetsRoot}`);
  const candidates = [];

  for (const sheetFile of readdirSync(sheetsRoot).filter((name) => name.endsWith('.json')).sort()) {
    const style = styleOrder.find((slug) => sheetFile.startsWith(`${slug}__`));
    if (!style) continue;
    const room = basename(sheetFile, '.json').slice(style.length + 2);
    let sheet;
    try {
      sheet = JSON.parse(readFileSync(join(sheetsRoot, sheetFile), 'utf8').replace(/^\uFEFF/, ''));
    } catch (error) {
      fail(`${sheetFile} is invalid JSON (${error.message}).`);
    }

    for (const [sheetIndex, filename] of orderedSheetValues(sheet).entries()) {
      const caption = captions.get(captionKey(style, room, filename));
      const source = join(libraryImagesRoot, style, room, filename);
      if (!existsSync(source) || !statSync(source).isFile()) continue;
      candidates.push({
        key: `${style}/${room}/${basename(filename)}`.toLowerCase(),
        style,
        room,
        filename,
        source,
        sheetFile,
        sheetIndex,
        captioned: Boolean(caption),
        materials: uniqueStrings(caption?.materials),
        motifs: uniqueStrings(caption?.motifs),
      });
    }
  }

  if (candidates.length < TARGET_IMAGE_COUNT) {
    fail(`Only ${candidates.length} indexed images are available; at least ${TARGET_IMAGE_COUNT} are required.`);
  }
  return candidates;
}

function displayName(slug) {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function makeSelector(candidates) {
  const used = new Set();
  const cache = new Map();

  function pool(style, room, captionRequired) {
    const key = `${style}|${room || '*'}|${captionRequired ? 'captioned' : 'all'}`;
    if (!cache.has(key)) {
      const matching = candidates.filter((candidate) => (
        candidate.style === style
        && (!room || candidate.room === room)
        && (!captionRequired || candidate.captioned)
      ));
      // loadCandidates follows the curator's sheet order; retain it here.
      cache.set(key, matching);
    }
    return cache.get(key);
  }

  function claim(style, preferredRoom, captionRequired = false) {
    const candidate = pool(style, preferredRoom, captionRequired).find((item) => !used.has(item.key))
      || pool(style, undefined, captionRequired).find((item) => !used.has(item.key));
    if (!candidate) {
      const captionLabel = captionRequired ? ' captioned' : '';
      fail(`Not enough${captionLabel} images to select another asset for ${style}/${preferredRoom || '*'}.`);
    }
    used.add(candidate.key);
    return candidate;
  }

  function claimExact(style, room, filename) {
    const key = `${style}/${room}/${filename}`.toLowerCase();
    const candidate = candidates.find((item) => item.key === key);
    if (!candidate) fail(`Curated pick not found in library: ${key}`);
    if (used.has(key)) fail(`Curated pick used twice: ${key}`);
    used.add(key);
    return candidate;
  }

  return { claim, claimExact };
}

function selectAssets(candidates, styleOrder) {
  const selector = makeSelector(candidates);
  const styleOffset = hash(`${SEED}|style-offset`) % styleOrder.length;
  const styleStride = 7;
  let styleSlot = 0;
  const picksFile = join(repoRoot, 'scripts', 'quiz-picks.json');
  const curatedPicks = existsSync(picksFile)
    ? JSON.parse(readFileSync(picksFile, 'utf8').replace(/^﻿/, ''))
    : {};

  const rounds = ROUND_BLUEPRINTS.map((blueprint) => ({
    ...blueprint,
    candidates: blueprint.rooms.map((room, roomIndex) => {
      const style = styleOrder[(styleOffset + styleSlot * styleStride) % styleOrder.length];
      styleSlot += 1;
      const pick = curatedPicks[blueprint.id]?.[roomIndex];
      if (pick) return selector.claimExact(pick.style, pick.room, pick.filename);
      return selector.claim(style, room);
    }),
  }));

  const montages = {};
  for (const style of styleOrder) {
    const rooms = [...new Set(candidates
      .filter((candidate) => candidate.style === style && candidate.captioned)
      .map((candidate) => candidate.room))];
    montages[style] = [];
    for (const room of rooms) {
      if (montages[style].length === 6) break;
      montages[style].push(selector.claim(style, room, true));
    }
    while (montages[style].length < 6) montages[style].push(selector.claim(style, undefined, true));
  }

  const selected = [
    ...rounds.flatMap((round) => round.candidates),
    ...styleOrder.flatMap((style) => montages[style]),
  ];
  let fillerSlot = 0;
  while (selected.length < TARGET_IMAGE_COUNT) {
    const style = styleOrder[(styleOffset + fillerSlot * styleStride) % styleOrder.length];
    selected.push(selector.claim(style));
    fillerSlot += 1;
  }

  return { rounds, montages, selected };
}

function outputPathFor(style, ordinal) {
  const filename = `${style}-${String(ordinal).padStart(3, '0')}.webp`;
  return {
    absolute: join(outputRoot, style, filename),
    public: `/images/discover/${style}/${filename}`,
  };
}

async function encodeImage(source, output) {
  const sizes = [800, 720, 640, 560];
  const qualities = [75, 68, 60, 52, 45];
  for (const size of sizes) {
    for (const quality of qualities) {
      const buffer = await sharp(source)
        .rotate()
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality, effort: 4 })
        .toBuffer();
      if (buffer.length <= MAX_IMAGE_BYTES) {
        writeFileSync(output, buffer);
        return buffer.length;
      }
    }
  }
  fail(`${source} could not be encoded below 200KB.`);
}

const libraryRoot = readLibraryRoot();
const styleSpecsFile = join(libraryRoot, 'distill', 'style_specs.json');
if (!existsSync(styleSpecsFile)) fail(`Style specs are missing: ${styleSpecsFile}`);

let styleSpecs;
try {
  styleSpecs = JSON.parse(readFileSync(styleSpecsFile, 'utf8').replace(/^\uFEFF/, ''));
} catch (error) {
  fail(`style_specs.json is invalid JSON (${error.message}).`);
}

const styleOrder = Object.keys(styleSpecs);
if (styleOrder.length !== 15) fail(`Expected 15 styles in style_specs.json, found ${styleOrder.length}.`);

const captions = loadCaptions(libraryRoot);
const candidates = loadCandidates(libraryRoot, styleOrder, captions);
const selection = selectAssets(candidates, styleOrder);

const expectedOutput = resolve(repoRoot, 'public', 'images', 'discover');
if (resolve(outputRoot) !== expectedOutput) fail(`Refusing to clean unexpected output directory: ${outputRoot}`);
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });

const styleOrdinals = new Map();
const assetByCandidate = new Map();
const images = {};
let totalBytes = 0;

for (const candidate of selection.selected) {
  const ordinal = (styleOrdinals.get(candidate.style) || 0) + 1;
  styleOrdinals.set(candidate.style, ordinal);
  const output = outputPathFor(candidate.style, ordinal);
  mkdirSync(dirname(output.absolute), { recursive: true });
  const bytes = await encodeImage(candidate.source, output.absolute);
  totalBytes += bytes;
  const id = `${candidate.style}-${String(ordinal).padStart(3, '0')}`;
  const asset = {
    id,
    path: output.public,
    style: candidate.style,
    room: candidate.room,
    materials: candidate.materials,
    motifs: candidate.motifs,
  };
  assetByCandidate.set(candidate.key, asset);
  images[id] = asset;
}

const styles = {};
for (const style of styleOrder) {
  const overall = styleSpecs[style]?.overall;
  const palette = uniqueStrings(overall?.palette);
  if (!overall || typeof overall.essence !== 'string' || palette.length === 0) {
    fail(`Style ${style} is missing overall.essence or overall.palette in style_specs.json.`);
  }
  styles[style] = {
    label: displayName(style),
    essence: overall.essence.trim(),
    palette,
    montage: selection.montages[style].map((candidate) => assetByCandidate.get(candidate.key).path),
  };
}

const rounds = selection.rounds.map(({ rooms: _rooms, candidates: roundCandidates, ...round }) => ({
  ...round,
  imageIds: roundCandidates.map((candidate) => assetByCandidate.get(candidate.key).id),
}));

const manifest = {
  version: 2,
  seed: SEED,
  styleOrder,
  styles,
  images,
  rounds,
};

writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const relativeOutput = relative(repoRoot, outputRoot).replaceAll('\\', '/');
console.log(`Selected and encoded ${selection.selected.length} deterministic assets from sheets index order.`);
console.log(`Wrote ${rounds.length} image rounds and ${styleOrder.length} style montages to ${relative(repoRoot, manifestFile)}.`);
console.log(`${relativeOutput}: ${(totalBytes / 1024 / 1024).toFixed(2)}MB total.`);
