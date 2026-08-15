import { useEffect, useRef, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projects, type ProjectFilm } from './data';
import './projects.css';

const MASTER_EASE: [number, number, number, number] = [0.625, 0.05, 0, 1];

type ProjectStyle = CSSProperties & { '--project-accent': string };

function ProjectFilmPreview({ film, reducedMotion }: { film: ProjectFilm; reducedMotion: boolean | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return undefined;

    let isInView = false;
    const syncPlayback = () => {
      if (isInView && !document.hidden) video.play().catch(() => undefined);
      else video.pause();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInView = entry.isIntersecting;
        syncPlayback();
      },
      { threshold: 0.42 },
    );

    observer.observe(video);
    document.addEventListener('visibilitychange', syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', syncPlayback);
      video.pause();
    };
  }, [film.src, reducedMotion]);

  if (reducedMotion) {
    return <img src={film.poster} alt="" loading="lazy" decoding="async" />;
  }

  return (
    <video
      ref={videoRef}
      src={film.src}
      poster={film.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}

export default function Projects() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="projects" className="dp-portfolio" aria-labelledby="selected-projects-title">
      <div className="dp-portfolio__intro">
        <div>
          <p className="dp-portfolio__eyebrow">Selected residences · Real project photography</p>
          <h2 id="selected-projects-title">Every home has a <em>point of view.</em></h2>
        </div>
        <p>
          Five distinct homes, seen through material, light and the rituals of everyday life.
          Open a project to explore every room in its original composition.
        </p>
      </div>

      <div className="dp-portfolio__chapters">
        {projects.map((project, projectIndex) => {
          const [heroIndex, ...detailIndexes] = project.teaser;
          const heroImage = project.images[heroIndex];
          const detailImages = detailIndexes.map((imageIndex) => project.images[imageIndex]);
          const projectNumber = String(projectIndex + 1).padStart(2, '0');

          return (
            <motion.article
              key={project.id}
              className={`dp-project-chapter ${projectIndex % 2 ? 'is-reversed' : ''}`}
              style={{ '--project-accent': project.accent } as ProjectStyle}
              initial={reducedMotion ? false : { opacity: 0, y: 46 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: reducedMotion ? 0 : 0.95, ease: MASTER_EASE }}
            >
              <div className="dp-project-chapter__copy">
                <div className="dp-project-chapter__index" aria-hidden="true">{projectNumber}</div>
                <p className="dp-project-chapter__category">{project.category}</p>
                <h3>{project.title}</h3>
                {project.community !== project.title && (
                  <p className="dp-project-chapter__community">{project.community}</p>
                )}
                <p className="dp-project-chapter__summary">{project.summary}</p>

                <ul aria-label={`${project.title} design highlights`}>
                  {project.designNotes.map((note) => <li key={note}>{note}</li>)}
                </ul>

                <Link to={`/project/${project.id}`} className="dp-project-chapter__link">
                  Explore the residence
                  <span aria-hidden="true"><ArrowUpRight size={17} /></span>
                </Link>
              </div>

              <Link
                to={`/project/${project.id}`}
                className="dp-project-collage"
                aria-label={project.film
                  ? `Watch the ${project.title} project film and open its gallery`
                  : `View ${project.title} project gallery`}
              >
                <div className="dp-project-collage__lead">
                  <figure
                    className={project.film ? 'dp-project-collage__film' : undefined}
                    style={{
                      aspectRatio: project.film
                        ? `${project.film.width} / ${project.film.height}`
                        : `${heroImage.width} / ${heroImage.height}`,
                    }}
                  >
                    {project.film ? (
                      <>
                        <ProjectFilmPreview film={project.film} reducedMotion={reducedMotion} />
                        <span className="dp-project-collage__film-label" aria-hidden="true">
                          <Play size={13} fill="currentColor" /> Project film
                        </span>
                      </>
                    ) : (
                      <img
                        src={heroImage.preview}
                        alt={heroImage.alt}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </figure>
                  <div className="dp-project-collage__meta">
                    <span>{projectNumber} / {String(projects.length).padStart(2, '0')}</span>
                    <span>{String(project.images.length).padStart(2, '0')} photographs</span>
                    <span className="dp-project-collage__arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
                  </div>
                </div>

                <div className="dp-project-collage__details">
                  {detailImages.map((image) => (
                    <figure key={image.src} style={{ aspectRatio: `${image.width} / ${image.height}` }}>
                      <img src={image.preview} alt={image.alt} loading="lazy" decoding="async" />
                    </figure>
                  ))}
                </div>
              </Link>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
