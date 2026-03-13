export interface Employee {
  id?: number
  employee_no?: string
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

export interface Attendance {
  id?: number
  employee_id: number
  year_month: string
  work_days: number
  normal_days: number
  sick_leave_days: number
  // 新增字段
  late_count: number
  early_leave_count: number
  overtime_hours: number
}

export interface DeductionRule {
  late_deduction_per_time: number
  late_threshold: number
  early_leave_deduction_per_time: number
  overtime_rate: number
}

export interface SalaryResult {
  employee_id: number
  employee_name: string
  year_month: string
  // 工资明细
  fixed_salary: number
  performance_salary: number
  // 考勤扣款/补贴
  late_deduction: number
  early_leave_deduction: number
  overtime_allowance: number
  attendance_deduction: number
  // 最终
  gross_salary: number
  net_salary: number
}

export interface SalaryHistory {
  id?: number
  employee_id: number
  year_month: string
  salary_result: SalaryResult
  created_at?: string
}

export type PageId =
  | 'dashboard'
  | 'employee'
  | 'salary'
  | 'insurance'
  | 'attendance'
  | 'tax'
  | 'report'
  | 'settings'
