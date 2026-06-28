import { useState, useEffect } from 'react';
import { Project, Transaction } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('projects');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (project: Omit<Project, 'id' | 'transactions'>) => {
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      transactions: []
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, ...updates } : p)
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const addTransaction = (projectId: string, transaction: Omit<Transaction, 'id'>) => {
    setProjects(prev => 
      prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            transactions: [...p.transactions, { ...transaction, id: crypto.randomUUID() }]
          };
        }
        return p;
      })
    );
  };

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    addTransaction
  };
}