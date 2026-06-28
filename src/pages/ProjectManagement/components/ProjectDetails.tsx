import { useState } from 'react';
import { motion } from 'framer-motion';
import { Project, ProjectSummary } from '../types';
import TransactionList from './TransactionList';
import NewTransactionModal from './NewTransactionModal';
import ChatInterface from './ChatInterface';
import { Plus, TrendingUp, TrendingDown, Wallet, MessageSquarePlus } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface ProjectDetailsProps {
  project: Project;
}

export default function ProjectDetails({ project }: ProjectDetailsProps) {
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const summary: ProjectSummary = project.transactions.reduce(
    (acc, transaction) => {
      const amount = transaction.amount;
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpenses += amount;
      }
      acc.categories[transaction.category] = (acc.categories[transaction.category] || 0) + amount;
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0, balance: 0, categories: {} } as ProjectSummary
  );

  summary.balance = summary.totalIncome - summary.totalExpenses;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-secondary/10 backdrop-blur-sm rounded-xl p-6 border border-secondary/20"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-serif">{project.name}</h2>
            <p className="text-accent">{project.client}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center px-4 py-2 bg-secondary/20 text-white rounded-lg hover:bg-secondary/30 transition-colors"
            >
              <MessageSquarePlus className="w-5 h-5 mr-2" />
              Quick Add
            </button>
            <button
              onClick={() => setIsNewTransactionModalOpen(true)}
              className="flex items-center px-4 py-2 bg-secondary text-main rounded-lg hover:bg-secondary-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Transaction
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-accent">Total Income</span>
            </div>
            <span className="text-xl font-medium text-white">
              {formatCurrency(summary.totalIncome)}
            </span>
          </div>
          
          <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
            <div className="flex items-center mb-2">
              <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-accent">Total Expenses</span>
            </div>
            <span className="text-xl font-medium text-white">
              {formatCurrency(summary.totalExpenses)}
            </span>
          </div>
          
          <div className="bg-secondary/5 p-4 rounded-lg border border-secondary/20">
            <div className="flex items-center mb-2">
              <Wallet className="w-5 h-5 text-secondary mr-2" />
              <span className="text-accent">Balance</span>
            </div>
            <span className="text-xl font-medium text-white">
              {formatCurrency(summary.balance)}
            </span>
          </div>
        </div>

        <TransactionList transactions={project.transactions} />
      </motion.div>

      <NewTransactionModal
        isOpen={isNewTransactionModalOpen}
        onClose={() => setIsNewTransactionModalOpen(false)}
        projectId={project.id}
      />

      {isChatOpen && (
        <ChatInterface
          projectId={project.id}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}