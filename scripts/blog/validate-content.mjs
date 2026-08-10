import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const postsPath = path.join(projectRoot, 'src/content/blog/posts');
const today = new Date().toISOString().slice(0, 10);

const errors = [];
const warn = [];
const seenSlugs = new Set();
const seenTitles = new Set();

const words = (value = '') => value.trim().split(/\s+/).filter(Boolean).length;

const validateImage = async (post, image, label) => {
  if (!image?.src?.startsWith('/')) {
    errors.push(`${post.slug}: ${label} must use a locally hosted path`);
    return;
  }
  if (!image.alt || image.alt.length < 20 || image.alt.length > 160) {
    errors.push(`${post.slug}: ${label} alt text must be 20-160 characters`);
  }
  if (!image.caption || !image.credit) {
    errors.push(`${post.slug}: ${label} needs a caption and credit`);
  }
  if (!Number.isFinite(image.width) || !Number.isFinite(image.height)) {
    errors.push(`${post.slug}: ${label} needs intrinsic width and height`);
  }
  try {
    await access(path.join(projectRoot, 'public', image.src.replace(/^\//, '')));
  } catch {
    errors.push(`${post.slug}: missing local image ${image.src}`);
  }
};

const files = (await readdir(postsPath)).filter((file) => file.endsWith('.json'));

if (files.length === 0) errors.push('No blog post JSON files found');

for (const file of files) {
  let post;
  try {
    post = JSON.parse(await readFile(path.join(postsPath, file), 'utf8'));
  } catch (error) {
    errors.push(`${file}: invalid JSON (${error.message})`);
    continue;
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug ?? '')) {
    errors.push(`${file}: slug must be lowercase kebab-case`);
  }
  if (seenSlugs.has(post.slug)) errors.push(`${file}: duplicate slug ${post.slug}`);
  if (seenTitles.has(post.seoTitle)) errors.push(`${file}: duplicate SEO title ${post.seoTitle}`);
  seenSlugs.add(post.slug);
  seenTitles.add(post.seoTitle);

  if (!['draft', 'approved', 'published'].includes(post.status)) {
    errors.push(`${post.slug}: invalid status ${post.status}`);
  }
  if ((post.seoTitle?.length ?? 0) < 30 || (post.seoTitle?.length ?? 0) > 60) {
    errors.push(`${post.slug}: SEO title must be 30-60 characters (received ${post.seoTitle?.length ?? 0})`);
  }
  if ((post.description?.length ?? 0) < 120 || (post.description?.length ?? 0) > 160) {
    errors.push(`${post.slug}: meta description must be 120-160 characters (received ${post.description?.length ?? 0})`);
  }
  if (!post.title || !post.dek || !post.primaryKeyword || (post.keywords?.length ?? 0) < 3) {
    errors.push(`${post.slug}: missing headline, dek, primary keyword or keyword set`);
  }
  if (!post.author?.name || !post.author?.role || !post.methodology) {
    errors.push(`${post.slug}: author identity and creation methodology are required`);
  }
  if (!/AI/i.test(post.methodology ?? '')) {
    errors.push(`${post.slug}: methodology must disclose AI involvement`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.publishedAt ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(post.updatedAt ?? '')) {
    errors.push(`${post.slug}: publication dates must use YYYY-MM-DD`);
  }
  if (post.status === 'published' && post.publishedAt > today) {
    errors.push(`${post.slug}: a published article cannot be future-dated`);
  }

  const bodyWords = (post.sections ?? []).reduce((total, section) => (
    total
    + (section.paragraphs ?? []).reduce((sum, paragraph) => sum + words(paragraph.text), 0)
    + words((section.checklist ?? []).join(' '))
  ), 0);
  const imageCount = 1 + (post.sections ?? []).filter((section) => section.image).length;

  if (post.status !== 'draft' && bodyWords < 1500) {
    errors.push(`${post.slug}: approved/published articles need at least 1,500 useful words (received ${bodyWords})`);
  }
  if ((post.sections?.length ?? 0) < 6) {
    errors.push(`${post.slug}: use at least six substantive sections`);
  }
  if (post.status !== 'draft' && imageCount < 5) {
    errors.push(`${post.slug}: approved/published articles need at least five images (received ${imageCount})`);
  }
  if ((post.sources?.length ?? 0) < 3 || post.sources.filter((source) => source.primary).length < 2) {
    errors.push(`${post.slug}: use at least three sources, including two primary sources`);
  }

  const sourceIds = new Set((post.sources ?? []).map((source) => source.id));
  for (const section of post.sections ?? []) {
    if (!section.id || !section.heading || (section.paragraphs?.length ?? 0) === 0) {
      errors.push(`${post.slug}: every section needs an id, heading and paragraphs`);
    }
    for (const paragraph of section.paragraphs ?? []) {
      for (const citation of paragraph.citations ?? []) {
        if (!sourceIds.has(citation)) errors.push(`${post.slug}: unknown citation ${citation}`);
      }
    }
  }

  for (const source of post.sources ?? []) {
    if (!source.id || !source.title || !source.publisher || !/^https:\/\//.test(source.url ?? '')) {
      errors.push(`${post.slug}: every source needs an id, title, publisher and HTTPS URL`);
    }
  }

  await validateImage(post, post.hero, 'hero image');
  for (const [index, section] of (post.sections ?? []).entries()) {
    if (section.image) await validateImage(post, section.image, `section ${index + 1} image`);
  }

  if (!(post.relatedProjects?.length >= 2)) {
    warn.push(`${post.slug}: add at least two related project links`);
  }

  console.log(`${post.slug}: ${bodyWords} words, ${imageCount} images, ${post.sources.length} sources`);
}

for (const message of warn) console.warn(`WARN ${message}`);

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Blog validation passed for ${files.length} post(s).`);
}
