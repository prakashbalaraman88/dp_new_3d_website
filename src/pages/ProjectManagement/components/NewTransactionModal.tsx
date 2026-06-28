import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Transaction } from '../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProjects } from '../hooks/useProjects';

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().min(0, 'Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string(),
});

type FormData = z.infer<typeof schema>;

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export default function NewTransactionModal({ isOpen, onClose, projectId }: NewTransactionModalProps) {
  const { addTransaction } = useProjects();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = (data: FormData) => {
    addTransaction(projectId, data);
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
                <h2 className="text-2xl font-serif">New Transaction</h2>
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
                    Type
                  </label>
                  <select
                    {...register('type')}
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Amount
                  </label>
                  <input
                    {...register('amount', { valueAsNumber: true })}
                    type="number"
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Description
                  </label>
                  <input
                    {...register('description')}
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Category
                  </label>
                  <input
                    {...register('category')}
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-accent mb-1">
                    Date
                  </label>
                  <input
                    {...register('date')}
                    type="date"
                    className="w-full px-3 py-2 bg-secondary/10 border border-secondary/20 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-secondary text-main rounded-lg hover:bg-secondary-600 transition-colors"
                  >
                    Add Transaction
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