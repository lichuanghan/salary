use serde::{Deserialize, Serialize};
use rusqlite::params;

#[derive(Debug, Serialize, Deserialize)]
pub struct Employee {
    pub id: Option<i64>,
    pub employee_no: Option<String>,
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
pub struct EmployeeImport {
    pub employee_no: String,
    pub name: String,
    pub fixed_salary: f64,
    pub performance_salary: f64,
    pub entry_date: String,
    pub status: String,
    pub id_card: Option<String>,
    pub city: Option<String>,
    pub department: Option<String>,
    pub position: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatchImportResult {
    pub total: i32,
    pub success: i32,
    pub failed: i32,
    pub messages: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AttendanceImport {
    pub employee_no: String,
    pub name: String,
    pub year_month: String,
    pub work_days: f64,
    pub normal_days: f64,
    pub sick_leave_days: f64,
    pub late_count: i32,
    pub early_leave_count: i32,
    pub overtime_hours: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Attendance {
    pub id: Option<i64>,
    pub employee_id: i64,
    pub year_month: String,
    pub work_days: f64,
    pub normal_days: f64,
    pub sick_leave_days: f64,
    // 新增字段
    pub late_count: i32,
    pub early_leave_count: i32,
    pub overtime_hours: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SalaryResult {
    pub employee_id: i64,
    pub employee_name: String,
    pub year_month: String,
    pub fixed_salary: f64,
    pub performance_salary: f64,
    pub late_deduction: f64,
    pub early_leave_deduction: f64,
    pub overtime_allowance: f64,
    pub attendance_deduction: f64,
    pub gross_salary: f64,
    pub net_salary: f64,
}

#[tauri::command]
pub fn get_employees(state: tauri::State<super::db::DbState>) -> Result<Vec<Employee>, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, employee_no, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status FROM employees WHERE status = 'active'")
        .map_err(|e| e.to_string())?;

    let employees = stmt
        .query_map([], |row| {
            Ok(Employee {
                id: Some(row.get(0)?),
                employee_no: row.get(1)?,
                name: row.get(2)?,
                id_card: row.get(3)?,
                city: row.get(4)?,
                department: row.get(5)?,
                position: row.get(6)?,
                entry_date: row.get(7)?,
                fixed_salary: row.get(8)?,
                performance_salary: row.get(9)?,
                status: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(employees)
}

#[tauri::command]
pub fn add_employee(state: tauri::State<super::db::DbState>, employee: Employee) -> Result<i64, String> {
    println!("[add_employee] Received employee: {:?}", employee);

    let conn = super::db::get_connection(&state).map_err(|e| {
        println!("[add_employee] Connection error: {}", e);
        e.to_string()
    })?;

    let result = conn.execute(
        "INSERT INTO employees (employee_no, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![employee.employee_no, employee.name, employee.id_card, employee.city, employee.department, employee.position, employee.entry_date, employee.fixed_salary, employee.performance_salary, employee.status],
    );

    match result {
        Ok(rows) => {
            println!("[add_employee] Inserted successfully, rows affected: {}", rows);
            let id = conn.last_insert_rowid();
            println!("[add_employee] New employee id: {}", id);
            Ok(id)
        }
        Err(e) => {
            println!("[add_employee] Insert error: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub fn update_employee(state: tauri::State<super::db::DbState>, employee: Employee) -> Result<(), String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE employees SET employee_no = ?1, name = ?2, id_card = ?3, city = ?4, department = ?5, position = ?6, entry_date = ?7, fixed_salary = ?8, performance_salary = ?9, status = ?10, updated_at = datetime('now') WHERE id = ?11",
        params![employee.employee_no, employee.name, employee.id_card, employee.city, employee.department, employee.position, employee.entry_date, employee.fixed_salary, employee.performance_salary, employee.status, employee.id],
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
pub fn search_employees(state: tauri::State<super::db::DbState>, keyword: String) -> Result<Vec<Employee>, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;
    let search_pattern = format!("%{}%", keyword);

    let mut stmt = conn
        .prepare("SELECT id, employee_no, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status FROM employees WHERE status = 'active' AND (name LIKE ?1 OR department LIKE ?1 OR position LIKE ?1)")
        .map_err(|e| e.to_string())?;

    let employees = stmt
        .query_map([&search_pattern], |row| {
            Ok(Employee {
                id: Some(row.get(0)?),
                employee_no: row.get(1)?,
                name: row.get(2)?,
                id_card: row.get(3)?,
                city: row.get(4)?,
                department: row.get(5)?,
                position: row.get(6)?,
                entry_date: row.get(7)?,
                fixed_salary: row.get(8)?,
                performance_salary: row.get(9)?,
                status: row.get(10)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(employees)
}

#[tauri::command]
pub fn calculate_salary(state: tauri::State<super::db::DbState>, employee_id: i64, year_month: String) -> Result<SalaryResult, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;

    // 获取员工信息
    let employee: Employee = conn.query_row(
        "SELECT id, employee_no, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status FROM employees WHERE id = ?1",
        params![employee_id],
        |row| {
            Ok(Employee {
                id: Some(row.get(0)?),
                employee_no: row.get(1)?,
                name: row.get(2)?,
                id_card: row.get(3)?,
                city: row.get(4)?,
                department: row.get(5)?,
                position: row.get(6)?,
                entry_date: row.get(7)?,
                fixed_salary: row.get(8)?,
                performance_salary: row.get(9)?,
                status: row.get(10)?,
            })
        },
    ).map_err(|e| e.to_string())?;

    // 获取考勤信息
    let attendance: Option<Attendance> = conn.query_row(
        "SELECT id, employee_id, year_month, work_days, normal_days, sick_leave_days, COALESCE(late_count, 0), COALESCE(early_leave_count, 0), COALESCE(overtime_hours, 0) FROM attendance WHERE employee_id = ?1 AND year_month = ?2",
        params![employee_id, year_month],
        |row| {
            Ok(Attendance {
                id: Some(row.get(0)?),
                employee_id: row.get(1)?,
                year_month: row.get(2)?,
                work_days: row.get(3)?,
                normal_days: row.get(4)?,
                sick_leave_days: row.get(5)?,
                late_count: row.get(6)?,
                early_leave_count: row.get(7)?,
                overtime_hours: row.get(8)?,
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

    let gross_salary = employee.fixed_salary + employee.performance_salary;
    let net_salary = gross_salary - attendance_deduction;

    Ok(SalaryResult {
        employee_id,
        employee_name: employee.name,
        year_month: year_month.clone(),
        fixed_salary: employee.fixed_salary,
        performance_salary: employee.performance_salary,
        late_deduction: 0.0,
        early_leave_deduction: 0.0,
        overtime_allowance: 0.0,
        attendance_deduction,
        gross_salary,
        net_salary,
    })
}

#[tauri::command]
pub fn batch_calculate_salary(state: tauri::State<super::db::DbState>, employee_ids: Vec<i64>, year_month: String) -> Result<Vec<SalaryResult>, String> {
    println!("[batch_calculate_salary] 收到请求, employee_ids: {:?}, year_month: {}", employee_ids, year_month);
    let conn = super::db::get_connection(&state).map_err(|e| {
        println!("[batch_calculate_salary] 获取连接失败: {}", e);
        e.to_string()
    })?;

    let mut results: Vec<SalaryResult> = Vec::new();

    for employee_id in employee_ids {
        // 获取员工信息
        let employee: Employee = match conn.query_row(
            "SELECT id, employee_no, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status FROM employees WHERE id = ?1",
            params![employee_id],
            |row| {
                Ok(Employee {
                    id: Some(row.get(0)?),
                    employee_no: row.get(1)?,
                    name: row.get(2)?,
                    id_card: row.get(3)?,
                    city: row.get(4)?,
                    department: row.get(5)?,
                    position: row.get(6)?,
                    entry_date: row.get(7)?,
                    fixed_salary: row.get(8)?,
                    performance_salary: row.get(9)?,
                    status: row.get(10)?,
                })
            },
        ) {
            Ok(e) => e,
            Err(_) => continue,
        };

        // 获取考勤信息
        let attendance: Option<Attendance> = conn.query_row(
            "SELECT id, employee_id, year_month, work_days, normal_days, sick_leave_days, COALESCE(late_count, 0), COALESCE(early_leave_count, 0), COALESCE(overtime_hours, 0) FROM attendance WHERE employee_id = ?1 AND year_month = ?2",
            params![employee_id, &year_month],
            |row| {
                Ok(Attendance {
                    id: Some(row.get(0)?),
                    employee_id: row.get(1)?,
                    year_month: row.get(2)?,
                    work_days: row.get(3)?,
                    normal_days: row.get(4)?,
                    sick_leave_days: row.get(5)?,
                    late_count: row.get(6)?,
                    early_leave_count: row.get(7)?,
                    overtime_hours: row.get(8)?,
                })
            },
        ).ok();

        // 计算工资
        let daily_rate = employee.fixed_salary / 21.75;
        let sick_leave_days = attendance.as_ref().map(|a| a.sick_leave_days).unwrap_or(0.0);
        let attendance_deduction = sick_leave_days * daily_rate;
        let monthly_salary = employee.fixed_salary + employee.performance_salary - attendance_deduction;

        results.push(SalaryResult {
            employee_id,
            employee_name: employee.name,
            year_month: year_month.clone(),
            fixed_salary: employee.fixed_salary,
            performance_salary: employee.performance_salary,
            late_deduction: 0.0,
            early_leave_deduction: 0.0,
            overtime_allowance: 0.0,
            attendance_deduction,
            gross_salary: employee.fixed_salary + employee.performance_salary,
            net_salary: monthly_salary,
        });
    }

    Ok(results)
}

#[tauri::command]
pub fn save_attendance(state: tauri::State<super::db::DbState>, attendance: Attendance) -> Result<(), String> {
    println!("[save_attendance] 收到考勤数据: {:?}", attendance);

    let conn = super::db::get_connection(&state).map_err(|e| {
        println!("[save_attendance] 获取数据库连接失败: {}", e);
        e.to_string()
    })?;

    let result = if let Some(id) = attendance.id {
        // 更新现有记录
        println!("[save_attendance] 执行SQL: UPDATE attendance WHERE id = {}", id);
        conn.execute(
            "UPDATE attendance SET employee_id = ?1, year_month = ?2, work_days = ?3, normal_days = ?4, sick_leave_days = ?5, late_count = ?6, early_leave_count = ?7, overtime_hours = ?8 WHERE id = ?9",
            params![attendance.employee_id, attendance.year_month, attendance.work_days, attendance.normal_days, attendance.sick_leave_days, attendance.late_count, attendance.early_leave_count, attendance.overtime_hours, id],
        )
    } else {
        // 插入新记录
        println!("[save_attendance] 执行SQL: INSERT INTO attendance");
        conn.execute(
            "INSERT INTO attendance (employee_id, year_month, work_days, normal_days, sick_leave_days, late_count, early_leave_count, overtime_hours) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![attendance.employee_id, attendance.year_month, attendance.work_days, attendance.normal_days, attendance.sick_leave_days, attendance.late_count, attendance.early_leave_count, attendance.overtime_hours],
        )
    };

    match result {
        Ok(rows) => {
            println!("[save_attendance] 保存成功, 影响行数: {}", rows);
            Ok(())
        }
        Err(e) => {
            println!("[save_attendance] 保存失败: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub fn delete_attendance(state: tauri::State<super::db::DbState>, id: i64) -> Result<(), String> {
    println!("[delete_attendance] 收到删除请求, id: {}", id);

    let conn = super::db::get_connection(&state).map_err(|e| {
        println!("[delete_attendance] 获取数据库连接失败: {}", e);
        e.to_string()
    })?;

    let result = conn.execute("DELETE FROM attendance WHERE id = ?1", params![id]);

    match result {
        Ok(rows) => {
            println!("[delete_attendance] 删除成功, 影响行数: {}", rows);
            Ok(())
        }
        Err(e) => {
            println!("[delete_attendance] 删除失败: {}", e);
            Err(e.to_string())
        }
    }
}

#[tauri::command]
pub fn get_attendances(state: tauri::State<super::db::DbState>, year_month: String) -> Result<Vec<Attendance>, String> {
    println!("[get_attendances] 收到查询请求, year_month: '{}'", year_month);

    let conn = super::db::get_connection(&state).map_err(|e| {
        println!("[get_attendances] 获取连接失败: {}", e);
        e.to_string()
    })?;

    // 先查看数据库中的所有数据
    println!("[get_attendances] 查看数据库中的所有考勤记录...");
    let mut check_stmt = conn.prepare("SELECT id, employee_id, year_month FROM attendance").map_err(|e| e.to_string())?;
    let all_records: Vec<(i64, i64, String)> = check_stmt.query_map([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    }).map_err(|e| e.to_string())?
    .filter_map(|r| r.ok())
    .collect();
    println!("[get_attendances] 数据库中共有 {} 条记录", all_records.len());
    for r in &all_records {
        println!("[get_attendances]   id={}, employee_id={}, year_month='{}'", r.0, r.1, r.2);
    }

    // 查询指定月份
    println!("[get_attendances] 查询 year_month = '{}' 的记录...", year_month);
    let mut stmt = conn
        .prepare("SELECT id, employee_id, year_month, work_days, normal_days, sick_leave_days, COALESCE(late_count, 0), COALESCE(early_leave_count, 0), COALESCE(overtime_hours, 0) FROM attendance WHERE year_month = ?1")
        .map_err(|e| {
            println!("[get_attendances] SQL准备失败: {}", e);
            e.to_string()
        })?;

    let attendances = stmt
        .query_map([&year_month], |row| {
            Ok(Attendance {
                id: Some(row.get(0)?),
                employee_id: row.get(1)?,
                year_month: row.get(2)?,
                work_days: row.get(3)?,
                normal_days: row.get(4)?,
                sick_leave_days: row.get(5)?,
                late_count: row.get(6)?,
                early_leave_count: row.get(7)?,
                overtime_hours: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    println!("[get_attendances] 查询结果: {} 条记录", attendances.len());
    Ok(attendances)
}

#[tauri::command]
pub fn batch_import_employees(
    state: tauri::State<super::db::DbState>,
    employees: Vec<EmployeeImport>,
) -> Result<BatchImportResult, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;

    let mut total = 0;
    let mut success = 0;
    let mut failed = 0;
    let mut messages: Vec<String> = Vec::new();

    // 开启事务
    conn.execute("BEGIN TRANSACTION", [],).map_err(|e| e.to_string())?;

    for emp in &employees {
        total += 1;

        // 检查必填字段
        if emp.name.is_empty() || emp.employee_no.is_empty() {
            failed += 1;
            messages.push(format!("第{}行：员工编号和姓名为必填项", total));
            continue;
        }

        // 查找已存在的员工
        let existing: Option<i64> = conn
            .query_row(
                "SELECT id FROM employees WHERE employee_no = ?1",
                [&emp.employee_no],
                |row| row.get(0),
            )
            .ok();

        let result = if let Some(id) = existing {
            // 更新
            conn.execute(
                "UPDATE employees SET name = ?1, employee_no = ?2, fixed_salary = ?3,
                 performance_salary = ?4, entry_date = ?5, status = ?6,
                 id_card = ?7, city = ?8, department = ?9, position = ?10,
                 updated_at = datetime('now')
                 WHERE id = ?11",
                (
                    &emp.name,
                    &emp.employee_no,
                    emp.fixed_salary,
                    emp.performance_salary,
                    &emp.entry_date,
                    &emp.status,
                    &emp.id_card,
                    &emp.city,
                    &emp.department,
                    &emp.position,
                    id,
                ),
            )
        } else {
            // 插入
            conn.execute(
                "INSERT INTO employees (employee_no, name, fixed_salary, performance_salary,
                 entry_date, status, id_card, city, department, position)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                (
                    &emp.employee_no,
                    &emp.name,
                    emp.fixed_salary,
                    emp.performance_salary,
                    &emp.entry_date,
                    &emp.status,
                    &emp.id_card,
                    &emp.city,
                    &emp.department,
                    &emp.position,
                ),
            )
        };

        match result {
            Ok(_) => success += 1,
            Err(e) => {
                failed += 1;
                messages.push(format!("第{}行：{} - {}", total, &emp.name, e));
            }
        }
    }

    // 根据结果提交或回滚
    if failed > 0 {
        conn.execute("ROLLBACK", [],).map_err(|e| e.to_string())?;
    } else {
        conn.execute("COMMIT", [],).map_err(|e| e.to_string())?;
    }

    Ok(BatchImportResult {
        total,
        success,
        failed,
        messages,
    })
}

#[tauri::command]
pub fn batch_import_attendances(
    state: tauri::State<super::db::DbState>,
    attendances: Vec<AttendanceImport>,
) -> Result<BatchImportResult, String> {
    let conn = super::db::get_connection(&state).map_err(|e| e.to_string())?;

    let mut total = 0;
    let mut success = 0;
    let mut failed = 0;
    let mut messages: Vec<String> = Vec::new();

    // 开启事务
    conn.execute("BEGIN TRANSACTION", [],).map_err(|e| e.to_string())?;

    for att in &attendances {
        total += 1;

        // 检查必填字段
        if att.employee_no.is_empty() && att.name.is_empty() {
            failed += 1;
            messages.push(format!("第{}行：员工编号或姓名为必填项", total));
            continue;
        }
        if att.year_month.is_empty() {
            failed += 1;
            messages.push(format!("第{}行：考勤月份为必填项", total));
            continue;
        }

        // 查找员工ID
        let employee_id: Option<i64> = if !att.employee_no.is_empty() {
            conn.query_row(
                "SELECT id FROM employees WHERE employee_no = ?1",
                [&att.employee_no],
                |row| row.get(0),
            )
            .ok()
        } else {
            conn.query_row(
                "SELECT id FROM employees WHERE name = ?1",
                [&att.name],
                |row| row.get(0),
            )
            .ok()
        };

        let employee_id = match employee_id {
            Some(id) => id,
            None => {
                failed += 1;
                messages.push(format!("第{}行：员工不存在", total));
                continue;
            }
        };

        // 插入或更新考勤记录
        let result = conn.execute(
            "INSERT OR REPLACE INTO attendance (employee_id, year_month, work_days, normal_days, sick_leave_days, late_count, early_leave_count, overtime_hours) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                employee_id,
                att.year_month,
                att.work_days,
                att.normal_days,
                att.sick_leave_days,
                att.late_count,
                att.early_leave_count,
                att.overtime_hours,
            ],
        );

        match result {
            Ok(_) => success += 1,
            Err(e) => {
                failed += 1;
                messages.push(format!("第{}行：{} - {}", total, &att.name, e));
            }
        }
    }

    // 根据结果提交或回滚
    if failed > 0 {
        conn.execute("ROLLBACK", [],).map_err(|e| e.to_string())?;
    } else {
        conn.execute("COMMIT", [],).map_err(|e| e.to_string())?;
    }

    Ok(BatchImportResult {
        total,
        success,
        failed,
        messages,
    })
}
