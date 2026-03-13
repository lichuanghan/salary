import { useState } from 'react'
import type { Employee, SalaryResult, Attendance } from '../types'

interface SalaryCalculatorProps {
  employees: Employee[]
  selectedEmployee: Employee | null
  yearMonth: string
  salaryResult: SalaryResult | null
  onSelectEmployee: (employee: Employee | null) => void
  onYearMonthChange: (yearMonth: string) => void
  onOpenAttendance: () => void
  onCalculate: () => void
}

export function SalaryCalculator({
  employees,
  selectedEmployee,
  yearMonth,
  salaryResult,
  onSelectEmployee,
  onYearMonthChange,
  onOpenAttendance,
  onCalculate
}: SalaryCalculatorProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">工资核算</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          选择年月
        </label>
        <input
          type="month"
          value={yearMonth}
          onChange={(e) => onYearMonthChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          选择员工
        </label>
        <select
          value={selectedEmployee?.id || ''}
          onChange={(e) => {
            const emp = employees.find((em) => em.id === Number(e.target.value))
            onSelectEmployee(emp || null)
          }}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">请选择员工</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={onOpenAttendance}
          disabled={!selectedEmployee}
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          录入考勤
        </button>
        <button
          onClick={onCalculate}
          disabled={!selectedEmployee}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          计算工资
        </button>
      </div>

      {salaryResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3">{salaryResult.employee_name} - {yearMonth} 月工资</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>固定薪酬：</span>
              <span>¥{salaryResult.fixed_salary.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>绩效薪酬：</span>
              <span>¥{salaryResult.performance_salary.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>考勤扣减：</span>
              <span>- ¥{salaryResult.attendance_deduction.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>本月工资：</span>
              <span className="text-green-600">¥{salaryResult.monthly_salary.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
