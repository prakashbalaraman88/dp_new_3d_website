export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  receipt?: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'on-hold';
  description: string;
  transactions: Transaction[];
}

export interface ProjectSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categories: {
    [key: string]: number;
  };
}