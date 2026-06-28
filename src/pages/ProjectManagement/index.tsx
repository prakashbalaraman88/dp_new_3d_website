import { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectList from './components/ProjectList';
import ChatInterface from './components/ChatInterface';
import ProjectDetails from './components/ProjectDetails';
import { Plus } from 'lucide-react';
import NewProjectModal from './components/NewProjectModal';
import { useProjects } from './hooks/useProjects';

export default function ProjectManagement() {
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const { projects, addProject } = useProjects();

  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId)
    : null;

  return (
    <div className="pt-20 bg-main min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <h1 className="text-3xl font-serif">Project Management</h1>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center px-4 py-2 bg-secondary text-main rounded-lg hover:bg-secondary-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Project
            </button>
          </motion.div>

          <div className="grid md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              <ProjectList 
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
              />
            </div>
            <div className="md:col-span-8">
              {selectedProject ? (
                <ProjectDetails project={selectedProject} />
              ) : (
                <ChatInterface />
              )}
            </div>
          </div>
        </div>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreateProject={addProject}
      />
    </div>
  );
}