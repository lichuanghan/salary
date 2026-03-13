use rusqlite::{Connection, Result};
use std::path::PathBuf;

pub struct DbState {
    pub path: PathBuf,
}

pub fn init_db(path: &PathBuf) -> Result<()> {
    let conn = Connection::open(path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_no TEXT UNIQUE,
            name TEXT NOT NULL,
            id_card TEXT,
            city TEXT,
            department TEXT,
            position TEXT,
            entry_date TEXT,
            fixed_salary REAL NOT NULL DEFAULT 0,
            performance_salary REAL NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            year_month TEXT NOT NULL,
            work_days REAL NOT NULL DEFAULT 0,
            normal_days REAL NOT NULL DEFAULT 0,
            sick_leave_days REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            FOREIGN KEY (employee_id) REFERENCES employees(id),
            UNIQUE(employee_id, year_month)
        )",
        [],
    )?;

    Ok(())
}

pub fn get_connection(state: &tauri::State<DbState>) -> Result<Connection> {
    Connection::open(&state.path)
}
