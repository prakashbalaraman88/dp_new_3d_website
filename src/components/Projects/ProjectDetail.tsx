import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Ruler, CreditCard } from 'lucide-react';
import { projects } from './projectsData';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(projects[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundProject = projects.find(p => p.id === id);
    if (foundProject) {
      setProject(foundProject);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-4">Project not found</h2>
          <button
            onClick={() => navigate('/')}
            className="text-secondary hover:text-secondary-600 transition-colors"
          >
            Return to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/')}
          className="flex items-center text-sage-light hover:text-secondary transition-colors mb-12 group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-2 transition-transform" />
          Back to Projects
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-5xl font-serif mb-6">{project.title}</h1>
          <div className="flex flex-wrap gap-4 text-sage-light">
            <span>{project.category}</span>
            <span>•</span>
            <span>{project.location}</span>
            <span>•</span>
            <span>{project.year}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative h-[70vh] mb-16 rounded-3xl overflow-hidden"
        >
          <img
            src={project.mainImage}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-8 mb-16"
        >
          <div className="bg-sage-dark/10 rounded-2xl p-6">
            <Ruler className="h-8 w-8 text-secondary mb-4" />
            <h3 className="text-lg font-medium mb-2">Area</h3>
            <p className="text-sage-light">{project.stats.area}</p>
          </div>
          <div className="bg-sage-dark/10 rounded-2xl p-6">
            <Clock className="h-8 w-8 text-secondary mb-4" />
            <h3 className="text-lg font-medium mb-2">Duration</h3>
            <p className="text-sage-light">{project.stats.duration}</p>
          </div>
          <div className="bg-sage-dark/10 rounded-2xl p-6">
            <CreditCard className="h-8 w-8 text-secondary mb-4" />
            <h3 className="text-lg font-medium mb-2">Investment</h3>
            <p className="text-sage-light">{project.stats.cost}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid lg:grid-cols-3 gap-16 mb-16"
        >
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-serif mb-6">About the Project</h2>
            <p className="text-sage-light text-lg leading-relaxed mb-8">
              {project.description}
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {project.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sage-light">
                  <span className="w-2 h-2 rounded-full bg-secondary mr-3" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-sage-dark/10 rounded-2xl p-8">
            <div className="text-center mb-6">
              <img
                src={project.designer.image}
                alt={project.designer.name}
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-medium">{project.designer.name}</h3>
              <p className="text-secondary">{project.designer.role}</p>
            </div>
            <p className="text-sage-light text-center">{project.designer.bio}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-serif mb-8">Project Gallery</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {project.images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                className="relative h-[400px] rounded-2xl overflow-hidden"
              >
                <img
                  src={image}
                  alt={`${project.title} - Image ${index + 1}`}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}