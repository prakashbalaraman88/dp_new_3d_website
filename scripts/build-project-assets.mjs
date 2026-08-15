import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const projectRoot = path.resolve('Projects');
const outputRoot = path.resolve('public/images/projects');

const projectFolders = {
  'Century Ethos': 'century-ethos',
  'Kolte Patil': 'kolte-patil',
  'Prestige Lakeridge': 'prestige-lakeridge',
  'Sun and Sanctum': 'sun-and-sanctum',
  'Total Environment - After the Rain': 'after-the-rain',
};

const isImage = (fileName) => /\.(jpe?g|png|webp)$/i.test(fileName);

async function buildImage(sourcePath, destinationPath, options) {
  await sharp(sourcePath)
    .rotate()
    .resize({
      width: options.width,
      height: options.height,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: options.quality, effort: 5, smartSubsample: true })
    .toFile(destinationPath);
}

await fs.mkdir(outputRoot, { recursive: true });

let imageCount = 0;
let sourceBytes = 0;
let outputBytes = 0;

for (const [folderName, slug] of Object.entries(projectFolders)) {
  const sourceFolder = path.join(projectRoot, folderName);
  const destinationFolder = path.join(outputRoot, slug);
  const files = (await fs.readdir(sourceFolder)).filter(isImage).sort();

  await fs.mkdir(destinationFolder, { recursive: true });

  for (const fileName of files) {
    const sourcePath = path.join(sourceFolder, fileName);
    const fileStem = path.parse(fileName).name;
    const fullPath = path.join(destinationFolder, `${fileStem}.webp`);
    const previewPath = path.join(destinationFolder, `${fileStem}-preview.webp`);

    await buildImage(sourcePath, fullPath, { width: 2400, height: 2400, quality: 82 });
    await buildImage(sourcePath, previewPath, { width: 1100, height: 1400, quality: 76 });

    const [sourceStat, fullStat, previewStat] = await Promise.all([
      fs.stat(sourcePath),
      fs.stat(fullPath),
      fs.stat(previewPath),
    ]);

    sourceBytes += sourceStat.size;
    outputBytes += fullStat.size + previewStat.size;
    imageCount += 1;
    console.log(`${slug}/${fileStem}.webp`);
  }
}

const toMegabytes = (bytes) => (bytes / 1024 / 1024).toFixed(1);
console.log(`Built ${imageCount} project images (${toMegabytes(sourceBytes)} MB source -> ${toMegabytes(outputBytes)} MB web assets).`);
