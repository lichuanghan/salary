# 员工Excel批量导入功能设计

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现员工信息的Excel批量导入功能，支持通过上传Excel文件批量添加或更新员工数据

**Architecture:** 前端使用xlsx库解析Excel文件，后端使用Rust处理批量数据，使用员工编号作为唯一标识匹配现有数据

**Tech Stack:** React 19 + TypeScript + xlsx + Tauri 2.x + Rust + SQLite

---

## 0. 前置条件：数据库 Schema 变更

由于现有数据库缺少 `employee_no` 字段，需要先进行以下修改：

### 0.1 数据库表变更

```sql
-- 添加 employee_no 字段（如果不存在）
ALTER TABLE employees ADD COLUMN employee_no TEXT UNIQUE;
```

### 0.2 TypeScript 类型变更

修改 `src/types/index.ts`：

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

### 0.3 Rust 结构体变更

修改 `src-tauri/src/commands.rs` 中的 Employee 结构体，添加 `employee_no` 字段。

---

## 1. 功能概述

员工Excel批量导入功能，允许用户通过上传Excel文件批量添加或更新员工信息。使用员工编号作为唯一标识，匹配现有数据（存在则更新，不存在则新增）。

## 2. 数据字段

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| employee_no | string | 是 | 员工编号（唯一标识） |
| name | string | 是 | 姓名 |
| fixed_salary | number | 是 | 固定工资 |
| performance_salary | number | 是 | 绩效工资 |
| entry_date | string | 是 | 入职时间 |
| status | string | 是 | 状态（在职/离职） |
| id_card | string | 否 | 身份证号 |
| city | string | 否 | 城市 |
| department | string | 否 | 部门 |
| position | string | 否 | 职位 |

## 3. UI设计

### 3.1 导入入口

- 在员工列表页面顶部添加"批量导入"按钮（位于"添加员工"按钮右侧）
- 按钮样式：次要按钮风格

### 3.2 导入对话框

- 弹窗标题："批量导入员工"
- 文件上传区域：
  - 支持点击选择文件
  - 支持拖拽上传
  - 显示已选文件名
  - 支持 .xlsx 和 .xls 格式
- 预览表格：
  - 列：序号、员工编号、姓名、固定工资、绩效工资、入职时间、状态、部门、职位
  - 最多显示前10条预览数据
  - 显示"共 X 条记录"
- 底部操作：
  - 取消按钮
  - 确认导入按钮
- 下载模板链接：点击下载标准Excel模板

### 3.3 导入结果

- 成功提示：绿色成功样式，显示"成功导入 X 条记录"
- 失败提示：红色错误样式，显示失败原因（如：必填字段缺失、员工编号重复等）
- 导入完成后自动刷新列表

## 4. 数据处理逻辑

1. 前端解析Excel文件
2. 前端校验必填字段（员工编号、姓名、固定工资、绩效工资、入职时间、状态）
3. 前端限制单次最多导入 **500 条**记录，超出提示分批导入
4. 构建批量数据发送到后端
5. 后端使用 **SQLite 事务** 保证数据一致性：
   - 开启事务 (BEGIN)
   - 逐条处理：按员工编号查询，存在则更新，不存在则新增
   - 提交事务 (COMMIT)，失败则回滚 (ROLLBACK)
6. 返回导入结果（成功数、失败数、失败记录详情）

## 5. 前端API设计

```typescript
// src/hooks/api.ts
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

export async function batchImportEmployees(employees: EmployeeImport[]): Promise<BatchImportResult> {
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke<BatchImportResult>('batch_import_employees', { employees })
}
```

## 6. 后端API设计

### 6.1 Rust命令

```rust
#[tauri::command]
pub fn batch_import_employees(employees: Vec<EmployeeImport>) -> Result<BatchImportResult, String>
```

### 6.2 数据结构

```rust
struct EmployeeImport {
    employee_no: String,      // 员工编号（唯一标识）
    name: String,            // 姓名
    fixed_salary: f64,       // 固定工资
    performance_salary: f64, // 绩效工资
    entry_date: String,      // 入职时间
    status: String,          // 状态
    id_card: Option<String>,  // 身份证号
    city: Option<String>,    // 城市
    department: Option<String>, // 部门
    position: Option<String>,  // 职位
}

struct BatchImportResult {
    total: i32,              // 总数
    success: i32,            // 成功数
    failed: i32,             // 失败数
    messages: Vec<String>,   // 错误信息列表
}
```

### 6.3 SQL逻辑

```sql
-- 查找已存在的员工
SELECT id FROM employees WHERE employee_no = ?;

-- 存在则更新
UPDATE employees SET name=?, fixed_salary=?, ... WHERE employee_no = ?;

-- 不存在则插入
INSERT INTO employees (employee_no, name, fixed_salary, ...) VALUES (?, ?, ?, ...);
```

## 7. Excel模板

### 6.1 模板字段顺序

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| 员工编号 | 姓名 | 固定工资 | 绩效工资 | 入职时间 | 状态 | 身份证号 | 城市 | 部门 | 职位 |

### 6.2 状态字段值

- 在职：1、"在职" 或 "active"
- 离职：0、"离职" 或 "inactive"

后端统一转换为数据库存储值：`active` 或 `inactive`

### 6.3 日期格式

- 支持格式：YYYY-MM-DD（如：2024-01-15）
- 支持格式：YYYY/MM/DD（如：2024/01/15）

## 8. 错误处理

| 错误类型 | 提示信息 |
|----------|----------|
| 必填字段为空 | "第X行：员工编号/姓名/固定工资/绩效工资/入职时间/状态 为必填项" |
| 员工编号重复 | "第X行：员工编号重复" |
| 日期格式错误 | "第X行：入职时间格式错误，请使用YYYY-MM-DD格式" |
| 状态值错误 | "第X行：状态只能是'在职'或'离职'" |

## 9. 技术实现

### 8.1 前端依赖

- 安装 xlsx 库：`npm install xlsx`

### 8.2 文件结构

- 修改：`src/types/index.ts` - 添加 employee_no 字段
- 修改：`src/pages/EmployeePage.tsx` - 添加导入按钮和状态管理
- 新增：`src/components/EmployeeImportModal.tsx` - 导入弹窗组件
- 新增：`src/hooks/useExcel.ts` - Excel解析工具函数
- 修改：`src/components/index.ts` - 导出新组件
- 修改：`src/hooks/api.ts` - 添加 batchImportEmployees API
- 修改：`src-tauri/src/commands.rs` - 添加 batch_import_employees 命令和 Employee 结构体
- 修改：`src-tauri/src/db.rs` - 添加 employee_no 字段（如果不存在）
- 修改：`src-tauri/src/lib.rs` - 注册新命令

---

## 10. 验收标准

- [ ] 点击"批量导入"按钮弹出导入对话框
- [ ] 支持选择Excel文件上传
- [ ] 支持拖拽上传
- [ ] 显示预览表格（最多10条）
- [ ] 支持下载Excel模板
- [ ] 点击导入后成功添加/更新员工
- [ ] 显示导入结果（成功数、失败数）
- [ ] 导入完成后自动刷新列表
- [ ] 错误数据有明确的错误提示
