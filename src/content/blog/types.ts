export interface BlogCitation {
  id: string;
  title: string;
  publisher: string;
  url: string;
  accessedAt: string;
  primary: boolean;
}

export interface BlogImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  credit: string;
}

export interface BlogParagraph {
  text: string;
  citations?: string[];
}

export interface BlogSection {
  id: string;
  eyebrow?: string;
  heading: string;
  paragraphs: BlogParagraph[];
  image?: BlogImage;
  checklist?: string[];
  pullQuote?: string;
}

export interface BlogPost {
  slug: string;
  status: 'draft' | 'approved' | 'published';
  featured: boolean;
  title: string;
  seoTitle: string;
  description: string;
  dek: string;
  category: string;
  location: string;
  primaryKeyword: string;
  keywords: string[];
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
  };
  methodology: string;
  hero: BlogImage;
  sections: BlogSection[];
  sources: BlogCitation[];
  relatedProjects: string[];
}
