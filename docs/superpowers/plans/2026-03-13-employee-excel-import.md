# 员工Excel批量导入实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现员工信息的Excel批量导入功能，支持通过上传Excel文件批量添加或更新员工数据

**Architecture:** 前端使用xlsx库解析Excel文件，后端使用Rust处理批量数据，使用员工编号作为唯一标识匹配现有数据

**Tech Stack:** React 19 + TypeScript + xlsx + Tauri 2.x + Rust + SQLite

---

## Chunk 1: 前置条件 - Schema和类型变更

### Task 1: 添加 employee_no 字段到 TypeScript 类型

**Files:**
- Modify: `src/types/index.ts:1-12`

- [ ] **Step 1: 修改 Employee 接口添加 employee_no 字段**

修改 `src/types/index.ts`，在 Employee 接口中添加 `employee_no?: string` 字段：

```typescript
export interface Employee {
  id?: number
  employee_no?: string  // 新增
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
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npm run build`
Expected: 编译成功，无错误

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add employee_no field to Employee type"
```

---

### Task 2: 添加 employee_no 字段到 Rust 结构体

**Files:**
- Modify: `src-tauri/src/commands.rs:5-16`

- [ ] **Step 1: 修改 Employee 结构体添加 employee_no 字段**

修改 `src-tauri/src/commands.rs`，在 Employee 结构体中添加 `employee_no: Option<String>`：

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Employee {
    pub id: Option<i64>,
    pub employee_no: Option<String>,  // 新增
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
```

- [ ] **Step 2: 验证 Rust 编译**

