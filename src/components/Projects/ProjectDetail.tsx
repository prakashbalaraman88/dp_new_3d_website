import type { CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { findProject, getNextProject } from './data';
import ProjectGallery from './ProjectGallery';
import './projects.css';

type ProjectStyle = CSSProperties & { '--project-accent': string };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const project = findProject(id);

  if (!project) {
    return (
      <main className="dp-project-page dp-project-page--missing">
        <p>Project not found</p>
        <h1>This room seems to have moved.</h1>
        <Link to="/projects">Return to selected projects</Link>
      </main>
    );
  }

  const heroImage = project.images[project.teaser[0]];
  const nextProject = getNextProject(project.id);
  const nextImage = nextProject.images[nextProject.teaser[0]];
  const eyebrow = project.community === project.title ? project.category : project.community;

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/projects');
  };

  return (
    <main
      className="dp-project-page"
      style={{ '--project-accent': project.accent } as ProjectStyle}
    >
      <header className="dp-project-hero">
        <button type="button" className="dp-project-hero__back" onClick={handleBack}>
          <ArrowLeft size={17} /> Back to projects
        </button>

        <motion.div
          className="dp-project-hero__heading"
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8 }}
        >
          <div>
            <p>{eyebrow}</p>
            <h1>{project.title}</h1>
          </div>
          <div className="dp-project-hero__summary">
            <span>Residential interiors</span>
            <span>{String(project.images.length).padStart(2, '0')} photographs</span>
            <a href="#project-gallery">View the complete story <ArrowDown size={16} /></a>
          </div>
        </motion.div>

        <motion.div
          className="dp-project-hero__media"
          style={{ aspectRatio: `${heroImage.width} / ${heroImage.height}` }}
          initial={reducedMotion ? false : { opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1, delay: reducedMotion ? 0 : 0.12 }}
        >
          <img
            src={heroImage.src}
            alt={heroImage.alt}
            width={heroImage.width}
            height={heroImage.height}
            decoding="async"
          />
          <span aria-hidden="true">DezignPool · Selected residence</span>
        </motion.div>
      </header>

      <section className="dp-project-brief" aria-labelledby="project-brief-title">
        <div className="dp-project-brief__label">
          <span>Project brief</span>
          <span>01 — 03</span>
        </div>
        <div>
          <h2 id="project-brief-title">Designed as a feeling,<br />resolved in every detail.</h2>
          <p>{project.story}</p>
          <ul aria-label="Design language">
            {project.designNotes.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </div>
      </section>

      <section id="project-gallery" className="dp-project-gallery-section" aria-labelledby="project-gallery-title">
        <div className="dp-project-gallery-section__heading">
          <div>
            <p>Room by room</p>
            <h2 id="project-gallery-title">The complete <em>residence.</em></h2>
          </div>
          <p>
            Every image is shown in its natural proportion. Select any photograph to view it full screen.
          </p>
        </div>
        <ProjectGallery images={project.images} title={project.title} />
      </section>

      <section className="dp-next-project" aria-label="Next project">
        <p>Continue the portfolio</p>
        <Link to={`/project/${nextProject.id}`}>
          <div>
            <span>Next residence</span>
            <h2>{nextProject.title}</h2>
            <span className="dp-next-project__arrow" aria-hidden="true"><ArrowUpRight /></span>
          </div>
          <figure style={{ aspectRatio: `${nextImage.width} / ${nextImage.height}` }}>
            <img src={nextImage.preview} alt="" loading="lazy" />
          </figure>
        </Link>
      </section>
    </main>
  );
}
