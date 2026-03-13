# 侧边栏导航与多模块页面实现计划

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为薪酬管理系统添加侧边栏导航和8个功能模块页面，实现完整的模块化界面结构

**Architecture:** 采用侧边栏 + 主内容区的经典管理后台布局，通过React状态管理切换页面，支持折叠展开

**Tech Stack:** React 19 + TypeScript + Tailwind CSS 4 + Tauri 2.x

---

## 文件结构

```
src/
├── components/
│   ├── Layout.tsx          # 修改：集成侧边栏
│   ├── Sidebar.tsx         # 新增：侧边栏组件
│   ├── PageContainer.tsx   # 新增：页面容器
│   └── ...
├── pages/
│   ├── index.ts            # 修改：导出所有页面
│   ├── DashboardPage.tsx   # 新增：仪表盘
│   ├── EmployeePage.tsx    # 新增：员工管理（整合现有）
│   ├── SalaryPage.tsx      # 新增：工资核算（整合现有）
│   ├── InsurancePage.tsx   # 新增：社保公积金
│   ├── AttendancePage.tsx  # 新增：考勤管理
│   ├── TaxPage.tsx         # 新增：个税管理
│   ├── ReportPage.tsx      # 新增：报表统计
│   └── SettingsPage.tsx    # 新增：系统设置
├── hooks/
│   └── useNavigation.ts    # 新增：导航状态hook
└── types/
    └── index.ts            # 修改：添加页面类型
```

---

## Chunk 1: 基础导航架构

### Task 1: 创建侧边栏组件

**Files:**
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: 创建侧边栏组件代码**

```tsx
import { useState } from 'react'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
  collapsed: boolean
  onToggle: () => void
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: '仪表盘', icon: <svg>...</svg> },
  { id: 'employee', label: '员工管理', icon: <svg>...</svg> },
  { id: 'salary', label: '工资核算', icon: <svg>...</svg> },
  { id: 'insurance', label: '社保公积金', icon: <svg>...</svg> },
  { id: 'attendance', label: '考勤管理', icon: <svg>...</svg> },
  { id: 'tax', label: '个税管理', icon: <svg>...</svg> },
  { id: 'report', label: '报表统计', icon: <svg>...</svg> },
  { id: 'settings', label: '系统设置', icon: <svg>...</svg> },
]

export function Sidebar({ activePage, onNavigate, collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* 折叠按钮 */}
      <button onClick={onToggle} className="toggle-btn">
        {collapsed ? '→' : '←'}
      </button>

      {/* 菜单列表 */}
      <nav className="menu">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`menu-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && <span className="label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: 添加侧边栏CSS样式到 index.css**

```css
/* 侧边栏 */
.sidebar {
  width: 240px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border-light);
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
}

.sidebar.collapsed {
  width: 72px;
}

.menu {
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  text-align: left;
}

.menu-item:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.menu-item.active {
  background: var(--color-accent-light);
  color: var(--color-accent);
  font-weight: 500;
}

.toggle-btn {
  position: absolute;
  right: -14px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx src/index.css
git commit -m "feat: add sidebar navigation component"
```

---

### Task 2: 创建页面类型和导航Hook

**Files:**
- Create: `src/hooks/useNavigation.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: 添加页面类型定义**

```typescript
// src/types/index.ts 添加
export type PageId =
  | 'dashboard'
  | 'employee'
  | 'salary'
  | 'insurance'
  | 'attendance'
  | 'tax'
  | 'report'
  | 'settings'
```

- [ ] **Step 2: 创建导航Hook**

```typescript
// src/hooks/useNavigation.ts
import { useState } from 'react'
import type { PageId } from '../types'

