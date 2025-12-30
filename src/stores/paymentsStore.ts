import { create } from 'zustand';
import db from '../config/database';

interface Payment {
  id?: number;
  unit_id: number;
  payment_amount: number;
  payment_date: string;
  payment_type?: string | null;
  payment_method?: string | null;
  payment_direction: string;
  tenant_id?: number | null;
  obligation_id?: number | null;
  payer_name?: string | null;
  payee_name?: string | null;
  notes?: string | null;
  unit_name?: string;
  tenant_name?: string;
  [key: string]: any;
}

interface PaymentStats {
  total_income: number;
  total_expenses: number;
}

interface PaymentsStore {
  payments: Payment[];
  loading: boolean;
  fetchPayments: (userId: string | number) => void;
  addPayment: (payment: any, userId: string | number) => Promise<number>;
  getPaymentStats: (userId: string | number) => Promise<PaymentStats>;
}

export const usePaymentsStore = create<PaymentsStore>((set, get) => ({
  payments: [],
  loading: false,

  fetchPayments: (userId: string | number) => {
    set({ loading: true });
    try {
      const payments = db.getAllSync(
        `SELECT p.*, u.unit_name, t.full_name as tenant_name 
         FROM payments p
         LEFT JOIN units u ON p.unit_id = u.id
         LEFT JOIN tenants t ON p.tenant_id = t.id
         WHERE u.user_id = ?
         ORDER BY p.payment_date DESC`,
        [userId]
      ) as Payment[];
      set({ payments, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addPayment: (payment: any, userId: string | number) => {
    return new Promise<number>((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO payments (unit_id, payment_amount, payment_date, 
           payment_type, payment_method, payment_direction, tenant_id, 
           obligation_id, payer_name, payee_name, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            payment.unit_id,
            payment.payment_amount,
            payment.payment_date,
            payment.payment_type || null,
            payment.payment_method || null,
            payment.payment_direction,
            payment.tenant_id || null,
            payment.obligation_id || null,
            payment.payer_name || null,
            payment.payee_name || null,
            payment.notes || null
          ]
        );
        get().fetchPayments(userId);
        resolve(result.lastInsertRowId);
      } catch (error) {
        reject(error);
      }
    });
  },

  getPaymentStats: (userId: string | number) => {
    return new Promise<PaymentStats>((resolve) => {
      try {
        const result = db.getFirstSync(
          `SELECT 
            SUM(CASE WHEN payment_direction = 'incoming' THEN payment_amount ELSE 0 END) as total_income,
            SUM(CASE WHEN payment_direction = 'outgoing' THEN payment_amount ELSE 0 END) as total_expenses
           FROM payments p
           JOIN units u ON p.unit_id = u.id
           WHERE u.user_id = ?`,
          [userId]
        ) as PaymentStats | null;
        resolve(result || { total_income: 0, total_expenses: 0 });
      } catch (error) {
        resolve({ total_income: 0, total_expenses: 0 });
      }
    });
  }
}));
