import type { BlogPost } from './types';

const modules = import.meta.glob('./posts/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, BlogPost>;

const today = new Date().toISOString().slice(0, 10);

export const allBlogPosts = Object.values(modules)
  .filter((post) => post.status === 'published' && post.publishedAt <= today)
  .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const featuredBlogPost = allBlogPosts.find((post) => post.featured) ?? allBlogPosts[0];

export const findBlogPost = (slug?: string) => allBlogPosts.find((post) => post.slug === slug);

export const blogPostPath = (post: BlogPost) => `/blog/${post.slug}`;

export const blogPostWordCount = (post: BlogPost) => post.sections.reduce(
  (total, section) => total + section.paragraphs.reduce(
    (sectionTotal, paragraph) => sectionTotal + paragraph.text.trim().split(/\s+/).filter(Boolean).length,
    0,
  ) + (section.checklist?.join(' ').trim().split(/\s+/).filter(Boolean).length ?? 0),
  0,
);

export const blogPostReadingMinutes = (post: BlogPost) => Math.max(1, Math.ceil(blogPostWordCount(post) / 210));
