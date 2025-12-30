import { create } from 'zustand';
import db from '../config/database';

interface Tenant {
  id?: number;
  unit_id: number;
  full_name: string;
  id_type: number;
  national_id?: string | null;
  phone?: string | null;
  start_date: string;
  end_date?: string | null;
  rent_amount: number;
  deposit_amount?: number | null;
  status: string;
  unit_name?: string;
  [key: string]: any;
}

interface TenantsStore {
  tenants: Tenant[];
  loading: boolean;
  fetchTenants: (userId: string | number) => void;
  addTenant: (tenant: any, userId: string | number) => Promise<number>;
}

export const useTenantsStore = create<TenantsStore>((set, get) => ({
  tenants: [],
  loading: false,

  fetchTenants: (userId: string | number) => {
    set({ loading: true });
    try {
      const tenants = db.getAllSync(
        `SELECT t.*, u.unit_name 
         FROM tenants t
         JOIN units u ON t.unit_id = u.id
         WHERE u.user_id = ?
         ORDER BY t.created_at DESC`,
        [userId]
      ) as Tenant[];
      set({ tenants, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addTenant: (tenant: any, userId: string | number) => {
    return new Promise<number>((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO tenants (unit_id, full_name, id_type, national_id, 
           phone, start_date, end_date, rent_amount, deposit_amount, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tenant.unit_id,
            tenant.full_name,
            tenant.id_type || 0,
            tenant.national_id || null,
            tenant.phone || null,
            tenant.start_date,
            tenant.end_date || null,
            tenant.rent_amount,
            tenant.deposit_amount || null,
            tenant.status || 'active'
          ]
        );
        
        db.runSync(
          'UPDATE units SET status = ? WHERE id = ?',
          ['rented', tenant.unit_id]
        );
        
        get().fetchTenants(userId);
        resolve(result.lastInsertRowId);
      } catch (error) {
        reject(error);
      }
    });
  }
}));
