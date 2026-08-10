import { ArrowUpRight, BookOpen, Clock3, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  allBlogPosts,
  blogPostPath,
  blogPostReadingMinutes,
  featuredBlogPost,
} from '../../content/blog';
import './blog.css';

const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date(`${value}T12:00:00+05:30`));

export default function BlogIndex() {
  if (!featuredBlogPost) {
    return (
      <main className="dp-journal dp-journal--empty">
        <p>The Bangalore Edit is being prepared.</p>
      </main>
    );
  }

  return (
    <main className="dp-journal">
      <header className="dp-journal-hero">
        <div className="dp-journal-hero__copy">
          <p className="dp-journal-kicker">The Bangalore Edit · DezignPool Journal</p>
          <h1>Rooms, materials and the <em>city between them.</em></h1>
          <p className="dp-journal-hero__dek">
            Field notes for living well in Bangalore—grounded in climate, construction,
            neighbourhood context and what survives beyond the handover photograph.
          </p>
          <div className="dp-journal-hero__principles" aria-label="Editorial principles">
            <span><BookOpen aria-hidden="true" /> Primary-source research</span>
            <span><MapPin aria-hidden="true" /> Bangalore specific</span>
          </div>
        </div>

        <Link className="dp-journal-feature" to={blogPostPath(featuredBlogPost)}>
          <img
            src={featuredBlogPost.hero.src}
            alt={featuredBlogPost.hero.alt}
            width={featuredBlogPost.hero.width}
            height={featuredBlogPost.hero.height}
            fetchPriority="high"
          />
          <span className="dp-journal-feature__wash" aria-hidden="true" />
          <div className="dp-journal-feature__meta">
            <span>{featuredBlogPost.category}</span>
            <span>{formatDate(featuredBlogPost.publishedAt)}</span>
          </div>
          <div className="dp-journal-feature__title">
            <p>Featured essay</p>
            <h2>{featuredBlogPost.title}</h2>
            <span className="dp-journal-feature__arrow"><ArrowUpRight aria-hidden="true" /></span>
          </div>
        </Link>
      </header>

      <section className="dp-journal-intro" aria-labelledby="journal-stories-title">
        <div>
          <p className="dp-journal-kicker">Issue 01 / Climate &amp; comfort</p>
          <h2 id="journal-stories-title">Useful enough to save.<br /><em>Beautiful enough to return to.</em></h2>
        </div>
        <p>
          Every essay is commissioned around a real Bangalore homeowner question.
          Climate and code claims are linked to their sources; project photography comes
          from our archive; generic search filler does not make the edit.
        </p>
      </section>

      <section className="dp-journal-grid" aria-label="Published journal articles">
        {allBlogPosts.map((post, index) => (
          <article className="dp-journal-card" key={post.slug}>
            <Link to={blogPostPath(post)} className="dp-journal-card__image">
              <img
                src={post.hero.src}
                alt={post.hero.alt}
                width={post.hero.width}
                height={post.hero.height}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </Link>
            <div className="dp-journal-card__body">
              <p>{post.category}</p>
              <h3><Link to={blogPostPath(post)}>{post.title}</Link></h3>
              <p className="dp-journal-card__dek">{post.dek}</p>
              <div>
                <span>{formatDate(post.publishedAt)}</span>
                <span><Clock3 aria-hidden="true" /> {blogPostReadingMinutes(post)} min read</span>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="dp-journal-promise">
        <p>Our editorial promise</p>
        <h2>One sharp Bangalore question.<br />One researched answer.</h2>
        <div>
          <span>01</span><p>Primary sources before search summaries.</p>
          <span>02</span><p>Real project context before generic advice.</p>
          <span>03</span><p>Editorial review before publication.</p>
        </div>
      </aside>
    </main>
  );
}
