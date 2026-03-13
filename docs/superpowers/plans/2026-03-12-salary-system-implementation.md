# 薪酬计算系统实施计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立一个本地桌面端HR薪酬管理系统，支持员工信息管理、工资核算、考勤扣款计算

**Architecture:** Tauri桌面应用，前端使用React + TypeScript，后端使用Rust，SQLite本地存储

**Tech Stack:** Tauri 2.x + React 19.x + TypeScript + Tailwind CSS 4.x + Vite 8.x + SQLite

---

## 文件结构

```
salary-system/
├── src/                          # React前端源码
│   ├── components/               # UI组件
│   │   ├── Layout/              # 布局组件
│   │   ├── Employee/            # 员工管理
│   │   ├── Salary/               # 工资核算
│   │   └── Attendance/          # 考勤管理
│   ├── pages/                   # 页面
│   ├── hooks/                   # 自定义hooks
│   ├── utils/                   # 工具函数
│   │   └── calculations.ts      # 薪酬计算逻辑
│   ├── types/                   # TypeScript类型
│   └── App.tsx
├── src-tauri/                   # Rust后端
│   ├── src/
│   │   ├── main.rs              # 入口
│   │   ├── db.rs                # 数据库操作
│   │   └── commands.rs          # Tauri命令
│   ├── Cargo.toml
│   └── tauri.conf.json
├── data/                        # SQLite数据库
└── package.json
```

---

## Chunk 1: 项目基础搭建

### Task 1: 初始化Tauri + React项目

**Files:**
- Create: `package.json`
- Create: `src-tauri/Cargo.toml`
- Create: `src-tauri/tauri.conf.json`
- Create: `src-tauri/src/main.rs`
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `tsconfig.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "salary-system",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  },
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "@tauri-apps/api": "^2.10.1"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2.10.1",
    "@tailwindcss/vite": "^4.2.1",
    "@types/react": "^19.2.14",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.3",
    "tailwindcss": "^4.2.1",
    "typescript": "^5.9.3",
    "vite": "^8.0.0"
  }
}
```

- [ ] **Step 2: 创建 Vite 配置**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
```

- [ ] **Step 3: 创建 TypeScript 配置**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: 创建 Tailwind 配置**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 5: 创建 PostCSS 配置**

```javascript
export default {
  plugins: {
    autoprefixer: {},
  },
}
```

- [ ] **Step 6: 创建 Tauri Cargo.toml**

```toml
[package]
name = "salary-system"
version = "1.0.0"
description = "HR薪酬管理系统"
authors = [""]
edition = "2024"

[lib]
name = "salary_system_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-opener = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.38", features = ["bundled"] }
chrono = { version = "0.4", features = ["serde"] }

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

