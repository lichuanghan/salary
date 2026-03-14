# 薪酬管理系统

HR薪酬管理系统 - 本地桌面端应用

## 功能模块

- **仪表盘**: 数据概览统计
- **员工管理**: 员工信息维护、批量导入导出
- **考勤管理**: 月度考勤记录、批量导入导出
- **工资核算**: 单员工/批量工资计算、导出工资单
- **个税计算**: 个税计算器
- **社保计算**: 社保公积金计算
- **报表**: 数据报表
- **设置**: 系统设置

## 技术栈

- 前端: React 19 + TypeScript + Tailwind CSS 4 + Vite 8
- 后端: Rust (Tauri 2.x)
- 数据库: SQLite
- Excel: xlsx

## 开发

```bash
npm run dev          # 前端开发
npm run tauri dev    # Tauri 开发
npm run tauri build  # 生产构建
```

## 构建 Windows 版本

```bash
npm run tauri build -- --target x86_64-pc-windows-gnu
```
