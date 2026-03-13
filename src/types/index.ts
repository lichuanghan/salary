export interface Employee {
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
  fixed_salary: number
  performance_salary: number
  attendance_deduction: number
  monthly_salary: number
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
