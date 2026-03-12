use serde::{Deserialize, Serialize};
use rusqlite::params;

#[derive(Debug, Serialize, Deserialize)]
pub struct Employee {
    pub id: Option<i64>,
    pub name: String,
    pub id_card: Option<String>,
    pub city: Option<String>,
    pub department: Option<String>,
    pub position: Option<String>,
    pub entry_date: Option<String>,
    pub fixed_salary: f64,
    pub performance_salary: f64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Attendance {
    pub id: Option<i64>,
    pub employee_id: i64,
    pub year_month: String,
    pub work_days: f64,
    pub normal_days: f64,
    pub sick_leave_days: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SalaryResult {
    pub employee_id: i64,
    pub employee_name: String,
    pub fixed_salary: f64,
    pub performance_salary: f64,
    pub attendance_deduction: f64,
    pub monthly_salary: f64,
}

#[tauri::command]
pub fn get_employees(state: tauri::State<super::db::DbState>) -> Result<Vec<Employee>, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status FROM employees WHERE status = 'active'")
        .map_err(|e| e.to_string())?;

    let employees = stmt
        .query_map([], |row| {
            Ok(Employee {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                id_card: row.get(2)?,
                city: row.get(3)?,
                department: row.get(4)?,
                position: row.get(5)?,
                entry_date: row.get(6)?,
                fixed_salary: row.get(7)?,
                performance_salary: row.get(8)?,
                status: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(employees)
}

#[tauri::command]
pub fn add_employee(state: tauri::State<super::db::DbState>, employee: Employee) -> Result<i64, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO employees (name, id_card, city, department, position, entry_date, fixed_salary, performance_salary) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![employee.name, employee.id_card, employee.city, employee.department, employee.position, employee.entry_date, employee.fixed_salary, employee.performance_salary],
    ).map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_employee(state: tauri::State<super::db::DbState>, employee: Employee) -> Result<(), String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE employees SET name = ?1, id_card = ?2, city = ?3, department = ?4, position = ?5, entry_date = ?6, fixed_salary = ?7, performance_salary = ?8, updated_at = datetime('now') WHERE id = ?9",
        params![employee.name, employee.id_card, employee.city, employee.department, employee.position, employee.entry_date, employee.fixed_salary, employee.performance_salary, employee.id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_employee(state: tauri::State<super::db::DbState>, id: i64) -> Result<(), String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE employees SET status = 'inactive', updated_at = datetime('now') WHERE id = ?1",
        params![id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn calculate_salary(state: tauri::State<super::db::DbState>, employee_id: i64, year_month: String) -> Result<SalaryResult, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;

    // 获取员工信息
    let employee: Employee = conn.query_row(
        "SELECT id, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status FROM employees WHERE id = ?1",
        params![employee_id],
        |row| {
            Ok(Employee {
                id: Some(row.get(0)?),
                name: row.get(1)?,
                id_card: row.get(2)?,
                city: row.get(3)?,
                department: row.get(4)?,
                position: row.get(5)?,
                entry_date: row.get(6)?,
                fixed_salary: row.get(7)?,
                performance_salary: row.get(8)?,
                status: row.get(9)?,
            })
        },
    ).map_err(|e| e.to_string())?;

    // 获取考勤信息
    let attendance: Option<Attendance> = conn.query_row(
        "SELECT id, employee_id, year_month, work_days, normal_days, sick_leave_days FROM attendance WHERE employee_id = ?1 AND year_month = ?2",
        params![employee_id, year_month],
        |row| {
            Ok(Attendance {
                id: Some(row.get(0)?),
                employee_id: row.get(1)?,
                year_month: row.get(2)?,
                work_days: row.get(3)?,
                normal_days: row.get(4)?,
                sick_leave_days: row.get(5)?,
            })
        },
    ).ok();

    // 计算工资
    // 规则：固定薪酬 + 绩效薪酬 - 考勤扣款
    // 考勤扣款 = 事假天数 × (固定薪酬 ÷ 21.75)
    let daily_rate = employee.fixed_salary / 21.75;
    let sick_leave_days = attendance.map(|a| a.sick_leave_days).unwrap_or(0.0);
    let attendance_deduction = sick_leave_days * daily_rate;
    let monthly_salary = employee.fixed_salary + employee.performance_salary - attendance_deduction;

    Ok(SalaryResult {
        employee_id,
        employee_name: employee.name,
        fixed_salary: employee.fixed_salary,
        performance_salary: employee.performance_salary,
        attendance_deduction,
        monthly_salary,
    })
}

#[tauri::command]
pub fn save_attendance(state: tauri::State<super::db::DbState>, attendance: Attendance) -> Result<(), String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO attendance (employee_id, year_month, work_days, normal_days, sick_leave_days) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![attendance.employee_id, attendance.year_month, attendance.work_days, attendance.normal_days, attendance.sick_leave_days],
    ).map_err(|e| e.to_string())?;

    Ok(())
}
