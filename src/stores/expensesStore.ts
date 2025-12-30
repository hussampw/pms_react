import { create } from 'zustand';
import db from '../config/database';

interface ExpenseCategory {
  id?: number;
  category_name: string;
  description?: string | null;
  created_at?: string;
  [key: string]: any;
}

interface Expense {
  id?: number;
  expense_category_id: number;
  user_id: number;
  unit_id: number;
  expense_name: string;
  expense_amount: number;
  expense_date: string;
  notes?: string | null;
  category_name?: string;
  unit_name?: string;
  [key: string]: any;
}

interface ExpenseStat {
  category_name: string;
  total: number;
}

interface ExpensesStore {
  expenses: Expense[];
  categories: ExpenseCategory[];
  loading: boolean;
  fetchCategories: () => void;
  addCategory: (categoryName: string, description?: string | null) => Promise<number>;
  fetchExpenses: (userId: string | number) => void;
  addExpense: (expense: any, userId: string | number) => Promise<number>;
  getExpenseStats: (userId: string | number, startDate: string, endDate: string) => Promise<ExpenseStat[]>;
}

export const useExpensesStore = create<ExpensesStore>((set, get) => ({
  expenses: [],
  categories: [],
  loading: false,

  fetchCategories: () => {
    try {
      const categories = db.getAllSync(
        'SELECT * FROM expense_categories ORDER BY category_name',
        []
      ) as ExpenseCategory[];
      set({ categories });
    } catch (error) {
      console.error(error);
    }
  },

  addCategory: (categoryName: string, description?: string | null) => {
    return new Promise<number>((resolve, reject) => {
      try {
        const result = db.runSync(
          'INSERT INTO expense_categories (category_name, description) VALUES (?, ?)',
          [categoryName, description || null]
        );
        get().fetchCategories();
        resolve(result.lastInsertRowId);
      } catch (error) {
        reject(error);
      }
    });
  },

  fetchExpenses: (userId: string | number) => {
    set({ loading: true });
    try {
      const expenses = db.getAllSync(
        `SELECT e.*, ec.category_name, u.unit_name 
         FROM expenses e
         JOIN expense_categories ec ON e.expense_category_id = ec.id
         JOIN units u ON e.unit_id = u.id
         WHERE e.user_id = ?
         ORDER BY e.expense_date DESC`,
        [userId]
      ) as Expense[];
      set({ expenses, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addExpense: (expense: any, userId: string | number) => {
    return new Promise<number>((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO expenses (expense_category_id, user_id, unit_id, 
           expense_name, expense_amount, expense_date, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            expense.expense_category_id,
            userId,
            expense.unit_id,
            expense.expense_name,
            expense.expense_amount,
            expense.expense_date,
            expense.notes || null
          ]
        );
        get().fetchExpenses(userId);
        resolve(result.lastInsertRowId);
      } catch (error) {
        reject(error);
      }
    });
  },

  getExpenseStats: (userId: string | number, startDate: string, endDate: string) => {
    return new Promise<ExpenseStat[]>((resolve) => {
      try {
        const stats = db.getAllSync(
          `SELECT 
            ec.category_name,
            SUM(e.expense_amount) as total
           FROM expenses e
           JOIN expense_categories ec ON e.expense_category_id = ec.id
           WHERE e.user_id = ? AND e.expense_date BETWEEN ? AND ?
           GROUP BY ec.category_name`,
          [userId, startDate, endDate]
        ) as ExpenseStat[];
        resolve(stats);
      } catch (error) {
        resolve([]);
      }
    });
  }
}));
