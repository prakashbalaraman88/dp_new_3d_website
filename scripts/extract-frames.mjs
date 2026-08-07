import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const FPS = 12;
const DESKTOP_LIMIT = 16 * 1024 * 1024;
const MOBILE_LIMIT = 8 * 1024 * 1024;
const TOTAL_LIMIT = 24 * 1024 * 1024;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(repoRoot, 'assets-src', 'segments', 'exterior-approach.mp4');
const framesRoot = join(repoRoot, 'public', 'videos', 'frames');
const manifestFile = join(repoRoot, 'src', 'experience', 'frames.json');
const variants = {
  desktop: {
    width: 1600,
    height: 900,
    quality: 72,
    limit: DESKTOP_LIMIT,
  },
  mobile: {
    width: 648,
    height: 1152,
    quality: 70,
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

function resolveFfmpeg() {
  const executableSuffix = process.platform === 'win32' ? '.exe' : '';
  const configured = process.env.FFMPEG_PATH?.trim();
  let ffmpeg = `ffmpeg${executableSuffix}`;

  if (configured) {
    if (existsSync(configured) && statSync(configured).isDirectory()) {
      ffmpeg = join(configured, `ffmpeg${executableSuffix}`);
    } else {
      ffmpeg = configured;
    }
  }

  if (!executableWorks(ffmpeg)) {
    const configuredHint = configured
      ? `FFMPEG_PATH resolved to ${ffmpeg}, but it could not be executed.`
      : 'ffmpeg was not found on PATH.';
    fail(`${configuredHint} Install ffmpeg or set FFMPEG_PATH to the executable or its directory.`);
  }

  return ffmpeg;
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

function extractVariant(ffmpeg, name, config) {
  const outputDir = join(framesRoot, name);
  clearGeneratedFrames(outputDir);

  const filter = [
    `fps=${FPS}`,
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
    bytes,
  };
}

if (!existsSync(source) || !statSync(source).isFile()) {
  fail(`Source clip is missing: ${source}`);
}

const ffmpeg = resolveFfmpeg();
const desktop = extractVariant(ffmpeg, 'desktop', variants.desktop);
const mobile = extractVariant(ffmpeg, 'mobile', variants.mobile);
const totalBytes = desktop.bytes + mobile.bytes;
if (totalBytes > TOTAL_LIMIT) {
  fail(`desktop + mobile frames total ${formatMb(totalBytes)}; budget is ${formatMb(TOTAL_LIMIT)}.`);
}

const manifest = {
  desktop: {
    count: desktop.count,
    width: desktop.width,
    height: desktop.height,
  },
  mobile: {
    count: mobile.count,
    width: mobile.width,
    height: mobile.height,
  },
};
writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`\nWrote ${basename(manifestFile)}`);
console.log(`Total frame budget: ${formatMb(totalBytes)} / ${formatMb(TOTAL_LIMIT)}`);
