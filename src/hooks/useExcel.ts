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

export function generateTemplate(): void {
  const headers = ['员工编号', '姓名', '固定工资', '绩效工资', '入职时间', '状态', '身份证号', '城市', '部门', '职位']
  const example = ['EMP001', '张三', '5000', '2000', '2024-01-15', '在职', '110101199001011234', '北京', '技术部', '工程师']
  const ws = XLSX.utils.aoa_to_sheet([headers, example])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '员工导入模板')
  XLSX.writeFile(wb, '员工导入模板.xlsx')
}
