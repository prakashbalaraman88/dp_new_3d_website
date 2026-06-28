import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Project } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Project name is required'),
  client: z.string().min(1, 'Client name is required'),
  budget: z.number().min(0, 'Budget must be positive'),
  startDate: z.string(),
  description: z.string().optional(),
  status: z.enum(['active', 'completed', 'on-hold'])
});

type FormData = z.infer<typeof schema>;

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: Omit<Project, 'id' | 'transactions'>) => void;
}

export default function NewProjectModal({ isOpen, onClose, onCreateProject }: NewProjectModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'active'
    }
  });

  const onSubmit = (data: FormData) => {
    onCreateProject(data);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-lg bg-main rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-serif">New Project</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-secondary/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Project Name
                  </label>
                  <input
                    {...register('name')}
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Client Name
                  </label>
                  <input
                    {...register('client')}
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  {errors.client && (
                    <p className="mt-1 text-sm text-red-400">{errors.client.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Budget
                  </label>
                  <input
                    {...register('budget', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-400">{errors.budget.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Start Date
                  </label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-secondary text-main rounded-lg hover:bg-secondary-600 transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}