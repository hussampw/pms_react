import { create } from 'zustand';
import db from '../config/database';

interface Obligation {
  id?: number;
  unit_id: number;
  user_id: number;
  obligation_type: string;
  payee_name: string;
  payee_phone?: string | null;
  amount: number;
  frequency: string;
  start_date: string;
  end_date?: string | null;
  next_due_date: string;
  auto_reminder: number;
  status?: string;
  notes?: string | null;
  unit_name?: string;
  [key: string]: any;
}

interface ObligationsStore {
  obligations: Obligation[];
  loading: boolean;
  fetchObligations: (userId: string | number) => void;
  addObligation: (obligation: any, userId: string | number) => Promise<number>;
  updateNextDueDate: (id: number, nextDate: string, userId: string | number) => Promise<void>;
}

export const useObligationsStore = create<ObligationsStore>((set, get) => ({
  obligations: [],
  loading: false,

  fetchObligations: (userId: string | number) => {
    set({ loading: true });
    try {
      const obligations = db.getAllSync(
        `SELECT o.*, u.unit_name 
         FROM unit_obligations o
         JOIN units u ON o.unit_id = u.id
         WHERE o.user_id = ?
         ORDER BY o.next_due_date ASC`,
        [userId]
      ) as Obligation[];
      set({ obligations, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addObligation: (obligation: any, userId: string | number) => {
    return new Promise<number>((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO unit_obligations (unit_id, user_id, obligation_type, 
           payee_name, payee_phone, amount, frequency, start_date, end_date, 
           next_due_date, auto_reminder, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            obligation.unit_id,
            userId,
            obligation.obligation_type,
            obligation.payee_name,
            obligation.payee_phone || null,
            obligation.amount,
            obligation.frequency,
            obligation.start_date,
            obligation.end_date || null,
            obligation.next_due_date,
            obligation.auto_reminder ? 1 : 0,
            obligation.notes || null
          ]
        );
        get().fetchObligations(userId);
        resolve(result.lastInsertRowId);
      } catch (error) {
        reject(error);
      }
    });
  },

  updateNextDueDate: (id: number, nextDate: string, userId: string | number) => {
    return new Promise<void>((resolve, reject) => {
      try {
        db.runSync(
          'UPDATE unit_obligations SET next_due_date = ? WHERE id = ?',
          [nextDate, id]
        );
        get().fetchObligations(userId);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}));