Run: `cd src-tauri && cargo build`
Expected: 编译成功，无错误

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/commands.rs
git commit -m "feat: add employee_no field to Rust Employee struct"
```

---

### Task 3: 修改数据库添加 employee_no 字段

**Files:**
- Modify: `src-tauri/src/db.rs:11-27`

- [ ] **Step 1: 修改数据库初始化SQL添加字段**

修改 `src-tauri/src/db.rs`，在 employees 表创建时添加 employee_no 字段：

```rust
conn.execute(
    "CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_no TEXT UNIQUE,  -- 新增
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
```

- [ ] **Step 2: 验证 Rust 编译**

Run: `cd src-tauri && cargo build`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/db.rs
git commit -m "feat: add employee_no column to employees table"
```

---

## Chunk 2: 前端 - 安装xlsx和API层

### Task 4: 安装 xlsx 库

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 xlsx 库**

Run: `npm install xlsx`
Expected: 安装成功

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install xlsx library for excel parsing"
```

---

### Task 5: 添加 batchImportEmployees API

**Files:**
- Modify: `src/hooks/api.ts`

- [ ] **Step 1: 添加 EmployeeImport 和 BatchImportResult 类型定义**

在 `src/hooks/api.ts` 开头添加：

```typescript
export interface EmployeeImport {
  employee_no: string
  name: string
  fixed_salary: number
  performance_salary: number
  entry_date: string
  status: string
  id_card?: string
  city?: string
  department?: string
  position?: string
}

export interface BatchImportResult {
  total: number
  success: number
  failed: number
  messages: string[]
}
```

- [ ] **Step 2: 添加 batchImportEmployees 函数**

在 `src/hooks/api.ts` 末尾添加：

```typescript
export async function batchImportEmployees(employees: EmployeeImport[]): Promise<BatchImportResult> {
  return invoke<BatchImportResult>('batch_import_employees', { employees })
}
```

- [ ] **Step 3: 验证 TypeScript 编译**

Run: `npm run build`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add src/hooks/api.ts
git commit -m "feat: add batchImportEmployees API"
```

---

## Chunk 3: 前端 - Excel解析和导入组件

### Task 6: 创建 Excel 解析工具函数

**Files:**
- Create: `src/hooks/useExcel.ts`

- [ ] **Step 1: 创建 useExcel.ts 工具函数**

创建 `src/hooks/useExcel.ts`：

```typescript
import * as XLSX from 'xlsx'
import type { EmployeeImport } from './api'

export interface ParsedEmployee {
  row: number
  data: EmployeeImport
  error?: string
}

export function parseExcelFile(file: File): Promise<ParsedEmployee[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]

        // 第一行是表头
        const headers = jsonData[0].map((h: any) => String(h).trim())
        const employeeNoIndex = headers.findIndex((h: string) => h.includes('编号'))
        const nameIndex = headers.findIndex((h: string) => h.includes('姓名'))
        const fixedSalaryIndex = headers.findIndex((h: string) => h.includes('固定工资'))
        const performanceSalaryIndex = headers.findIndex((h: string) => h.includes('绩效工资'))
        const entryDateIndex = headers.findIndex((h: string) => h.includes('入职'))
        const statusIndex = headers.findIndex((h: string) => h.includes('状态'))
        const idCardIndex = headers.findIndex((h: string) => h.includes('身份证'))
        const cityIndex = headers.findIndex((h: string) => h.includes('城市'))
        const departmentIndex = headers.findIndex((h: string) => h.includes('部门'))
        const positionIndex = headers.findIndex((h: string) => h.includes('职位'))

        const results: ParsedEmployee[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.length === 0 || !row[nameIndex]) continue

          const employeeNo = employeeNoIndex >= 0 ? String(row[employeeNoIndex] || '').trim() : ''
          const name = nameIndex >= 0 ? String(row[nameIndex] || '').trim() : ''
          const fixedSalary = fixedSalaryIndex >= 0 ? parseFloat(String(row[fixedSalaryIndex] || '0')) : 0
          const performanceSalary = performanceSalaryIndex >= 0 ? parseFloat(String(row[performanceSalaryIndex] || '0')) : 0
          const entryDate = entryDateIndex >= 0 ? String(row[entryDateIndex] || '').trim() : ''
          const statusRaw = statusIndex >= 0 ? String(row[statusIndex] || '').trim() : ''

          // 状态转换
          let status = 'active'
          if (statusRaw === '在职' || statusRaw === '1' || statusRaw === 'active') {
            status = 'active'
          } else if (statusRaw === '离职' || statusRaw === '0' || statusRaw === 'inactive') {
            status = 'inactive'
          }

          // 必填字段校验
          const errors: string[] = []
          if (!employeeNo) errors.push('员工编号')
          if (!name) errors.push('姓名')
          if (!entryDate) errors.push('入职时间')
          if (isNaN(fixedSalary)) errors.push('固定工资')
          if (isNaN(performanceSalary)) errors.push('绩效工资')

          results.push({
            row: i + 1,
            data: {
              employee_no: employeeNo,
              name,
              fixed_salary: fixedSalary,
              performance_salary: performanceSalary,
              entry_date: entryDate,
              status,
              id_card: idCardIndex >= 0 ? String(row[idCardIndex] || '').trim() || undefined : undefined,
              city: cityIndex >= 0 ? String(row[cityIndex] || '').trim() || undefined : undefined,
              department: departmentIndex >= 0 ? String(row[departmentIndex] || '').trim() || undefined : undefined,
              position: positionIndex >= 0 ? String(row[positionIndex] || '').trim() || undefined : undefined,
            },
            error: errors.length > 0 ? `第${i + 1}行：${errors.join('/')}为必填项` : undefined,
          })
        }

        resolve(results)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

export function generateTemplate(): void {
  const headers = ['员工编号', '姓名', '固定工资', '绩效工资', '入职时间', '状态', '身份证号', '城市', '部门', '职位']
  const example = ['EMP001', '张三', '5000', '2000', '2024-01-15', '在职', '110101199001011234', '北京', '技术部', '工程师']
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '员工导入模板')
  XLSX.writeFile(wb, '员工导入模板.xlsx')
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npm run build`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useExcel.ts
git commit -m "feat: add Excel parsing utilities"
```

---

### Task 7: 创建 EmployeeImportModal 组件

**Files:**
- Create: `src/components/EmployeeImportModal.tsx`
- Modify: `src/components/index.ts`

- [ ] **Step 1: 创建 EmployeeImportModal 组件**

创建 `src/components/EmployeeImportModal.tsx`：

```tsx
import { useState, useRef } from 'react'
import { batchImportEmployees, type EmployeeImport, type BatchImportResult } from '../hooks/api'
import { parseExcelFile, generateTemplate, type ParsedEmployee } from '../hooks/useExcel'

interface EmployeeImportModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function EmployeeImportModal({ onClose, onSuccess }: EmployeeImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedEmployee[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BatchImportResult | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      alert('请选择 Excel 文件 (.xlsx 或 .xls)')
      return
    }
    setFile(selectedFile)
    setResult(null)
    try {
      const data = await parseExcelFile(selectedFile)
      // 限制最多500条
      if (data.length > 500) {
        alert('单次导入最多支持500条记录')
        return
      }
      setParsedData(data)
    } catch (error) {
      console.error('解析Excel失败:', error)
      alert('解析Excel文件失败，请检查文件格式')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return

    setLoading(true)
    try {
      // 过滤有效数据（无错误）
      const validData: EmployeeImport[] = parsedData
        .filter(p => !p.error)
        .map(p => p.data)

      if (validData.length === 0) {
        alert('没有有效数据可导入')
        return
      }

      const importResult = await batchImportEmployees(validData)
      setResult(importResult)
      if (importResult.success > 0) {
        onSuccess()
      }
    } catch (error) {
      console.error('导入失败:', error)
      alert('导入失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const validCount = parsedData.filter(p => !p.error).length
  const errorCount = parsedData.filter(p => p.error).length

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)',
                boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>批量导入员工</h3>
          </div>
        </div>

        <div className="modal-body">
          {!result ? (
            <>
              {/* 文件上传区域 */}
              {!parsedData.length && (
                <div
                  className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                  style={{
                    border: `2px dashed ${dragOver ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: '12px',
                    padding: '40px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: dragOver ? 'var(--color-bg-secondary)' : 'transparent'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  />
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p style={{ color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                    点击或拖拽上传 Excel 文件
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
                    支持 .xlsx 和 .xls 格式
                  </p>
                </div>
              )}

              {/* 预览表格 */}
              {parsedData.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        已选择: <strong>{file?.name}</strong>
                      </span>
                      <span style={{ color: 'var(--color-success)' }}>有效: {validCount} 条</span>
                      {errorCount > 0 && (
                        <span style={{ color: 'var(--color-danger)' }}>无效: {errorCount} 条</span>
                      )}
                    </div>
                    <button
                      onClick={() => { setFile(null); setParsedData([]) }}
                      className="btn btn-secondary btn-sm"
                    >
                      重新选择
                    </button>
                  </div>

                  <div className="overflow-x-auto" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>序号</th>
                          <th>员工编号</th>
                          <th>姓名</th>
                          <th>固定工资</th>
                          <th>绩效工资</th>
                          <th>入职时间</th>
                          <th>状态</th>
                          <th>错误信息</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 10).map((item) => (
                          <tr key={item.row} style={{ color: item.error ? 'var(--color-danger)' : 'inherit' }}>
                            <td>{item.row}</td>
                            <td>{item.data.employee_no}</td>
                            <td>{item.data.name}</td>
                            <td>{item.data.fixed_salary}</td>
                            <td>{item.data.performance_salary}</td>
                            <td>{item.data.entry_date}</td>
                            <td>{item.data.status === 'active' ? '在职' : '离职'}</td>
                            <td>{item.error || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedData.length > 10 && (
                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      ... 共 {parsedData.length} 条记录
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            /* 导入结果 */
            <div className="text-center py-8">
              {result.success > 0 ? (
                <div style={{ color: 'var(--color-success)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <p className="text-lg font-semibold">成功导入 {result.success} 条记录</p>
                </div>
              ) : (
                <div style={{ color: 'var(--color-danger)' }}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <p className="text-lg font-semibold">导入失败</p>
                </div>
              )}
              {result.failed > 0 && (
                <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  失败: {result.failed} 条
                </p>
              )}
              {result.messages.length > 0 && (
                <div style={{ marginTop: '16px', textAlign: 'left', maxHeight: '150px', overflowY: 'auto' }}>
                  {result.messages.slice(0, 5).map((msg, i) => (
                    <p key={i} style={{ color: 'var(--color-danger)', fontSize: '12px' }}>{msg}</p>
                  ))}
                  {result.messages.length > 5 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>...还有 {result.messages.length - 5} 条</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={generateTemplate} className="btn btn-secondary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            下载模板
          </button>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} className="btn btn-secondary">
            {result ? '关闭' : '取消'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={loading || validCount === 0}
              className="btn btn-primary"
            >
              {loading ? '导入中...' : `导入 ${validCount} 条`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 导出组件**

修改 `src/components/index.ts`，添加导出：

```typescript
export { EmployeeImportModal } from './EmployeeImportModal'
```

- [ ] **Step 3: 验证 TypeScript 编译**

Run: `npm run build`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add src/components/EmployeeImportModal.tsx src/components/index.ts
git commit -m "feat: add EmployeeImportModal component"
```

---

## Chunk 4: 前端 - 集成到EmployeePage

### Task 8: 在EmployeePage中添加导入按钮

**Files:**
- Modify: `src/pages/EmployeePage.tsx`

- [ ] **Step 1: 修改 EmployeePage 添加导入功能**

修改 `src/pages/EmployeePage.tsx`：

1. 导入组件：
```typescript
import { EmployeeList, EmployeeForm, EmployeeImportModal } from '../components'
```

2. 添加状态：
```typescript
const [showImport, setShowImport] = useState(false)
```

3. 在按钮区域添加导入按钮（在"添加员工"按钮前面）：
```tsx
<button
  onClick={() => setShowImport(true)}
  className="btn btn-secondary"
>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
  批量导入
</button>
<button onClick={() => setShowModal(true)} className="btn btn-primary">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
  添加员工
</button>
```

4. 添加导入弹窗（在页面末尾）：
```tsx
{showImport && (
  <EmployeeImportModal
    onClose={() => setShowImport(false)}
    onSuccess={() => {
      setShowImport(false)
      loadEmployees()
    }}
  />
)}
```

- [ ] **Step 2: 验证 TypeScript 编译**

Run: `npm run build`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add src/pages/EmployeePage.tsx
git commit -m "feat: integrate import button to EmployeePage"
```

---

## Chunk 5: 后端 - Rust批量导入命令

### Task 9: 添加 batch_import_employees Rust 命令

**Files:**
- Modify: `src-tauri/src/commands.rs`

- [ ] **Step 1: 添加 EmployeeImport 和 BatchImportResult 结构体**

在 `src-tauri/src/commands.rs` 开头添加（在 Employee 结构体后面）：

```rust
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
```

- [ ] **Step 2: 添加 batch_import_employees 命令**

在 `src-tauri/src/commands.rs` 末尾添加：

```rust
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
```

- [ ] **Step 3: 验证 Rust 编译**

Run: `cd src-tauri && cargo build`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add src-tauri/src/commands.rs
git commit -m "feat: add batch_import_employees command"
```

---

## Chunk 6: 集成测试

### Task 10: 构建验证

- [ ] **Step 1: 完整构建**

Run: `npm run tauri build`
Expected: 构建成功，生成 .app 和 .dmg 文件

- [ ] **Step 2: Commit**

```bash
git add .
git commit - "feat: complete employee Excel import feature"
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-13-employee-excel-import.md`. Ready to execute?**
