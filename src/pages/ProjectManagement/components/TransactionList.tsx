import { motion } from 'framer-motion';
import { Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div>
      <h3 className="text-xl font-serif mb-4">Recent Transactions</h3>
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-accent text-center py-8">No transactions yet</p>
        ) : (
          transactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-secondary/5 p-4 rounded-lg border border-secondary/20 flex items-center justify-between"
            >
              <div className="flex items-center">
                {transaction.type === 'income' ? (
                  <div className="w-10 h-10 rounded-full bg-green-400/10 flex items-center justify-center mr-4">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center mr-4">
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-white">{transaction.description}</p>
                  <p className="text-sm text-accent">{transaction.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-accent">{formatDate(transaction.date)}</p>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}