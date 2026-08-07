import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DESKTOP_VIDEO_LIMIT = 20 * 1024 * 1024;
const MOBILE_VIDEO_LIMIT = 8 * 1024 * 1024;
const DESKTOP_FRAMES_LIMIT = 16 * 1024 * 1024;
const MOBILE_FRAMES_LIMIT = 8 * 1024 * 1024;
const FRAMES_LIMIT = 24 * 1024 * 1024;
const DISCOVER_LIMIT = 60 * 1024 * 1024;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(repoRoot, 'public');
const walkthroughFile = join(repoRoot, 'src', 'experience', 'walkthrough.ts');
const framesManifestFile = join(repoRoot, 'src', 'experience', 'frames.json');
const quizAssetsFile = join(repoRoot, 'src', 'discover', 'quizAssets.json');
const framesRoot = join(publicRoot, 'videos', 'frames');
const discoverRoot = join(publicRoot, 'images', 'discover');
const errors = [];
const frameCounts = { desktop: 0, mobile: 0 };
const frameVariants = {
  desktop: { width: 1600, height: 900, limit: DESKTOP_FRAMES_LIMIT },
  mobile: { width: 648, height: 1152, limit: MOBILE_FRAMES_LIMIT },
};

function issue(message) {
  errors.push(message);
}

function publicFile(publicPath) {
  if (typeof publicPath !== 'string' || !publicPath.startsWith('/')) {
    issue(`Expected a root-relative public path, received ${JSON.stringify(publicPath)}.`);
    return null;
  }
  const resolved = resolve(publicRoot, publicPath.replace(/^\/+/, ''));
  const fromPublic = relative(publicRoot, resolved);
  if (fromPublic.startsWith('..') || isAbsolute(fromPublic)) {
    issue(`Public path escapes public/: ${publicPath}`);
    return null;
  }
  return resolved;
}

function fileSize(publicPath, label) {
  const file = publicFile(publicPath);
  if (!file) return null;
  if (!existsSync(file) || !statSync(file).isFile()) {
    issue(`${label} is missing: ${publicPath}`);
    return null;
  }
  return statSync(file).size;
}

function readJson(file, label) {
  try {
    return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    issue(`${label} could not be read: ${error.message}`);
    return null;
  }
}

function parseWalkthrough() {
  if (!existsSync(walkthroughFile)) {
    issue('src/experience/walkthrough.ts is missing.');
    return [];
  }
  const source = readFileSync(walkthroughFile, 'utf8');
  const pattern = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*src:\s*['"]([^'"]+)['"]\s*,\s*mobileSrc:\s*['"]([^'"]+)['"]\s*,\s*poster:\s*['"]([^'"]+)['"]\s*,\s*mobilePoster:\s*['"]([^'"]+)['"]\s*,\s*acts:\s*\[/g;
  const segments = [];
  for (const match of source.matchAll(pattern)) {
    segments.push({
      id: match[1],
      src: match[2],
      mobileSrc: match[3],
      poster: match[4],
      mobilePoster: match[5],
    });
  }
  if (segments.length < 1) issue(`Expected at least 1 walkthrough segment, parsed ${segments.length}.`);
  return segments;
}

function collectDiscoverPaths(value, paths = new Set()) {
  if (typeof value === 'string' && value.startsWith('/images/discover/')) {
    paths.add(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectDiscoverPaths(item, paths));
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectDiscoverPaths(item, paths));
  }
  return paths;
}

function directoryBytes(directory) {
  if (!existsSync(directory)) return 0;
  let bytes = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const child = join(directory, entry.name);
    bytes += entry.isDirectory() ? directoryBytes(child) : statSync(child).size;
  }
  return bytes;
}

