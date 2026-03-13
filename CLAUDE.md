# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在本项目中工作提供指导。

## 项目概述

HR薪酬管理系统 - 本地桌面端应用，用于员工信息管理、工资核算、考勤扣款计算。

## 常用命令

```bash
# 前端开发
npm run dev          # 启动 Vite 开发服务器
npm run build        # 构建生产环境前端
npm run preview      # 预览生产环境构建

# Tauri 开发
npm run tauri dev   # 开发模式启动 Tauri
npm run tauri build # 构建生产环境可执行文件（macOS）

# 交叉编译 Windows x86_64
rustup target add x86_64-pc-windows-gnu  # 安装 Windows 目标
npm run tauri build -- --target x86_64-pc-windows-gnu

# 生成图标（需要先创建 1024x1024 的 app-icon.png）
npx tauri icon app-icon.png

# Rust 后端
cd src-tauri
cargo build         # 编译 Rust 后端
cargo run           # 直接运行 Rust 后端
```

## 技术架构

### 技术栈
- **前端**: React 19.x + TypeScript + Tailwind CSS 4.x + Vite 8.x
- **后端**: Rust (Tauri 2.x) + edition 2024
- **数据库**: SQLite (bundled rusqlite)

### 项目结构
```
salary/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   │   ├── Layout.tsx     # 布局组件
│   │   ├── EmployeeList.tsx
│   │   ├── EmployeeForm.tsx
│   │   ├── AttendanceForm.tsx
│   │   └── SalaryCalculator.tsx
│   ├── pages/              # 页面
│   │   └── HomePage.tsx
│   ├── hooks/              # API 调用
│   │   └── api.ts
│   ├── types/              # TypeScript 类型
│   │   └── index.ts
│   ├── App.tsx            # 主应用组件
│   ├── main.tsx           # React 入口
│   └── index.css          # Tailwind 全局样式
├── src-tauri/             # Rust 后端
│   ├── src/
│   │   ├── main.rs        # Tauri 应用入口
│   │   ├── db.rs          # SQLite 数据库操作
│   │   └── commands.rs    # Tauri IPC 命令
│   ├── capabilities/      # Tauri 2.x 权限配置
│   ├── Cargo.toml
│   └── tauri.conf.json
├── docs/superpowers/       # 实现规范和计划文档
├── package.json
└── vite.config.ts
```

### 数据流
1. React 前端通过 `@tauri-apps/api/core` 调用命令
2. `commands.rs` 中的 Tauri 命令处理 IPC 请求
3. `db.rs` 中的数据库操作管理 SQLite 连接
4. SQLite 文件存储在 `~/.salary-system/salary.db`

### Tauri 命令 (commands.rs)
- `get_employees` - 获取所有在职员工
- `add_employee` - 添加新员工
- `update_employee` - 更新员工信息
- `delete_employee` - 软删除（设置状态为 inactive）
- `calculate_salary` - 计算月薪（含考勤扣款）
- `save_attendance` - 保存/更新考勤记录

### 数据库表结构
- **employees**: id, name, id_card, city, department, position, entry_date, fixed_salary, performance_salary, status
- **attendance**: id, employee_id, year_month, work_days, normal_days, sick_leave_days

### 工资计算逻辑
```
月薪 = 固定工资 + 绩效工资 - 考勤扣款
考勤扣款 = 请假天数 × (固定工资 ÷ 21.75)
```

## 开发注意事项

- 数据库在首次启动时自动初始化，位于 Tauri 应用数据目录
- 窗口配置：默认 1200x800，最小 1024x768
- 使用 Tauri 2.x（请检查 package.json 和 Cargo.toml 版本匹配）
- Windows 交叉编译需要安装 `x86_64-pc-windows-gnu` 目标
- 图标生成：需要 1024x1024 的 PNG 源文件，使用 `npx tauri icon` 自动生成所有格式
