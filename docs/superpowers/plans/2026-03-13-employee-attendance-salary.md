# 员工管理、考勤管理、工资管理功能实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现员工管理完整功能、考勤管理完整功能、工资管理增强功能

**Architecture:**
- 前端：React + TypeScript + Tailwind CSS
- 后端：Rust Tauri + SQLite
- 数据流：页面组件 → API Hook → Tauri Commands → SQLite

**Tech Stack:** React 19 + TypeScript + Tailwind CSS 4 + Tauri 2.x + SQLite

---

## 当前状态

已有基础：
- ✅ 侧边栏导航（8个菜单）
- ✅ 员工管理基础页面（添加/删除员工）
- ✅ 工资核算基础（固定+绩效工资计算）
- ✅ 考勤录入基础表单

待实现：
- ❌ 员工详情编辑
- ❌ 员工搜索/筛选
- ❌ 完整考勤管理（迟到、早退、加班等）
- ❌ 考勤扣款规则配置
- ❌ 工资条生成与历史
- ❌ 工资明细展示

---

## Chunk 1: 员工管理增强

### Task 1: 添加员工编辑功能

**Files:**
- Modify: `src/components/EmployeeForm.tsx` - 支持编辑模式
- Modify: `src/pages/EmployeePage.tsx` - 添加编辑按钮

- [ ] **Step 1: 修改 EmployeeForm 支持编辑**

```tsx
interface EmployeeFormProps {
  initialData?: Employee
  onSubmit: (data: Employee) => void
  onCancel: () => void
}

// 添加编辑模式支持
// 修改表单标题显示"添加员工"或"编辑员工"
// 提交时区分新增和更新
```

- [ ] **Step 2: 修改 EmployeePage 添加编辑按钮**

```tsx
// 在员工列表添加编辑操作按钮
// 点击后打开编辑表单
```

- [ ] **Step 3: 添加 Rust 更新命令支持**

```rust
// src-tauri/src/commands.rs 已存在 update_employee
```

- [ ] **Step 4: Commit**

```bash
git add src/components/EmployeeForm.tsx src/pages/EmployeePage.tsx
git commit -m "feat: add employee edit functionality"
```

---

### Task 2: 员工搜索和筛选

**Files:**
- Modify: `src/pages/EmployeePage.tsx` - 添加搜索框
- Modify: `src/hooks/api.ts` - 添加搜索API

- [ ] **Step 1: 添加搜索输入框组件**

```tsx
// 在员工列表顶部添加搜索框
// 支持按姓名搜索
```

- [ ] **Step 2: 添加后端搜索命令**

```rust
// src-tauri/src/commands.rs
#[tauri::command]
pub fn search_employees(state: tauri::State<DbState>, keyword: String) -> Result<Vec<Employee>, String>
```

- [ ] **Step 3: 实现前端搜索逻辑**

```tsx
// 添加 debounce 搜索
// 实时筛选
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/EmployeePage.tsx src/hooks/api.ts
git commit -m "feat: add employee search functionality"
```

---

## Chunk 2: 考勤管理完整实现

### Task 3: 扩展考勤数据模型

**Files:**
- Modify: `src/types/index.ts` - 扩展 Attendance 类型
- Modify: `src-tauri/src/commands.rs` - 扩展 Attendance 结构

- [ ] **Step 1: 扩展 Attendance 类型**

```typescript
export interface Attendance {
  id?: number
  employee_id: number
  year_month: string
  // 现有字段
  work_days: number
  normal_days: number
  sick_leave_days: number
  // 新增字段
  late_count: number        // 迟到次数
  early_leave_count: number // 早退次数
  overtime_hours: number   // 加班小时数
  // 扣款相关
  late_deduction: number   // 迟到扣款
  early_deduction: number  // 早退扣款
  overtime_allowance: number // 加班费
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: extend attendance data model"
```

---

### Task 4: 创建考勤管理页面

**Files:**
- Modify: `src/pages/AttendancePage.tsx` - 实现完整考勤管理

- [ ] **Step 1: 设计考勤页面布局**

```tsx
// 页面结构：
// - 顶部：年月选择 + 员工选择
// - 中间：考勤记录列表（按员工）
// - 底部：考勤统计（出勤率、迟到率等）
```

- [ ] **Step 2: 实现考勤记录列表**

```tsx
// 显示每个员工的考勤记录
// 支持按月份筛选
```

- [ ] **Step 3: 添加考勤录入表单**

```tsx
// 整合现有的 AttendanceForm
// 添加迟到、早退、加班等字段
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/AttendancePage.tsx
git commit -m "feat: implement attendance management page"
```

---

### Task 5: 考勤扣款规则配置

