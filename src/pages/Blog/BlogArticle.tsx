import { ArrowLeft, ArrowUpRight, Clock3, MapPin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {
  blogPostReadingMinutes,
  findBlogPost,
} from '../../content/blog';
import type { BlogPost } from '../../content/blog/types';
import { findProject } from '../../components/Projects/data';
import LeadForm from '../../discover/LeadForm';
import type { Answers } from '../../discover/report';
import '../../discover/showcase.css';
import './blog.css';

const BLOG_LEAD_ANSWERS: Answers = {};

const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${value}T12:00:00+05:30`));

function ConsultationCallout() {
  return (
    <aside className="dp-article-callout">
      <p>Planning a Bangalore home?</p>
      <h2>Bring us the plan, the orientation and the way you want to live.</h2>
      <a href="#lead-form">Start your design brief <ArrowUpRight aria-hidden="true" /></a>
    </aside>
  );
}

function ArticleSources({ post }: { post: BlogPost }) {
  return (
    <section className="dp-article-sources" aria-labelledby="article-sources-title">
      <p className="dp-article-kicker">Research ledger</p>
      <h2 id="article-sources-title">Sources &amp; method</h2>
      <p className="dp-article-method">{post.methodology}</p>
      <ol>
        {post.sources.map((source) => (
          <li id={`source-${source.id}`} key={source.id}>
            <span>{String(post.sources.indexOf(source) + 1).padStart(2, '0')}</span>
            <div>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.title} <ArrowUpRight aria-hidden="true" />
              </a>
              <p>{source.publisher} · Accessed {formatDate(source.accessedAt)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function BlogArticle() {
  const { slug } = useParams();
  const post = findBlogPost(slug);

  if (!post) {
    return (
      <main className="dp-article-missing">
        <p>That journal entry is not published.</p>
        <Link to="/blog"><ArrowLeft aria-hidden="true" /> Return to The Bangalore Edit</Link>
      </main>
    );
  }

  const sourceIndex = new Map(post.sources.map((source, index) => [source.id, index + 1]));
  const relatedProjects = post.relatedProjects.map(findProject).filter(Boolean);

  return (
    <main className="dp-article">
      <article>
        <header className="dp-article-hero">
          <div className="dp-article-hero__copy">
            <Link to="/blog" className="dp-article-back"><ArrowLeft aria-hidden="true" /> The Bangalore Edit</Link>
            <p className="dp-article-kicker">{post.category}</p>
            <h1>{post.title}</h1>
            <p className="dp-article-dek">{post.dek}</p>
            <div className="dp-article-byline">
              <span>{post.author.name}<small>{post.author.role}</small></span>
              <span>{formatDate(post.publishedAt)}</span>
              <span><Clock3 aria-hidden="true" /> {blogPostReadingMinutes(post)} min read</span>
              <span><MapPin aria-hidden="true" /> {post.location}</span>
            </div>
          </div>
          <figure className="dp-article-hero__image">
            <img
              src={post.hero.src}
              alt={post.hero.alt}
              width={post.hero.width}
              height={post.hero.height}
              fetchPriority="high"
            />
            <figcaption>{post.hero.caption}<span>{post.hero.credit}</span></figcaption>
          </figure>
        </header>

        <div className="dp-article-layout">
          <aside className="dp-article-contents" aria-label="In this essay">
            <p>In this essay</p>
            <ol>
              {post.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>{section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="dp-article-body">
            {post.sections.map((section, index) => (
              <div key={section.id}>
                <section id={section.id} className="dp-article-section">
                  {section.eyebrow && <p className="dp-article-kicker">{section.eyebrow}</p>}
                  <h2>{section.heading}</h2>
                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={`${section.id}-${paragraphIndex}`}>
                      {paragraph.text}
                      {paragraph.citations?.map((citation) => (
                        <a
                          className="dp-article-citation"
                          href={`#source-${citation}`}
                          aria-label={`Source ${sourceIndex.get(citation)}`}
                          key={citation}
                        >
                          [{sourceIndex.get(citation)}]
                        </a>
                      ))}
                    </p>
                  ))}
                  {section.checklist && (
                    <div className="dp-article-checklist">
                      <p>Design checklist</p>
                      <ul>{section.checklist.map((item) => <li key={item}>{item}</li>)}</ul>
                    </div>
                  )}
                  {section.pullQuote && <blockquote>{section.pullQuote}</blockquote>}
                  {section.image && (
                    <figure className="dp-article-figure">
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        width={section.image.width}
                        height={section.image.height}
                        loading="lazy"
                      />
                      <figcaption>{section.image.caption}<span>{section.image.credit}</span></figcaption>
                    </figure>
                  )}
                </section>
                {index === 2 && <ConsultationCallout />}
              </div>
            ))}

            <ArticleSources post={post} />
          </div>
        </div>
      </article>

      {relatedProjects.length > 0 && (
        <section className="dp-article-related" aria-labelledby="related-projects-title">
          <p className="dp-article-kicker">See the thinking in practice</p>
          <h2 id="related-projects-title">Related residences</h2>
          <div>
            {relatedProjects.map((project) => project && (
              <Link to={`/project/${project.id}`} key={project.id}>
                <img
                  src={project.images[project.teaser[0]].preview}
                  alt={project.images[project.teaser[0]].alt}
                  width={project.images[project.teaser[0]].width}
                  height={project.images[project.teaser[0]].height}
                  loading="lazy"
                />
                <span>{project.community}</span>
                <h3>{project.title}</h3>
                <ArrowUpRight aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <ConsultationCallout />

      <section className="dp-article-lead dp-showcase-site" aria-label="Project enquiry">
        <div className="dp-showcase-section">
          <LeadForm answers={BLOG_LEAD_ANSWERS} />
        </div>
      </section>
    </main>
  );
}