export function useNavigation() {
  const [activePage, setActivePage] = useState<PageId>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return {
    activePage,
    setActivePage,
    sidebarCollapsed,
    toggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts src/hooks/useNavigation.ts
git commit -m "feat: add page types and navigation hook"
```

---

### Task 3: 创建页面容器组件

**Files:**
- Create: `src/components/PageContainer.tsx`

- [ ] **Step 1: 创建PageContainer组件**

```tsx
interface PageContainerProps {
  children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="page-container">
      {children}
    </div>
  )
}
```

- [ ] **Step 2: 添加CSS样式**

```css
.page-container {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PageContainer.tsx src/index.css
git commit -m "feat: add page container component"
```

---

## Chunk 2: 页面组件

### Task 4: 创建仪表盘页面

**Files:**
- Create: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: 创建DashboardPage组件**

```tsx
export function DashboardPage() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 className="text-lg font-semibold mb-6">仪表盘</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 统计卡片 */}
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-value">0</span>
            <span className="stat-label">员工总数</span>
          </div>
        </div>
        {/* 更多统计卡片... */}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: add dashboard page"
```

---

### Task 5: 创建员工管理页面（整合现有）

**Files:**
- Create: `src/pages/EmployeePage.tsx`
- Delete: 移除 HomePage.tsx 中的员工列表相关内容

- [ ] **Step 1: 创建EmployeePage组件**

```tsx
import { EmployeeList, EmployeeForm } from '../components'
import { useState } from 'react'
import type { Employee } from '../types'

export function EmployeePage() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="card" style={{ padding: '24px' }}>
      <EmployeeList onAdd={() => setShowModal(true)} />
      {showModal && (
        <EmployeeForm onSubmit={() => setShowModal(false)} onCancel={() => setShowModal(false)} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/EmployeePage.tsx
git commit -m "feat: add employee management page"
```

---

### Task 6: 创建工资核算页面（整合现有）

**Files:**
- Create: `src/pages/SalaryPage.tsx`

- [ ] **Step 1: 创建SalaryPage组件**

```tsx
import { SalaryCalculator } from '../components'
import { useState } from 'react'
import type { Employee, SalaryResult } from '../types'

export function SalaryPage() {
  // 整合现有的工资计算逻辑
  return (
    <div className="card" style={{ padding: '24px' }}>
      <SalaryCalculator />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/SalaryPage.tsx
git commit -m "feat: add salary calculation page"
```

---

### Task 7: 创建社保公积金页面

**Files:**
- Create: `src/pages/InsurancePage.tsx`

- [ ] **Step 1: 创建InsurancePage组件**

```tsx
export function InsurancePage() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 className="text-lg font-semibold mb-6">社保公积金</h2>
      <div className="empty-state">
        <p>暂未配置社保公积金政策</p>
        <p className="text-sm mt-2">请在系统设置中配置城市社保政策</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/InsurancePage.tsx
git commit -m "feat: add insurance page placeholder"
```

---

### Task 8: 创建考勤管理页面

**Files:**
- Create: `src/pages/AttendancePage.tsx`

- [ ] **Step 1: 创建AttendancePage组件**

```tsx
export function AttendancePage() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 className="text-lg font-semibold mb-6">考勤管理</h2>
      <div className="empty-state">
        <p>考勤管理功能</p>
        <p className="text-sm mt-2">支持迟到、早退、加班等考勤记录</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/AttendancePage.tsx
git commit -m "feat: add attendance page placeholder"
```

---

### Task 9: 创建个税管理页面

**Files:**
- Create: `src/pages/TaxPage.tsx`

- [ ] **Step 1: 创建TaxPage组件**

```tsx
export function TaxPage() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 className="text-lg font-semibold mb-6">个税管理</h2>
      <div className="empty-state">
        <p>个税管理功能</p>
        <p className="text-sm mt-2">配置个税专项扣除，计算个人所得税</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/TaxPage.tsx
git commit -m "feat: add tax page placeholder"
```

---

### Task 10: 创建报表统计页面

**Files:**
- Create: `src/pages/ReportPage.tsx`

- [ ] **Step 1: 创建ReportPage组件**

```tsx
export function ReportPage() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 className="text-lg font-semibold mb-6">报表统计</h2>
      <div className="empty-state">
        <p>报表统计功能</p>
        <p className="text-sm mt-2">部门成本分析、月度工资汇总</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/ReportPage.tsx
git commit -m "feat: add report page placeholder"
```

---

### Task 11: 创建系统设置页面

**Files:**
- Create: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: 创建SettingsPage组件**

```tsx
export function SettingsPage() {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <h2 className="text-lg font-semibold mb-6">系统设置</h2>
      <div className="empty-state">
        <p>系统设置功能</p>
        <p className="text-sm mt-2">基本配置、数据管理</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: add settings page placeholder"
```

---

## Chunk 3: 集成与主应用

### Task 12: 更新页面导出和App集成

**Files:**
- Modify: `src/pages/index.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: 更新页面导出**

```typescript
export { DashboardPage } from './DashboardPage'
export { EmployeePage } from './EmployeePage'
export { SalaryPage } from './SalaryPage'
export { InsurancePage } from './InsurancePage'
export { AttendancePage } from './AttendancePage'
export { TaxPage } from './TaxPage'
export { ReportPage } from './ReportPage'
export { SettingsPage } from './SettingsPage'
```

- [ ] **Step 2: 更新App.tsx集成**

```tsx
import { useState, useEffect } from 'react'
import { Layout, Sidebar, PageContainer } from './components'
import {
  DashboardPage,
  EmployeePage,
  SalaryPage,
  InsurancePage,
  AttendancePage,
  TaxPage,
  ReportPage,
  SettingsPage
} from './pages'
import { useNavigation } from './hooks/useNavigation'
import type { PageId } from './types'

function App() {
  const { activePage, setActivePage, sidebarCollapsed, toggleSidebar } = useNavigation()

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'employee': return <EmployeePage />
      case 'salary': return <SalaryPage />
      case 'insurance': return <InsurancePage />
      case 'attendance': return <AttendancePage />
      case 'tax': return <TaxPage />
      case 'report': return <ReportPage />
      case 'settings': return <SettingsPage />
      default: return <DashboardPage />
    }
  }

  return (
    <Layout>
      <div className="app-layout">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          collapsed={sidebarCollapsed}
          onToggle={toggleSidebar}
        />
        <PageContainer>
          {renderPage()}
        </PageContainer>
      </div>
    </Layout>
  )
}

export default App
```

- [ ] **Step 3: 更新Layout组件**

```tsx
interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-layout-wrapper">
      <header className="app-header">
        {/* 简化的顶部栏 */}
      </header>
      <main className="app-main">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.ts src/App.tsx src/components/Layout.tsx src/components/index.ts
git commit -m "feat: integrate sidebar navigation with all pages"
```

---

## 验收标准

- [ ] 侧边栏正常显示8个菜单项
- [ ] 点击菜单可切换对应页面
- [ ] 侧边栏可折叠/展开
- [ ] 所有页面正确渲染
- [ ] UI样式与现有设计一致
- [ ] 构建通过

---

**Plan complete and saved to `docs/superpowers/plans/2026-03-13-sidebar-navigation.md`. Ready to execute?**
