import { create } from 'zustand';
import db from '../config/database';

interface Unit {
  id?: number;
  parent_id?: number | null;
  user_id: number;
  unit_name: string;
  unit_type: string;
  description?: string | null;
  address?: string | null;
  is_rentable: number;
  rent_amount?: number | null;
  status: string;
  [key: string]: any;
}

interface UnitsStore {
  units: Unit[];
  loading: boolean;
  fetchUnits: (userId: string | number) => void;
  addUnit: (unit: any, userId: string | number) => Promise<number>;
  updateUnit: (id: number, unit: any, userId: string | number) => Promise<void>;
  deleteUnit: (id: number, userId: string | number) => Promise<void>;
  getUnitsByParent: (parentId: number, userId: string | number) => Promise<Unit[]>;
}

export const useUnitsStore = create<UnitsStore>((set, get) => ({
  units: [],
  loading: false,

  fetchUnits: (userId: string | number) => {
    set({ loading: true });
    try {
      const units = db.getAllSync(
        'SELECT * FROM units WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      ) as Unit[];
      set({ units, loading: false });
    } catch (error) {
      console.error(error);
      set({ loading: false });
    }
  },

  addUnit: (unit: any, userId: string | number) => {
    return new Promise<number>((resolve, reject) => {
      try {
        const result = db.runSync(
          `INSERT INTO units (parent_id, user_id, unit_name, unit_type, description, 
           address, is_rentable, rent_amount, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            unit.parent_id || null,
            userId,
            unit.unit_name,
            unit.unit_type,
            unit.description || null,
            unit.address || null,
            unit.is_rentable ? 1 : 0,
            unit.rent_amount || null,
            unit.status || 'vacant'
          ]
        );
        get().fetchUnits(userId);
        resolve(result.lastInsertRowId);
      } catch (error) {
        reject(error);
      }
    });
  },

  updateUnit: (id: number, unit: any, userId: string | number) => {
    return new Promise<void>((resolve, reject) => {
      try {
        db.runSync(
          `UPDATE units SET unit_name = ?, unit_type = ?, description = ?, 
           address = ?, is_rentable = ?, rent_amount = ?, status = ?, 
           updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
          [
            unit.unit_name,
            unit.unit_type,
            unit.description,
            unit.address,
            unit.is_rentable ? 1 : 0,
            unit.rent_amount,
            unit.status,
            id
          ]
        );
        get().fetchUnits(userId);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteUnit: (id: number, userId: string | number) => {
    return new Promise<void>((resolve, reject) => {
      try {
        db.runSync('DELETE FROM units WHERE id = ?', [id]);
        get().fetchUnits(userId);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  getUnitsByParent: (parentId: number, userId: string | number) => {
    return new Promise<Unit[]>((resolve) => {
      try {
        const units = db.getAllSync(
          'SELECT * FROM units WHERE parent_id = ? AND user_id = ?',
          [parentId, userId]
        ) as Unit[];
        resolve(units);
      } catch (error) {
        resolve([]);
      }
    });
  }
}));