import { existsSync, mkdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const SEGMENT_IDS = ['exterior-approach'];
const DESKTOP_LIMIT = 20 * 1024 * 1024;
const MOBILE_LIMIT = 10 * 1024 * 1024;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = join(repoRoot, 'public', 'videos', 'segments');
const placeholderSource = join(repoRoot, 'public', 'videos', 'kitchen-desktop.mp4');
const sourceDir = join(repoRoot, 'assets-src', 'segments');
const placeholderMode = process.argv.includes('--placeholder');
const unknownArgs = process.argv.slice(2).filter((arg) => arg !== '--placeholder');

if (unknownArgs.length > 0) {
  fail(`Unknown argument(s): ${unknownArgs.join(', ')}. Use --placeholder or no arguments for real clips.`);
}

function fail(message) {
  console.error(`encode-segments: ${message}`);
  process.exit(1);
}

function executableWorks(command) {
  const result = spawnSync(command, ['-version'], { encoding: 'utf8', windowsHide: true });
  return !result.error && result.status === 0;
}

function resolveFfmpegTools() {
  const executableSuffix = process.platform === 'win32' ? '.exe' : '';
  const configured = process.env.FFMPEG_PATH?.trim();
  let ffmpeg = `ffmpeg${executableSuffix}`;
  let ffprobe = `ffprobe${executableSuffix}`;

  if (configured) {
    if (existsSync(configured) && statSync(configured).isDirectory()) {
      ffmpeg = join(configured, `ffmpeg${executableSuffix}`);
      ffprobe = join(configured, `ffprobe${executableSuffix}`);
    } else if (isAbsolute(configured) || configured.includes('/') || configured.includes('\\')) {
      ffmpeg = configured;
      const extension = extname(configured);
      ffprobe = join(dirname(configured), `ffprobe${extension}`);
    } else {
      ffmpeg = configured;
      ffprobe = basename(configured).replace(/^ffmpeg/i, 'ffprobe');
    }
  }

  if (!executableWorks(ffmpeg) || !executableWorks(ffprobe)) {
    fail(
      'ffmpeg and ffprobe are required. Install both on PATH, or set FFMPEG_PATH to the ffmpeg executable or its containing directory.',
    );
  }

  return { ffmpeg, ffprobe };
}

function run(command, args, label) {
  console.log(`\n[${label}]`);
  const result = spawnSync(command, args, { cwd: repoRoot, stdio: 'inherit', windowsHide: true });
  if (result.error) fail(`${label} could not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${label} failed with exit code ${result.status}.`);
}

function probeDuration(ffprobe, source) {
  const result = spawnSync(
    ffprobe,
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', source],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.error || result.status !== 0) {
    fail(`Could not read duration for ${source}. Confirm the file is a valid video.`);
  }
  const duration = Number.parseFloat(result.stdout.trim());
  if (!Number.isFinite(duration) || duration <= 0) fail(`ffprobe returned an invalid duration for ${source}.`);
  return duration;
}

function encodeVariant(ffmpeg, source, output, variant, clip, crfOverride) {
  const inputArgs = ['-y'];
  if (clip) inputArgs.push('-ss', clip.start.toFixed(4));
  inputArgs.push('-i', source);
  if (clip) inputArgs.push('-t', clip.duration.toFixed(4));

  const desktop = variant === 'desktop';
  const filter = desktop
    ? 'scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080'
    : 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,scale=720:1280';
  const crf = String(crfOverride ?? 26);

  run(
    ffmpeg,
    [
      ...inputArgs,
      '-map', '0:v:0',
      '-an',
      '-vf', filter,
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', crf,
      '-g', '1',
      '-bf', '0',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      output,
    ],
    `encode ${basename(output)} (crf ${crf})`,
  );
}

// All-intra encoding is larger, so walk the agreed CRF 26-28 ladder.
function encodeWithinBudget(ffmpeg, source, output, variant, clip, limit, label) {
  for (let crf = 26; crf <= 28; crf += 1) {
    encodeVariant(ffmpeg, source, output, variant, clip, crf);
    if (statSync(output).size <= limit) return;
    console.log(`${label}: over budget at crf ${crf}, retrying…`);
  }
  fail(`${label} exceeds ${(limit / 1024 / 1024).toFixed(0)}MB even at crf 28.`);
}

function makePoster(ffmpeg, video, poster) {
  run(
    ffmpeg,
    ['-y', '-i', video, '-map', '0:v:0', '-frames:v', '1', '-q:v', '2', poster],
    `poster ${basename(poster)}`,
  );
}

function checkBudget(file, limit, label) {
  const bytes = statSync(file).size;
  if (bytes > limit) {
    fail(`${label} is ${(bytes / 1024 / 1024).toFixed(2)}MB; budget is ${(limit / 1024 / 1024).toFixed(0)}MB.`);
  }
  console.log(`${label}: ${(bytes / 1024 / 1024).toFixed(2)}MB`);
}

const { ffmpeg, ffprobe } = resolveFfmpegTools();
mkdirSync(outputDir, { recursive: true });

let placeholderDuration = 0;
if (placeholderMode) {
  if (!existsSync(placeholderSource)) fail(`Placeholder source is missing: ${placeholderSource}`);
  placeholderDuration = probeDuration(ffprobe, placeholderSource);
}

for (const [index, id] of SEGMENT_IDS.entries()) {
  const source = placeholderMode ? placeholderSource : join(sourceDir, `${id}.mp4`);
  if (!existsSync(source)) {
    fail(`Source clip is missing: ${source}. Drop ${id}.mp4 into assets-src/segments/ or use --placeholder.`);
  }

  const sliceDuration = placeholderMode ? placeholderDuration / SEGMENT_IDS.length : undefined;
  const clip = sliceDuration === undefined ? undefined : { start: index * sliceDuration, duration: sliceDuration };
  const desktopVideo = join(outputDir, `${id}-desktop.mp4`);
  const mobileVideo = join(outputDir, `${id}-mobile.mp4`);
  const desktopPoster = join(outputDir, `${id}-desktop.jpg`);
  const mobilePoster = join(outputDir, `${id}-mobile.jpg`);

  encodeWithinBudget(ffmpeg, source, desktopVideo, 'desktop', clip, DESKTOP_LIMIT, `${id} desktop`);
  encodeWithinBudget(ffmpeg, source, mobileVideo, 'mobile', clip, MOBILE_LIMIT, `${id} mobile`);
  makePoster(ffmpeg, desktopVideo, desktopPoster);
  makePoster(ffmpeg, mobileVideo, mobilePoster);
  checkBudget(desktopVideo, DESKTOP_LIMIT, `${id} desktop`);
  checkBudget(mobileVideo, MOBILE_LIMIT, `${id} mobile`);
}

console.log(`\nEncoded ${SEGMENT_IDS.length} segments into ${outputDir}`);