**Files:**
- Modify: `src/types/index.ts` - 添加扣款规则类型
- Create: `src/components/AttendanceRules.tsx` - 扣款规则组件

- [ ] **Step 1: 定义扣款规则类型**

```typescript
export interface DeductionRule {
  late_deduction_per_time: number  // 每次迟到扣款
  late_threshold: number           // 迟到分钟数阈值
  early_leave_deduction_per_time: number
  overtime_rate: number            // 加班费每小时
}
```

- [ ] **Step 2: 创建扣款规则配置组件**

```tsx
// 可配置的扣款规则表单
// 保存到 localStorage 或后端
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/components/AttendanceRules.tsx
git commit -m "feat: add attendance deduction rules"
```

---

## Chunk 3: 工资管理增强

### Task 6: 扩展工资计算模型

**Files:**
- Modify: `src/types/index.ts` - 扩展 SalaryResult
- Modify: `src-tauri/src/commands.rs` - 扩展计算逻辑

- [ ] **Step 1: 扩展工资结果类型**

```typescript
export interface SalaryResult {
  employee_id: number
  employee_name: string
  year_month: string
  // 工资明细
  fixed_salary: number
  position_salary: number
  performance_salary: number
  allowances: number
  // 考勤扣款/补贴
  late_deduction: number
  early_leave_deduction: number
  overtime_allowance: number
  attendance_deduction: number
  // 社保公积金（待实现）
  social_insurance: number
  housing_fund: number
  // 个税（待实现）
  personal_tax: number
  // 最终
  gross_salary: number    // 应发工资
  net_salary: number      // 实发工资
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: extend salary calculation model"
```

---

### Task 7: 工资历史记录

**Files:**
- Modify: `src-tauri/src/commands.rs` - 添加保存工资记录命令
- Modify: `src/pages/SalaryPage.tsx` - 添加历史记录展示

- [ ] **Step 1: 创建工资历史表**

```rust
// salary_history 表
// 记录每月工资计算结果
```

- [ ] **Step 2: 添加保存工资命令**

```rust
#[tauri::command]
pub fn save_salary_record(state: tauri::State<DbState>, record: SalaryRecord) -> Result<i64, String>
```

- [ ] **Step 3: 添加查询历史命令**

```rust
#[tauri::command]
pub fn get_salary_history(state: tauri::State<DbState>, employee_id: i64) -> Result<Vec<SalaryRecord>, String>
```

- [ ] **Step 4: 修改 SalaryPage 添加历史记录**

```tsx
// 在工资计算页面添加历史记录标签
// 展示历史工资明细
```

- [ ] **Step 5: Commit**

```bash
git add src-tauri/src/commands.rs src/pages/SalaryPage.tsx
git commit -m "feat: add salary history records"
```

---

### Task 8: 工资条详情展示

**Files:**
- Create: `src/components/SalaryDetailModal.tsx` - 工资明细弹窗

- [ ] **Step 1: 创建工资明细组件**

```tsx
interface SalaryDetailProps {
  record: SalaryResult
  onClose: () => void
}

// 展示完整的工资明细
// 固定工资、岗位工资、绩效奖金
// 考勤扣款明细
// 社保公积金（预留）
// 个税（预留）
// 实发工资
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SalaryDetailModal.tsx
git commit -m "feat: add salary detail modal"
```

---

## Chunk 4: 数据整合

### Task 9: 整合考勤扣款到工资计算

**Files:**
- Modify: `src-tauri/src/commands.rs` - calculate_salary 函数
- Modify: `src/components/SalaryCalculator.tsx` - 展示完整明细

- [ ] **Step 1: 修改工资计算逻辑**

```rust
// 计算公式：
// 应发工资 = 固定工资 + 岗位工资 + 绩效奖金 + 补贴 + 加班费
// 考勤扣款 = 迟到扣款 + 早退扣款 + 事假扣款
// 实发工资 = 应发工资 - 考勤扣款 - 社保公积金 - 个税
```

- [ ] **Step 2: 更新前端展示**

```tsx
// 展示完整的工资明细
// 各项加减清晰明了
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/commands.rs src/components/SalaryCalculator.tsx
git commit -m "feat: integrate attendance deduction into salary calculation"
```

---

## 验收标准

- [ ] 员工管理：可添加、编辑、删除员工
- [ ] 员工管理：可搜索员工
- [ ] 考勤管理：可录入迟到、早退、加班等
- [ ] 考勤管理：可配置扣款规则
- [ ] 工资管理：计算包含考勤扣款
- [ ] 工资管理：可查看历史工资记录
- [ ] 工资管理：展示完整工资明细
- [ ] 构建通过

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-13-employee-attendance-salary.md`. Ready to execute?**
