import { useState, useEffect } from 'react'
import { SalaryCalculator } from '../components'
import * as api from '../hooks/api'
import { exportSalaries } from '../hooks/useExcel'
import type { Employee, SalaryResult } from '../types'

export function SalaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [yearMonth, setYearMonth] = useState('2026-03')
  const [salaryResult, setSalaryResult] = useState<SalaryResult | null>(null)
  const [salaryList, setSalaryList] = useState<SalaryResult[]>([])

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

  const handleCalculate = async () => {
    if (!selectedEmployee?.id) return
    try {
      const result = await api.calculateSalary(selectedEmployee.id, yearMonth)
      setSalaryResult(result)
    } catch (error) {
      console.error('计算工资失败:', error)
    }
  }

  const handleBatchCalculate = async (employeeIds: number[]) => {
    if (employeeIds.length === 0) return
    try {
      const results = await api.batchCalculateSalary(employeeIds, yearMonth)
      setSalaryList(results)
    } catch (error) {
      console.error('批量计算工资失败:', error)
    }
  }

  const handleSelectEmployees = (_employeeIds: number[]) => {
    setSalaryList([])
  }

  const handleExport = async () => {
    try {
      const dataToExport = salaryResult ? [salaryResult] : salaryList
      if (dataToExport.length === 0) {
        alert('没有可导出的数据')
        return
      }
      await exportSalaries(dataToExport, yearMonth)
    } catch (error) {
      console.error('导出工资失败:', error)
      alert('导出失败: ' + error)
    }
  }

  return (
    <div className="space-y-6" style={{ position: 'relative', zIndex: 1 }}>
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
      <div className="animate-scale" style={{ animationDelay: '50ms', position: 'relative', zIndex: 1 }}>
        <div className="card" style={{ padding: '24px', position: 'relative', zIndex: 1 }}>
          <SalaryCalculator
            employees={employees}
            selectedEmployee={selectedEmployee}
            yearMonth={yearMonth}
            salaryResult={salaryResult}
            salaryList={salaryList}
            onSelectEmployee={(emp) => {
              console.log('[SalaryPage] onSelectEmployee:', emp)
              setSelectedEmployee(emp)
              setSalaryResult(null)
              setSalaryList([])
            }}
            onSelectEmployees={handleSelectEmployees}
            onYearMonthChange={setYearMonth}
            onCalculate={handleCalculate}
            onBatchCalculate={handleBatchCalculate}
            onExport={handleExport}
          />
        </div>
      </div>
    </div>
  )
}
