import { findProject, projects } from '../components/Projects/data';
import { allBlogPosts, blogPostPath, findBlogPost } from '../content/blog';

export const SITE_URL = 'https://www.dezignpool.com';
export const SOCIAL_IMAGE = `${SITE_URL}/assets/images/dezignpool-social-preview-v2.png`;
export const DEFAULT_DESCRIPTION = 'Bangalore interior design studio creating thoughtful, high-end homes through architecture, interiors, and end-to-end execution.';

export interface RouteMeta {
  path: string;
  title: string;
  description: string;
  canonical: string;
  index: boolean;
  type?: 'website' | 'article';
  image?: string;
  contentKind?: 'project' | 'blog';
  publishedAt?: string;
  modifiedAt?: string;
  author?: string;
  keywords?: string[];
  schemaHeadline?: string;
}

export const staticRoutes: Record<string, Omit<RouteMeta, 'path' | 'canonical'>> = {
  '/': {
    title: 'DezignPool | Interior Design & Architecture in Bangalore',
    description: DEFAULT_DESCRIPTION,
    index: true,
  },
  '/about': {
    title: 'About DezignPool | Bangalore Interior Design Studio',
    description: 'Meet the DezignPool team and learn how we approach architecture, interior design, and home execution in Bangalore.',
    index: true,
  },
  '/services': {
    title: 'Interior Design & Architecture Services | DezignPool',
    description: 'Explore DezignPool services for residential architecture, interior design, renovation, and end-to-end project execution in Bangalore.',
    index: true,
  },
  '/projects': {
    title: 'Residential Interior Design Projects | DezignPool',
    description: 'Explore selected DezignPool homes across Bangalore, with project stories, design details, photographs, and films.',
    index: true,
  },
  '/calculator': {
    title: 'Home Construction Cost Calculator | DezignPool',
    description: 'Estimate a starting budget for a home construction project, then speak with DezignPool for a scope-based consultation.',
    index: true,
  },
  '/interior-calculator': {
    title: 'Interior Design Cost Calculator | DezignPool',
    description: 'Estimate a starting budget for home interiors and request a detailed scope-based consultation from DezignPool.',
    index: true,
  },
  '/privacy': {
    title: 'Privacy Notice | DezignPool',
    description: 'How DezignPool handles website enquiries, WhatsApp consent, analytics choices, and privacy requests.',
    index: true,
  },
  '/blog': {
    title: 'The Bangalore Edit | DezignPool Journal',
    description: 'Research-led stories on Bangalore interiors, climate, materials, planning and residential design from the DezignPool studio.',
    index: true,
  },
};

const normalizePath = (pathname: string) => pathname !== '/' ? pathname.replace(/\/$/, '') : pathname;

export const routeMeta = (pathname: string): RouteMeta => {
  const path = normalizePath(pathname);
  const staticMeta = staticRoutes[path];
  if (staticMeta) return { ...staticMeta, path, canonical: `${SITE_URL}${path}` };

  if (path.startsWith('/project/')) {
    const project = findProject(path.split('/')[2]);
    if (project) {
      return {
        path,
        title: `${project.title} Interior Design Project | DezignPool`,
        description: project.summary,
        canonical: `${SITE_URL}/project/${project.id}`,
        index: true,
        type: 'article',
        contentKind: 'project',
        image: `${SITE_URL}${project.images[project.teaser[0]].src}`,
      };
    }
  }

  if (path.startsWith('/blog/')) {
    const post = findBlogPost(path.split('/')[2]);
    if (post) {
      return {
        path,
        title: post.seoTitle,
        description: post.description,
        canonical: `${SITE_URL}${blogPostPath(post)}`,
        index: true,
        type: 'article',
        contentKind: 'blog',
        image: `${SITE_URL}${post.hero.src}`,
        publishedAt: post.publishedAt,
        modifiedAt: post.updatedAt,
        author: post.author.name,
        keywords: post.keywords,
        schemaHeadline: post.title,
      };
    }
  }

  return {
    path,
    title: 'DezignPool | Interior Design & Architecture in Bangalore',
    description: DEFAULT_DESCRIPTION,
    canonical: `${SITE_URL}${path === '/' ? '/' : path}`,
    index: false,
  };
};

export const getIndexableRouteMeta = () => [
  ...Object.keys(staticRoutes).map(routeMeta),
  ...projects.map((project) => routeMeta(`/project/${project.id}`)),
  ...allBlogPosts.map((post) => routeMeta(blogPostPath(post))),
];

export const imageForMeta = (meta: RouteMeta) => meta.image ?? SOCIAL_IMAGE;

export const robotsForMeta = (meta: RouteMeta) => meta.index
  ? 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
  : 'noindex,follow';

export const pageSchemaForMeta = (meta: RouteMeta) => meta.contentKind === 'blog'
  ? {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      '@id': `${meta.canonical}#article`,
      mainEntityOfPage: { '@type': 'WebPage', '@id': meta.canonical },
      url: meta.canonical,
      headline: meta.schemaHeadline ?? meta.title,
      description: meta.description,
      image: [imageForMeta(meta)],
      datePublished: meta.publishedAt,
      dateModified: meta.modifiedAt,
      author: { '@type': 'Organization', name: meta.author, url: `${SITE_URL}/about` },
      publisher: { '@id': `${SITE_URL}/#organization` },
      about: { '@type': 'Place', name: 'Bangalore, Karnataka' },
      keywords: meta.keywords?.join(', '),
      inLanguage: 'en-IN',
    }
  : {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${meta.canonical}#webpage`,
      url: meta.canonical,
      name: meta.title,
      description: meta.description,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      primaryImageOfPage: { '@type': 'ImageObject', url: imageForMeta(meta) },
    };
