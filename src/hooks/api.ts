import { invoke } from '@tauri-apps/api/core'
import type { Employee, Attendance, SalaryResult } from '../types'

// Re-export types for useExcel
export type { Attendance }

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

export interface AttendanceImport {
  employee_no: string
  name: string
  year_month: string
  work_days: number
  normal_days: number
  sick_leave_days: number
  late_count: number
  early_leave_count: number
  overtime_hours: number
}

export interface BatchImportResult {
  total: number
  success: number
  failed: number
  messages: string[]
}

export async function getEmployees(): Promise<Employee[]> {
  return invoke<Employee[]>('get_employees')
}

export async function addEmployee(employee: Employee): Promise<number> {
  return invoke<number>('add_employee', { employee })
}

export async function updateEmployee(employee: Employee): Promise<void> {
  return invoke('update_employee', { employee })
}

export async function deleteEmployee(id: number): Promise<void> {
  return invoke('delete_employee', { id })
}

export async function searchEmployees(keyword: string): Promise<Employee[]> {
  return invoke<Employee[]>('search_employees', { keyword })
}

export async function calculateSalary(employeeId: number, yearMonth: string): Promise<SalaryResult> {
  return invoke<SalaryResult>('calculate_salary', { employeeId, yearMonth })
}

export async function saveAttendance(attendance: Attendance): Promise<void> {
  return invoke('save_attendance', { attendance })
}

export async function getAttendances(yearMonth: string): Promise<Attendance[]> {
  return invoke<Attendance[]>('get_attendances', { yearMonth })
}

export async function batchImportEmployees(employees: EmployeeImport[]): Promise<BatchImportResult> {
  return invoke<BatchImportResult>('batch_import_employees', { employees })
}

export async function batchImportAttendances(attendances: AttendanceImport[]): Promise<BatchImportResult> {
  return invoke<BatchImportResult>('batch_import_attendances', { attendances })
}

export async function batchCalculateSalary(employeeIds: number[], yearMonth: string): Promise<SalaryResult[]> {
  return invoke<SalaryResult[]>('batch_calculate_salary', { employeeIds, yearMonth })
}

export async function deleteAttendance(id: number): Promise<void> {
  return invoke('delete_attendance', { id })
}