- [ ] **Step 7: 创建 Tauri 配置**

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "薪酬管理系统",
  "version": "1.0.0",
  "identifier": "com.salary.system",
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:1420",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "title": "薪酬管理系统",
        "width": 1200,
        "height": 800,
        "minWidth": 1024,
        "minHeight": 768,
        "resizable": true,
        "fullscreen": false
      }
    ],
    "security": {
      "csp": null
    }
  }
}
```

- [ ] **Step 8: 创建 Tauri build.rs**

```rust
fn main() {
    tauri_build::build()
}
```

- [ ] **Step 9: 创建 Rust 主入口**

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod commands;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().expect("Failed to get app data dir");
            std::fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
            let db_path = app_dir.join("salary.db");
            db::init_db(&db_path).expect("Failed to initialize database");
            app.manage(db::DbState { path: db_path });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_employees,
            commands::add_employee,
            commands::update_employee,
            commands::delete_employee,
            commands::calculate_salary,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 10: 创建数据库模块**

```rust
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
```

- [ ] **Step 11: 创建命令模块**

```rust
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
pub fn get_employees(state: tauri::State<db::DbState>) -> Result<Vec<Employee>, String> {
    let conn = db::get_connection(&state).map_err(|e| e.to_string())?;
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
pub fn add_employee(state: tauri::State<db::DbState>, employee: Employee) -> Result<i64, String> {
    let conn = db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO employees (name, id_card, city, department, position, entry_date, fixed_salary, performance_salary) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![employee.name, employee.id_card, employee.city, employee.department, employee.position, employee.entry_date, employee.fixed_salary, employee.performance_salary],
    ).map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_employee(state: tauri::State<db::DbState>, employee: Employee) -> Result<(), String> {
    let conn = db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE employees SET name = ?1, id_card = ?2, city = ?3, department = ?4, position = ?5, entry_date = ?6, fixed_salary = ?7, performance_salary = ?8, updated_at = datetime('now') WHERE id = ?9",
        params![employee.name, employee.id_card, employee.city, employee.department, employee.position, employee.entry_date, employee.fixed_salary, employee.performance_salary, employee.id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_employee(state: tauri::State<db::DbState>, id: i64) -> Result<(), String> {
    let conn = db::get_connection(&state).map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE employees SET status = 'inactive', updated_at = datetime('now') WHERE id = ?1",
        params![id],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn calculate_salary(state: tauri::State<db::DbState>, employee_id: i64, year_month: String) -> Result<SalaryResult, String> {
    let conn = db::get_connection(&state).map_err(|e| e.to_string())?;

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
```

- [ ] **Step 12: 创建前端入口 HTML**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>薪酬管理系统</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 13: 创建 React 入口**

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 14: 创建全局样式**

```css
@import "tailwindcss";
```

- [ ] **Step 15: 创建主应用组件**

```tsx
import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'

interface Employee {
  id?: number
  name: string
  id_card?: string
  city?: string
  department?: string
  position?: string
  entry_date?: string
  fixed_salary: number
  performance_salary: number
  status: string
}

interface SalaryResult {
  employee_id: number
  employee_name: string
  fixed_salary: number
  performance_salary: number
  attendance_deduction: number
  monthly_salary: number
}

function App() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [yearMonth, setYearMonth] = useState('2026-03')
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState<Employee>({
    name: '',
    fixed_salary: 0,
    performance_salary: 0,
    status: 'active'
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await invoke<Employee[]>('get_employees')
      setEmployees(data)
    } catch (error) {
      console.error('加载员工失败:', error)
    }
  }

  const handleAddEmployee = async () => {
    try {
      await invoke('add_employee', { employee: formData })
      setShowAddModal(false)
      setFormData({ name: '', fixed_salary: 0, performance_salary: 0, status: 'active' })
      loadEmployees()
    } catch (error) {
      console.error('添加员工失败:', error)
    }
  }

  const handleCalculate = async () => {
    if (!selectedEmployee?.id) return
    try {
      const result = await invoke<SalaryResult>('calculate_salary', {
        employeeId: selectedEmployee.id,
        yearMonth
      })
      setSalaryResult(result)
    } catch (error) {
      console.error('计算工资失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">薪酬管理系统</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 员工列表 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">员工列表</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                添加员工
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">姓名</th>
                    <th className="px-4 py-2 text-right">固定薪酬</th>
                    <th className="px-4 py-2 text-right">绩效薪酬</th>
                    <th className="px-4 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className={`border-t hover:bg-gray-50 cursor-pointer ${
                        selectedEmployee?.id === emp.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedEmployee(emp)}
                    >
                      <td className="px-4 py-2">{emp.name}</td>
                      <td className="px-4 py-2 text-right">¥{emp.fixed_salary.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right">¥{emp.performance_salary.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            invoke('delete_employee', { id: emp.id })
                            loadEmployees()
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        暂无员工，请添加
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 工资核算 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">工资核算</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择年月
              </label>
              <input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择员工
              </label>
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const emp = employees.find((em) => em.id === Number(e.target.value))
                  setSelectedEmployee(emp || null)
                }}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">请选择员工</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculate}
              disabled={!selectedEmployee}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              计算工资
            </button>

            {salaryResult && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-3">{salaryResult.employee_name} - {yearMonth} 月工资</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>固定薪酬：</span>
                    <span>¥{salaryResult.fixed_salary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>绩效薪酬：</span>
                    <span>¥{salaryResult.performance_salary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>考勤扣减：</span>
                    <span>- ¥{salaryResult.attendance_deduction.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>本月工资：</span>
                    <span className="text-green-600">¥{salaryResult.monthly_salary.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 添加员工弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">添加员工</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">固定薪酬 *</label>
                <input
                  type="number"
                  value={formData.fixed_salary}
                  onChange={(e) => setFormData({ ...formData, fixed_salary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">绩效薪酬 *</label>
                <input
                  type="number"
                  value={formData.performance_salary}
                  onChange={(e) => setFormData({ ...formData, performance_salary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={!formData.name}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
```

- [ ] **Step 16: 安装依赖并构建项目**

```bash
npm install
npm run build
npm run tauri build
```

- [ ] **Step 17: 提交代码**

```bash
git add -A
git commit -m "feat: 初始化Tauri + React项目基础架构"
```

---

## 验证点

1. 项目能成功编译
2. Tauri窗口能正常打开
3. 能添加员工到数据库
4. 能计算工资（固定+绩效-考勤扣款）
5. 工资计算结果正确（例：固定5000+绩效5000-事假2天扣款459.77=9540.23）

---

**Chunk 1 完成标准:**
- [ ] `npm run tauri build` 成功生成可执行文件
- [ ] 应用能正常启动
- [ ] 能添加员工
- [ ] 能计算工资（符合规则：固定+绩效-考勤扣款）

