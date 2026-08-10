import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import {
  imageForMeta,
  pageSchemaForMeta,
  robotsForMeta,
  routeMeta,
} from '../config/seo';

export default function SEO() {
  const { pathname } = useLocation();
  const meta = routeMeta(pathname);
  const image = imageForMeta(meta);
  const robots = robotsForMeta(meta);
  const pageSchema = pageSchemaForMeta(meta);

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={meta.canonical} />

      <meta property="og:type" content={meta.type ?? 'website'} />
      <meta property="og:url" content={meta.canonical} />
      <meta property="og:site_name" content="DezignPool" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content={image.endsWith('.png') ? 'image/png' : 'image/webp'} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="DezignPool interior design and architecture" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content="DezignPool interior design and architecture" />

      {meta.publishedAt && <meta property="article:published_time" content={meta.publishedAt} />}
      {meta.modifiedAt && <meta property="article:modified_time" content={meta.modifiedAt} />}
      {meta.author && <meta property="article:author" content={meta.author} />}
      {meta.keywords && <meta name="keywords" content={meta.keywords.join(', ')} />}

      <script id="route-page-schema" type="application/ld+json">{JSON.stringify(pageSchema)}</script>
    </Helmet>
  );
}
