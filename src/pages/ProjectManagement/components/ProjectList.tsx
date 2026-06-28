import { motion } from 'framer-motion';
import { Project } from '../types';
import { Circle, CheckCircle2, PauseCircle } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
}

export default function ProjectList({ projects, selectedProjectId, onSelectProject }: ProjectListProps) {
  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Circle className="w-4 h-4 text-green-400" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-secondary" />;
      case 'on-hold':
        return <PauseCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="bg-secondary/10 backdrop-blur-sm rounded-xl p-4 border border-secondary/20">
      <h2 className="text-xl font-serif mb-4">Projects</h2>
      <div className="space-y-2">
        {projects.map((project) => (
          <motion.button
            key={project.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectProject(project.id)}
            className={`w-full text-left p-4 rounded-lg transition-colors ${
              selectedProjectId === project.id
                ? 'bg-secondary/20 border-secondary'
                : 'bg-secondary/5 hover:bg-secondary/10'
            } border border-secondary/20`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-white">{project.name}</h3>
              {getStatusIcon(project.status)}
            </div>
            <p className="text-sm text-accent mt-1">{project.client}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}