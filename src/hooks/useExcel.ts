import * as XLSX from 'xlsx'
import { save } from '@tauri-apps/plugin-dialog'
import { writeFile } from '@tauri-apps/plugin-fs'
import type { EmployeeImport, Attendance } from './api'

export interface ParsedEmployee {
  row: number
  data: EmployeeImport
  error?: string
}

export interface ParsedAttendance {
  row: number
  data: Attendance
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

        if (jsonData.length < 2) {
          resolve([])
          return
        }

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

export async function generateTemplate(): Promise<void> {
  const headers = ['员工编号', '姓名', '固定工资', '绩效工资', '入职时间', '状态', '身份证号', '城市', '部门', '职位']
  const example = ['EMP001', '张三', '5000', '2000', '2024-01-15', '在职', '110101199001011234', '北京', '技术部', '工程师']
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '员工导入模板')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  // Use Tauri dialog to save file
  const filePath = await save({
    defaultPath: '员工导入模板.xlsx',
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })

  if (filePath) {
    await writeFile(filePath, new Uint8Array(wbout))
  }
}

export function parseAttendanceExcelFile(file: File): Promise<ParsedAttendance[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][]

        if (jsonData.length < 2) {
          resolve([])
          return
        }

        // 第一行是表头
        const headers = jsonData[0].map((h: any) => String(h).trim())
        const employeeNoIndex = headers.findIndex((h: string) => h.includes('编号'))
        const nameIndex = headers.findIndex((h: string) => h.includes('姓名'))
        const yearMonthIndex = headers.findIndex((h: string) => h.includes('月份'))
        const workDaysIndex = headers.findIndex((h: string) => h.includes('应出勤'))
        const normalDaysIndex = headers.findIndex((h: string) => h.includes('实际出勤'))
        const sickLeaveDaysIndex = headers.findIndex((h: string) => h.includes('事假'))
        const lateCountIndex = headers.findIndex((h: string) => h.includes('迟到'))
        const earlyLeaveCountIndex = headers.findIndex((h: string) => h.includes('早退'))
        const overtimeHoursIndex = headers.findIndex((h: string) => h.includes('加班'))

        const results: ParsedAttendance[] = []

        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i]
          if (!row || row.length === 0) continue

          const employeeNo = employeeNoIndex >= 0 ? String(row[employeeNoIndex] || '').trim() : ''
          const name = nameIndex >= 0 ? String(row[nameIndex] || '').trim() : ''
          const yearMonth = yearMonthIndex >= 0 ? String(row[yearMonthIndex] || '').trim() : ''
          const workDays = workDaysIndex >= 0 ? parseFloat(String(row[workDaysIndex] || '0')) : 0
          const normalDays = normalDaysIndex >= 0 ? parseFloat(String(row[normalDaysIndex] || '0')) : 0
          const sickLeaveDays = sickLeaveDaysIndex >= 0 ? parseFloat(String(row[sickLeaveDaysIndex] || '0')) : 0
          const lateCount = lateCountIndex >= 0 ? parseInt(String(row[lateCountIndex] || '0')) : 0
          const earlyLeaveCount = earlyLeaveCountIndex >= 0 ? parseInt(String(row[earlyLeaveCountIndex] || '0')) : 0
          const overtimeHours = overtimeHoursIndex >= 0 ? parseFloat(String(row[overtimeHoursIndex] || '0')) : 0

          // 必填字段校验
          const errors: string[] = []
          if (!employeeNo && !name) errors.push('员工编号或姓名')
          if (!yearMonth) errors.push('考勤月份')

          results.push({
            row: i + 1,
            data: {
              employee_id: 0, // 需要通过员工编号或姓名查询
              employee_no: employeeNo,
              name: name,
              year_month: yearMonth,
              work_days: isNaN(workDays) ? 0 : workDays,
              normal_days: isNaN(normalDays) ? 0 : normalDays,
              sick_leave_days: isNaN(sickLeaveDays) ? 0 : sickLeaveDays,
              late_count: isNaN(lateCount) ? 0 : lateCount,
              early_leave_count: isNaN(earlyLeaveCount) ? 0 : earlyLeaveCount,
              overtime_hours: isNaN(overtimeHours) ? 0 : overtimeHours,
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

export async function generateAttendanceTemplate(): Promise<void> {
  const headers = ['员工编号', '姓名', '考勤月份', '应出勤天数', '实际出勤天数', '事假天数', '迟到次数', '早退次数', '加班小时数']
  const example = ['EMP001', '张三', '2026-03', '23', '21', '0', '0', '0', '0']
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '考勤导入模板')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  // Use Tauri dialog to save file
  const filePath = await save({
    defaultPath: '考勤导入模板.xlsx',
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })

  if (filePath) {
    await writeFile(filePath, new Uint8Array(wbout))
  }
}

// 导出员工数据
export async function exportEmployees(employees: any[]): Promise<void> {
  const data = employees.map(emp => ({
    '员工编号': emp.employee_no || '',
    '姓名': emp.name || '',
    '身份证号': emp.id_card || '',
    '城市': emp.city || '',
    '部门': emp.department || '',
    '职位': emp.position || '',
    '入职时间': emp.entry_date || '',
    '固定工资': emp.fixed_salary || 0,
    '绩效工资': emp.performance_salary || 0,
    '状态': emp.status === 'active' ? '在职' : '离职'
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '员工数据')

  // 设置列宽
  ws['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 10 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 8 }
  ]

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const exportFilePath = await save({
    defaultPath: `员工数据_${new Date().toISOString().slice(0, 10)}.xlsx`,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })

  if (exportFilePath) {
    await writeFile(exportFilePath, new Uint8Array(wbout))
  }
}

// 导出考勤数据
export async function exportAttendances(attendances: any[], employees: any[], yearMonth: string): Promise<void> {
  const data = attendances.map(att => {
    const emp = employees.find(e => e.id === att.employee_id)
    return {
      '员工编号': emp?.employee_no || '',
      '姓名': emp?.name || '',
      '考勤月份': att.year_month || '',
      '应出勤天数': att.work_days || 0,
      '实际出勤天数': att.normal_days || 0,
      '事假天数': att.sick_leave_days || 0,
      '迟到次数': att.late_count || 0,
      '早退次数': att.early_leave_count || 0,
      '加班小时数': att.overtime_hours || 0
    }
  })

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '考勤数据')

  ws['!cols'] = [
    { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }
  ]

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const exportFilePath = await save({
    defaultPath: `考勤数据_${yearMonth}.xlsx`,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })

  if (exportFilePath) {
    await writeFile(exportFilePath, new Uint8Array(wbout))
  }
}

// 导出工资数据
export async function exportSalaries(salaryList: any[], yearMonth: string): Promise<void> {
  const data = salaryList.map(item => ({
    '员工姓名': item.employee_name || '',
    '考勤月份': item.year_month || yearMonth,
    '固定薪酬': item.fixed_salary || 0,
    '绩效薪酬': item.performance_salary || 0,
    '考勤扣款': item.attendance_deduction || 0,
    '实发工资': item.net_salary || 0
  }))

  // 添加合计行
  const totalFixed = salaryList.reduce((sum, item) => sum + (item.fixed_salary || 0), 0)
  const totalPerformance = salaryList.reduce((sum, item) => sum + (item.performance_salary || 0), 0)
  const totalDeduction = salaryList.reduce((sum, item) => sum + (item.attendance_deduction || 0), 0)
  const totalNet = salaryList.reduce((sum, item) => sum + (item.net_salary || 0), 0)

  data.push({
    '员工姓名': '合计',
    '考勤月份': '',
    '固定薪酬': totalFixed,
    '绩效薪酬': totalPerformance,
    '考勤扣款': totalDeduction,
    '实发工资': totalNet
  })

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '工资数据')

  ws['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 12 }, { wch: 12 }, { wch: 14 }
  ]

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })

  const exportFilePath = await save({
    defaultPath: `工资数据_${yearMonth}.xlsx`,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })

  if (exportFilePath) {
    await writeFile(exportFilePath, new Uint8Array(wbout))
  }
}