const segments = parseWalkthrough();
for (const segment of segments) {
  const desktopBytes = fileSize(segment.src, `${segment.id} desktop video`);
  const mobileBytes = fileSize(segment.mobileSrc, `${segment.id} mobile video`);
  fileSize(segment.poster, `${segment.id} desktop poster`);
  fileSize(segment.mobilePoster, `${segment.id} mobile poster`);
  if (desktopBytes !== null && desktopBytes > DESKTOP_VIDEO_LIMIT) {
    issue(`${segment.id} desktop video is ${(desktopBytes / 1024 / 1024).toFixed(2)}MB; limit is 20MB.`);
  }
  if (mobileBytes !== null && mobileBytes > MOBILE_VIDEO_LIMIT) {
    issue(`${segment.id} mobile video is ${(mobileBytes / 1024 / 1024).toFixed(2)}MB; limit is 8MB.`);
  }
}

const framesManifest = existsSync(framesManifestFile)
  ? readJson(framesManifestFile, 'frames.json')
  : null;
if (!existsSync(framesManifestFile)) issue('src/experience/frames.json is missing.');
if (!existsSync(framesRoot)) {
  issue('public/videos/frames is missing. Run node scripts/extract-frames.mjs.');
}

if (framesManifest) {
  for (const [variant, expected] of Object.entries(frameVariants)) {
    const manifest = framesManifest[variant];
    if (!manifest || typeof manifest !== 'object') {
      issue(`frames.json has no ${variant} manifest.`);
      continue;
    }

    const { count, width, height } = manifest;
    if (!Number.isInteger(count) || count <= 0) {
      issue(`frames.json ${variant}.count must be a positive integer. Run node scripts/extract-frames.mjs.`);
      continue;
    }
    frameCounts[variant] = count;
    if (width !== expected.width || height !== expected.height) {
      issue(
        `frames.json ${variant} dimensions are ${width}x${height}; expected ${expected.width}x${expected.height}.`,
      );
    }

    const variantRoot = join(framesRoot, variant);
    if (!existsSync(variantRoot) || !statSync(variantRoot).isDirectory()) {
      issue(`Frame directory is missing: public/videos/frames/${variant}`);
      continue;
    }

    const actualFrames = readdirSync(variantRoot)
      .filter((name) => /^f_\d{4}\.webp$/i.test(name))
      .sort((left, right) => left.localeCompare(right));
    const expectedFrames = Array.from(
      { length: count },
      (_, index) => `f_${String(index + 1).padStart(4, '0')}.webp`,
    );
    const actualSet = new Set(actualFrames);
    const expectedSet = new Set(expectedFrames);
    const missingFrames = expectedFrames.filter((name) => !actualSet.has(name));
    const unlistedFrames = actualFrames.filter((name) => !expectedSet.has(name));

    if (actualFrames.length !== count) {
      issue(
        `${variant} frame manifest lists ${count} frames, but the directory contains ${actualFrames.length}.`,
      );
    }
    if (missingFrames.length > 0) {
      issue(
        `${variant} is missing ${missingFrames.length} manifest frame(s); first missing: ${missingFrames[0]}.`,
      );
    }
    if (unlistedFrames.length > 0) {
      issue(
        `${variant} contains ${unlistedFrames.length} frame(s) not listed by the manifest count; first extra: ${unlistedFrames[0]}.`,
      );
    }

    const variantBytes = directoryBytes(variantRoot);
    if (variantBytes > expected.limit) {
      issue(
        `${variant} frames total ${(variantBytes / 1024 / 1024).toFixed(2)}MB; limit is ${expected.limit / 1024 / 1024}MB.`,
      );
    }
  }
}

const framesBytes = directoryBytes(framesRoot);
if (framesBytes > FRAMES_LIMIT) {
  issue(`public/videos/frames is ${(framesBytes / 1024 / 1024).toFixed(2)}MB; limit is 22MB.`);
}

const quizAssets = existsSync(quizAssetsFile) ? readJson(quizAssetsFile, 'quizAssets.json') : null;
if (!existsSync(quizAssetsFile)) issue('src/discover/quizAssets.json is missing.');

