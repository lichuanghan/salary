import { useState, useEffect } from 'react'
import { SalaryCalculator, AttendanceForm } from '../components'
import * as api from '../hooks/api'
import type { Employee, Attendance, SalaryResult } from '../types'

export function SalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [yearMonth, setYearMonth] = useState('2026-03')
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Attendance>({
    employee_id: 0,
    year_month: '2026-03',
    work_days: 23,
    normal_days: 21,
    sick_leave_days: 0,
    late_count: 0,
    early_leave_count: 0,
    overtime_hours: 0
  })

  useEffect(() => {
    loadEmployees()
  }, [])

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error('加载员工失败:', error)
    }
  }

  const openAttendanceModal = () => {
    if (!selectedEmployee) return
    setAttendanceData({
      employee_id: selectedEmployee.id || 0,
      year_month: yearMonth,
      work_days: 23,
      normal_days: 21,
      sick_leave_days: 0,
      late_count: 0,
      early_leave_count: 0,
      overtime_hours: 0
    })
    setShowAttendanceModal(true)
  }

  const handleSaveAttendance = async (data: Attendance) => {
    if (!selectedEmployee?.id) return
    try {
      await api.saveAttendance({
        ...data,
        employee_id: selectedEmployee.id,
        year_month: yearMonth
      })
      setShowAttendanceModal(false)
      handleCalculate()
    } catch (error) {
      console.error('保存考勤失败:', error)
    }
  }

  const handleCalculate = async () => {
    if (!selectedEmployee?.id) return
    try {
      const result = await api.calculateSalary(selectedEmployee.id, yearMonth)
      setSalaryResult(result)
    } catch (error) {
      console.error('计算工资失败:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="animate-scale">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          工资核算
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          计算员工月度工资
        </p>
      </div>

      {/* 工资计算器 */}
      <div className="animate-scale" style={{ animationDelay: '50ms' }}>
        <div className="card" style={{ padding: '24px' }}>
          <SalaryCalculator
            employees={employees}
            selectedEmployee={selectedEmployee}
            yearMonth={yearMonth}
            salaryResult={salaryResult}
            onSelectEmployee={(emp) => {
              setSelectedEmployee(emp)
              setSalaryResult(null)
            }}
            onYearMonthChange={setYearMonth}
            onOpenAttendance={openAttendanceModal}
            onCalculate={handleCalculate}
          />
        </div>
      </div>

      {/* 考勤录入弹窗 */}
      {showAttendanceModal && selectedEmployee && (
        <AttendanceForm
          employeeName={selectedEmployee.name}
          initialData={attendanceData}
          onSubmit={handleSaveAttendance}
          onCancel={() => setShowAttendanceModal(false)}
        />
      )}
    </div>
  )
}
