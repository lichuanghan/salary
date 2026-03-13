import { invoke } from '@tauri-apps/api/core'
import type { Employee, Attendance, SalaryResult } from '../types'

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

export async function calculateSalary(employeeId: number, yearMonth: string): Promise<SalaryResult> {
  return invoke<SalaryResult>('calculate_salary', { employeeId, yearMonth })
}

export async function saveAttendance(attendance: Attendance): Promise<void> {
  return invoke('save_attendance', { attendance })
}
