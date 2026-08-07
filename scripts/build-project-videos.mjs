import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const projectRoot = path.resolve('Projects');
const videoOutputRoot = path.resolve('public/videos/projects');
const imageOutputRoot = path.resolve('public/images/projects');
const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
const maxOutputBytes = 8 * 1024 * 1024;

const projectFolders = {
  'Century Ethos': 'century-ethos',
  'Kolte Patil': 'kolte-patil',
  'Prestige Lakeridge': 'prestige-lakeridge',
  'Total Environment - After the Rain': 'after-the-rain',
};

function runFfmpeg(args) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', ...args], {
    stdio: 'inherit',
    windowsHide: true,
  });

  if (result.error) {
    throw new Error(`Unable to run ffmpeg. Install it or set FFMPEG_PATH. ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`ffmpeg exited with status ${result.status}.`);
  }
}

await fs.mkdir(videoOutputRoot, { recursive: true });

let builtCount = 0;

for (const [folderName, slug] of Object.entries(projectFolders)) {
  const sourcePath = path.join(projectRoot, folderName, `${slug}-montage.mp4`);

  try {
    await fs.access(sourcePath);
  } catch {
    continue;
  }

  const videoPath = path.join(videoOutputRoot, `${slug}-montage.mp4`);
  const posterFolder = path.join(imageOutputRoot, slug);
  const posterPath = path.join(posterFolder, `${slug}-montage-poster.webp`);
  await fs.mkdir(posterFolder, { recursive: true });

  runFfmpeg([
    '-i', sourcePath,
    '-map', '0:v:0',
    '-vf', 'scale=720:-2:flags=lanczos',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '23',
    '-profile:v', 'high',
    '-level', '4.0',
    '-pix_fmt', 'yuv420p',
    '-g', '48',
    '-keyint_min', '48',
    '-sc_threshold', '0',
    '-tag:v', 'avc1',
    '-movflags', '+faststart',
    '-an',
    '-y', videoPath,
  ]);

  runFfmpeg([
    '-ss', '0.8',
    '-i', sourcePath,
    '-frames:v', '1',
    '-vf', 'scale=1100:-2:flags=lanczos',
    '-c:v', 'libwebp',
    '-quality', '82',
    '-y', posterPath,
  ]);

  const outputStat = await fs.stat(videoPath);
  if (outputStat.size > maxOutputBytes) {
    throw new Error(`${path.basename(videoPath)} is ${(outputStat.size / 1024 / 1024).toFixed(1)} MB; the project-film budget is 8 MB.`);
  }

  builtCount += 1;
  console.log(`${slug}: ${(outputStat.size / 1024 / 1024).toFixed(2)} MB video + poster`);
}

if (builtCount === 0) {
  console.log('No project montages found. Add Projects/<project>/<project-slug>-montage.mp4.');
} else {
  console.log(`Built ${builtCount} project montage${builtCount === 1 ? '' : 's'}.`);
}