if (quizAssets) {
  if (quizAssets.seed === 'unbuilt-placeholder') {
    issue('quizAssets.json is still the compile-time placeholder. Run node scripts/build-quiz-assets.mjs.');
  }
  const images = quizAssets.images && typeof quizAssets.images === 'object' ? quizAssets.images : {};
  const imageRounds = Array.isArray(quizAssets.rounds)
    ? quizAssets.rounds.filter((round) => round?.kind === 'quad')
    : [];
  if (imageRounds.length < 8) issue(`Expected at least 8 image rounds, found ${imageRounds.length}.`);
  if (Array.isArray(quizAssets.rounds) && imageRounds.length !== quizAssets.rounds.length) {
    issue('Every quiz round must be a quad round.');
  }

  const styleOrder = Array.isArray(quizAssets.styleOrder) ? quizAssets.styleOrder : [];
  const uniqueStyles = new Set(styleOrder);
  if (styleOrder.length !== 15 || uniqueStyles.size !== 15) {
    issue(`Expected 15 unique styles in styleOrder, found ${uniqueStyles.size}.`);
  }

  const appearances = new Map(styleOrder.map((style) => [style, 0]));
  const pathToImage = new Map();
  for (const [imageId, image] of Object.entries(images)) {
    if (!image || typeof image !== 'object') {
      issue(`Image metadata ${imageId} is not an object.`);
      continue;
    }
    if (typeof image.path === 'string') pathToImage.set(image.path, image);
    if (!uniqueStyles.has(image.style)) issue(`Image ${imageId} references unknown style ${image.style}.`);
  }

  for (const round of imageRounds) {
    if (!Array.isArray(round.imageIds)) {
      issue(`Round ${round.id || '(unknown)'} has no imageIds array.`);
      continue;
    }
    if (round.imageIds.length !== 4) {
      issue(`Round ${round.id || '(unknown)'} must reference exactly 4 images.`);
    }
    for (const imageId of round.imageIds) {
      const image = images[imageId];
      if (!image) {
        issue(`Round ${round.id || '(unknown)'} references unknown image id ${imageId}.`);
      } else {
        appearances.set(image.style, (appearances.get(image.style) || 0) + 1);
      }
    }
  }

  for (const style of styleOrder) {
    const montage = quizAssets.styles?.[style]?.montage;
    if (!Array.isArray(montage) || montage.length < 6) {
      issue(`Style ${style} must have a 6-image montage.`);
      continue;
    }
    for (const imagePath of montage) {
      const image = pathToImage.get(imagePath);
      if (!image) {
        issue(`Style ${style} montage references a path without image metadata: ${imagePath}`);
      } else if (image.style !== style) {
        issue(`Style ${style} montage includes ${imagePath}, which belongs to ${image.style}.`);
      } else {
        appearances.set(style, (appearances.get(style) || 0) + 1);
      }
    }
  }

  for (const style of styleOrder) {
    const count = appearances.get(style) || 0;
    if (count < 3) issue(`Style ${style} appears ${count} times across rounds and montages; minimum is 3.`);
  }

  const discoverPaths = collectDiscoverPaths(quizAssets);
  if (discoverPaths.size === 0) issue('quizAssets.json contains no /images/discover paths.');
  for (const imagePath of discoverPaths) fileSize(imagePath, 'Quiz image');
}

if (!existsSync(discoverRoot)) {
  issue('public/images/discover is missing. Run node scripts/build-quiz-assets.mjs.');
}
const discoverBytes = directoryBytes(discoverRoot);
if (discoverBytes > DISCOVER_LIMIT) {
  issue(`public/images/discover is ${(discoverBytes / 1024 / 1024).toFixed(2)}MB; limit is 60MB.`);
}

if (errors.length > 0) {
  console.error(`verify-journey: FAILED (${errors.length} issue${errors.length === 1 ? '' : 's'})`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('verify-journey: OK');
console.log(`- ${segments.length} walkthrough segment${segments.length === 1 ? '' : 's'}`);
console.log(
  `- ${frameCounts.desktop} desktop frames, ${frameCounts.mobile} mobile frames (${(framesBytes / 1024 / 1024).toFixed(2)}MB)`,
);
console.log(`- ${quizAssets.rounds.length} image rounds, ${quizAssets.styleOrder.length} styles`);
console.log(`- public/images/discover ${(discoverBytes / 1024 / 1024).toFixed(2)}MB`);
