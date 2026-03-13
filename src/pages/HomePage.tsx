import { useState, useEffect } from 'react'
import {
  Layout,
  EmployeeList,
  EmployeeForm,
  AttendanceForm,
  SalaryCalculator
} from '../components'
import * as api from '../hooks/api'
import type { Employee, Attendance, SalaryResult } from '../types'

export function HomePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [yearMonth, setYearMonth] = useState('2026-03')
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Attendance>({
    employee_id: 0,
    year_month: '2026-03',
    work_days: 23,
    normal_days: 21,
    sick_leave_days: 0
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

  const handleAddEmployee = async (data: Employee) => {
    try {
      await api.addEmployee(data)
      setShowAddModal(false)
      loadEmployees()
    } catch (error) {
      console.error('添加员工失败:', error)
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      await api.deleteEmployee(id)
      loadEmployees()
      if (selectedEmployee?.id === id) {
        setSelectedEmployee(null)
        setSalaryResult(null)
      }
    } catch (error) {
      console.error('删除员工失败:', error)
    }
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

  const openAttendanceModal = () => {
    if (!selectedEmployee) return
    setAttendanceData({
      employee_id: selectedEmployee.id || 0,
      year_month: yearMonth,
      work_days: 23,
      normal_days: 21,
      sick_leave_days: 0
    })
    setShowAttendanceModal(true)
  }

  return (
    <Layout title="薪酬管理系统">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeList
          employees={employees}
          selectedId={selectedEmployee?.id}
          onSelect={setSelectedEmployee}
          onDelete={handleDeleteEmployee}
          onAdd={() => setShowAddModal(true)}
        />
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

      {showAddModal && (
        <EmployeeForm
          onSubmit={handleAddEmployee}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showAttendanceModal && selectedEmployee && (
        <AttendanceForm
          employeeName={selectedEmployee.name}
          initialData={attendanceData}
          onSubmit={handleSaveAttendance}
          onCancel={() => setShowAttendanceModal(false)}
        />
      )}
    </Layout>
  )
}
