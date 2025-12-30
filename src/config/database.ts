import { Platform } from 'react-native';

let db: any = null;

// SQLite is not fully supported on web, so we conditionally import it
if (Platform.OS !== 'web') {
  try {
    // Use dynamic import to avoid bundling SQLite for web
    const SQLite = require('expo-sqlite');
    db = SQLite.openDatabaseSync('property_management.db');
  } catch (error) {
    console.warn('SQLite not available:', error);
    // Fallback mock for native platforms if SQLite fails
    db = {
      runSync: () => ({ lastInsertRowId: 0, changes: 0 }),
      getAllSync: () => [],
      getFirstSync: () => null,
    };
  }
} else {
  console.warn('SQLite is not supported on web platform - using mock database');
  // Create a mock db object for web to prevent errors
  db = {
    runSync: () => ({ lastInsertRowId: 0, changes: 0 }),
    getAllSync: () => [],
    getFirstSync: () => null,
  };
}

export const initDatabase = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      db.runSync(`
        CREATE TABLE IF NOT EXISTS units (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          parent_id INTEGER,
          user_id INTEGER NOT NULL,
          unit_name TEXT NOT NULL,
          unit_type TEXT NOT NULL,
          description TEXT,
          address TEXT,
          is_rentable INTEGER DEFAULT 0,
          is_subleased INTEGER DEFAULT 0,
          rent_amount REAL,
          status TEXT DEFAULT 'vacant',
          floor_number INTEGER,
          area_sqm REAL,
          additional_data TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES units(id)
        );
      `);

      db.runSync(`
        CREATE TABLE IF NOT EXISTS unit_obligations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          unit_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          obligation_type TEXT NOT NULL,
          payee_name TEXT NOT NULL,
          payee_phone TEXT,
          amount REAL NOT NULL,
          frequency TEXT NOT NULL,
          start_date TEXT NOT NULL,
          end_date TEXT,
          next_due_date TEXT NOT NULL,
          auto_reminder INTEGER DEFAULT 1,
          status TEXT DEFAULT 'active',
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (unit_id) REFERENCES units(id)
        );
      `);

      db.runSync(`
        CREATE TABLE IF NOT EXISTS tenants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          unit_id INTEGER NOT NULL,
          full_name TEXT NOT NULL,
          id_type INTEGER DEFAULT 0,
          national_id TEXT,
          phone TEXT,
          start_date TEXT NOT NULL,
          end_date TEXT,
          rent_amount REAL NOT NULL,
          deposit_amount REAL,
          status TEXT DEFAULT 'active',
          additional_data TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (unit_id) REFERENCES units(id)
        );
      `);

      db.runSync(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          unit_id INTEGER NOT NULL,
          payment_amount REAL NOT NULL,
          payment_date TEXT NOT NULL,
          payment_type TEXT,
          payment_method TEXT,
          payment_direction TEXT NOT NULL,
          tenant_id INTEGER,
          obligation_id INTEGER,
          payer_name TEXT,
          payee_name TEXT,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (unit_id) REFERENCES units(id),
          FOREIGN KEY (tenant_id) REFERENCES tenants(id),
          FOREIGN KEY (obligation_id) REFERENCES unit_obligations(id)
        );
      `);

      db.runSync(`
        CREATE TABLE IF NOT EXISTS expense_categories (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_name TEXT NOT NULL,
          description TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
      `);

      db.runSync(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          expense_category_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          unit_id INTEGER NOT NULL,
          expense_name TEXT NOT NULL,
          expense_amount REAL NOT NULL,
          expense_date TEXT NOT NULL,
          notes TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (expense_category_id) REFERENCES expense_categories(id),
          FOREIGN KEY (unit_id) REFERENCES units(id)
        );
      `);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export default db;