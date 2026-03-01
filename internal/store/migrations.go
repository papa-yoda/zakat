package store

import "database/sql"

func runMigrations(db *sql.DB) error {
	migrations := []string{
		`CREATE TABLE IF NOT EXISTS retirement_accounts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			balance REAL NOT NULL DEFAULT 0,
			withdrawal_penalty REAL NOT NULL DEFAULT 10.0,
			tax_rate REAL NOT NULL DEFAULT 33.0,
			included_in_zakat BOOLEAN NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS investments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ticker TEXT NOT NULL,
			shares REAL NOT NULL DEFAULT 0,
			purchase_date TEXT NOT NULL,
			purchase_price REAL NOT NULL DEFAULT 0,
			included_in_zakat BOOLEAN NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS savings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			amount REAL NOT NULL DEFAULT 0,
			included_in_zakat BOOLEAN NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS jewelry (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			metal_type TEXT NOT NULL,
			weight_grams REAL NOT NULL DEFAULT 0,
			included_in_zakat BOOLEAN NOT NULL DEFAULT 1,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT NOT NULL
		)`,
		`INSERT OR IGNORE INTO settings (key, value) VALUES ('nisab_method', '"silver"')`,
		`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_withdrawal_penalty', '10.0')`,
		`INSERT OR IGNORE INTO settings (key, value) VALUES ('default_tax_rate', '33.0')`,
	}

	for _, m := range migrations {
		if _, err := db.Exec(m); err != nil {
			return err
		}
	}
	return nil
}
