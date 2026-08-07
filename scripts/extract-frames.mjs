import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const MAX_FPS = 24;
const DESKTOP_LIMIT = 30 * 1024 * 1024;
const MOBILE_LIMIT = 16 * 1024 * 1024;
const TOTAL_LIMIT = 46 * 1024 * 1024;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(repoRoot, 'assets-src', 'segments', 'exterior-approach.mp4');
const framesRoot = join(repoRoot, 'public', 'videos', 'frames');
const manifestFile = join(repoRoot, 'src', 'experience', 'frames.json');
const variants = {
  desktop: {
    width: 1440,
    height: 810,
    quality: 70,
    limit: DESKTOP_LIMIT,
  },
  mobile: {
    width: 648,
    height: 1152,
    quality: 68,
    limit: MOBILE_LIMIT,
  },
};

if (process.argv.length > 2) {
  fail('This script does not accept arguments.');
}

function fail(message) {
  console.error(`extract-frames: ${message}`);
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

function parseFrameRate(value) {
  if (typeof value !== 'string' || value.length === 0) return Number.NaN;
  const [numeratorValue, denominatorValue = '1'] = value.split('/');
  const numerator = Number.parseFloat(numeratorValue);
  const denominator = Number.parseFloat(denominatorValue);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return Number.NaN;
  }
  return numerator / denominator;
}

function probeSourceFps(ffprobe) {
  const result = spawnSync(
    ffprobe,
    [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=avg_frame_rate,r_frame_rate',
      '-of', 'json',
      source,
    ],
    { encoding: 'utf8', windowsHide: true },
  );
  if (result.error || result.status !== 0) {
    fail(`Could not probe source fps for ${source}. Confirm the file is a valid video.`);
  }

  let stream;
  try {
    stream = JSON.parse(result.stdout).streams?.[0];
  } catch {
    fail(`ffprobe returned invalid JSON while probing source fps for ${source}.`);
  }

  const averageFps = parseFrameRate(stream?.avg_frame_rate);
  const reportedFps = parseFrameRate(stream?.r_frame_rate);
  const sourceFps = Number.isFinite(averageFps) && averageFps > 0 ? averageFps : reportedFps;
  if (!Number.isFinite(sourceFps) || sourceFps <= 0) {
    fail(`ffprobe returned an invalid source fps for ${source}.`);
  }

  return { sourceFps, extractionFps: Math.min(sourceFps, MAX_FPS) };
}

function run(command, args, label) {
  console.log(`\n[${label}]`);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.error) fail(`${label} could not start: ${result.error.message}`);
  if (result.status !== 0) fail(`${label} failed with exit code ${result.status}.`);
}

function clearGeneratedFrames(directory) {
  mkdirSync(directory, { recursive: true });
  for (const name of readdirSync(directory)) {
    if (/^f_\d{4}\.webp$/i.test(name)) unlinkSync(join(directory, name));
  }
}

function frameFiles(directory) {
  return readdirSync(directory)
    .filter((name) => /^f_\d{4}\.webp$/i.test(name))
    .sort((left, right) => left.localeCompare(right));
}

function directoryBytes(directory) {
  return frameFiles(directory).reduce((bytes, name) => bytes + statSync(join(directory, name)).size, 0);
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

function extractVariant(ffmpeg, name, config, fps) {
  const outputDir = join(framesRoot, name);
  clearGeneratedFrames(outputDir);

  const filter = [
    `fps=${fps.toFixed(6)}`,
    `scale=${config.width}:${config.height}:force_original_aspect_ratio=increase`,
    `crop=${config.width}:${config.height}`,
  ].join(',');
  const outputPattern = join(outputDir, 'f_%04d.webp');

  run(
    ffmpeg,
    [
      '-y',
      '-i', source,
      '-map', '0:v:0',
      '-an',
      '-vf', filter,
      '-c:v', 'libwebp',
      '-quality', String(config.quality),
      '-compression_level', '6',
      '-preset', 'picture',
      '-start_number', '1',
      '-vsync', '0',
      outputPattern,
    ],
    `extract ${name} frames`,
  );

  const files = frameFiles(outputDir);
  if (files.length === 0) fail(`ffmpeg produced no ${name} frames.`);
  files.forEach((file, index) => {
    const expected = `f_${String(index + 1).padStart(4, '0')}.webp`;
    if (file !== expected) fail(`${name} frame sequence is not contiguous: expected ${expected}, found ${file}.`);
  });

  const bytes = directoryBytes(outputDir);
  if (bytes > config.limit) {
    fail(`${name} frames total ${formatMb(bytes)}; budget is ${formatMb(config.limit)}.`);
  }
  console.log(`${name}: ${files.length} frames, ${formatMb(bytes)}`);

  return {
    count: files.length,
    width: config.width,
    height: config.height,
    fps,
    bytes,
  };
}

if (!existsSync(source) || !statSync(source).isFile()) {
  fail(`Source clip is missing: ${source}`);
}

const { ffmpeg, ffprobe } = resolveFfmpegTools();
const { sourceFps, extractionFps: fps } = probeSourceFps(ffprobe);
console.log(
  `Source frame rate: ${sourceFps.toFixed(3)}fps; extracting at ${fps.toFixed(3)}fps (cap ${MAX_FPS}fps)`,
);
const desktop = extractVariant(ffmpeg, 'desktop', variants.desktop, fps);
const mobile = extractVariant(ffmpeg, 'mobile', variants.mobile, fps);
const totalBytes = desktop.bytes + mobile.bytes;
if (totalBytes > TOTAL_LIMIT) {
  fail(`desktop + mobile frames total ${formatMb(totalBytes)}; budget is ${formatMb(TOTAL_LIMIT)}.`);
}

const manifest = {
  desktop: {
    count: desktop.count,
    width: desktop.width,
    height: desktop.height,
    fps: desktop.fps,
  },
  mobile: {
    count: mobile.count,
    width: mobile.width,
    height: mobile.height,
    fps: mobile.fps,
  },
};
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`\nWrote ${basename(manifestFile)}`);
console.log(`Total frame budget: ${formatMb(totalBytes)} / ${formatMb(TOTAL_LIMIT)}`);
