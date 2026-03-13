import { useState } from 'react'
import type { Employee, SalaryResult } from '../types'

interface SalaryCalculatorProps {
  employees: Employee[]
  selectedEmployee: Employee | null
  yearMonth: string
  salaryResult: SalaryResult | null
  salaryList: SalaryResult[]
  onSelectEmployee: (employee: Employee | null) => void
  onSelectEmployees: (employeeIds: number[]) => void
  onYearMonthChange: (yearMonth: string) => void
  onCalculate: () => void
  onBatchCalculate: (employeeIds: number[]) => void
}

export function SalaryCalculator({
  employees,
  selectedEmployee,
  yearMonth,
  salaryResult,
  salaryList,
  onSelectEmployee,
  onSelectEmployees,
  onYearMonthChange,
  onCalculate,
  onBatchCalculate
}: SalaryCalculatorProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showMultiSelect, setShowMultiSelect] = useState(false)

  const handleCheckAll = () => {
    if (selectedIds.length === employees.length) {
      setSelectedIds([])
      onSelectEmployees([])
    } else {
      const allIds = employees.map(e => e.id!).filter(id => id !== undefined)
      setSelectedIds(allIds)
      onSelectEmployees(allIds)
    }
  }

  const handleToggleEmployee = (id: number) => {
    let newIds: number[]
    if (selectedIds.includes(id)) {
      newIds = selectedIds.filter(i => i !== id)
    } else {
      newIds = [...selectedIds, id]
    }
    setSelectedIds(newIds)
    onSelectEmployees(newIds)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>
        工资核算
      </h2>

      {/* 表单 */}
      <div className="space-y-5">
        {/* 年月选择 */}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            核算月份
          </label>
          <input
            type="month"
            value={yearMonth}
            onChange={(e) => onYearMonthChange(e.target.value)}
            className="input select"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          />
        </div>

        {/* 切换单选/多选模式 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setShowMultiSelect(false); setSelectedIds([]) }}
            className={`btn btn-sm ${!showMultiSelect ? 'btn-primary' : 'btn-secondary'}`}
          >
            单选模式
          </button>
          <button
            onClick={() => { setShowMultiSelect(true); onSelectEmployee(null) }}
            className={`btn btn-sm ${showMultiSelect ? 'btn-primary' : 'btn-secondary'}`}
          >
            多选模式
          </button>
        </div>

        {/* 单选模式 */}
        {!showMultiSelect && (
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              选择员工
            </label>
            <select
              value={selectedEmployee?.id || ''}
              onChange={(e) => {
                console.log('[SalaryCalculator] 选择员工, value:', e.target.value)
                const emp = employees.find((em) => em.id === Number(e.target.value))
                console.log('[SalaryCalculator] 找到员工:', emp)
                onSelectEmployee(emp || null)
              }}
              className="input select"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 100
              }}
            >
              <option value="">请选择员工</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} {emp.employee_no ? `(${emp.employee_no})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 多选模式 */}
        {showMultiSelect && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                选择员工 (已选 {selectedIds.length} 人)
              </label>
              <button
                onClick={handleCheckAll}
                className="btn btn-sm btn-secondary"
              >
                {selectedIds.length === employees.length ? '取消全选' : '全选'}
              </button>
            </div>
            <div
              className="grid grid-cols-2 gap-2 p-3 rounded-lg"
              style={{ backgroundColor: 'var(--color-bg-secondary)', maxHeight: '200px', overflowY: 'auto' }}
            >
              {employees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-white/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(emp.id!)}
                    onChange={() => handleToggleEmployee(emp.id!)}
                    className="w-4 h-4"
                  />
                  <span style={{ color: 'var(--color-text-primary)' }}>
                    {emp.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {!showMultiSelect ? (
            <>
              <button
                onClick={onCalculate}
                disabled={!selectedEmployee}
                className="btn btn-primary flex-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
                </svg>
                计算工资
              </button>
            </>
          ) : (
            <button
              onClick={() => onBatchCalculate(selectedIds)}
              disabled={selectedIds.length === 0}
              className="btn btn-primary flex-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
              </svg>
              批量计算 ({selectedIds.length} 人)
            </button>
          )}
        </div>
      </div>

      {/* 单个计算结果 */}
      {salaryResult && !showMultiSelect && (
        <div
          className="mt-8 p-6 rounded-2xl animate-scale"
          style={{
            background: 'linear-gradient(135deg, #fdf6e3 0%, #fef9e7 50%, #faf5eb 100%)',
            border: '1px solid rgba(184, 134, 11, 0.15)',
            boxShadow: '0 8px 32px rgba(184, 134, 11, 0.12), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #a07408 100%)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {salaryResult.employee_name}
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  实发工资
                </p>
              </div>
            </div>
            <span
              className="badge"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #a07408 100%)',
                color: 'white',
                padding: '6px 12px'
              }}
            >
              {yearMonth} 月
            </span>
          </div>

          {/* 明细 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>固定薪酬</span>
              <span className="amount" style={{ color: 'var(--color-text-primary)' }}>
                ¥{salaryResult.fixed_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.6)' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>绩效薪酬</span>
              <span className="amount" style={{ color: 'var(--color-text-primary)' }}>
                ¥{salaryResult.performance_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {salaryResult.attendance_deduction > 0 && (
              <div
                className="flex justify-between items-center py-2 px-3 rounded-lg"
                style={{ background: 'rgba(220, 38, 38, 0.08)', color: 'var(--color-danger)' }}
              >
                <span>考勤扣减</span>
                <span className="amount">
                  -¥{salaryResult.attendance_deduction.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div
              className="pt-5 mt-2"
              style={{ borderTop: '2px dashed rgba(184, 134, 11, 0.2)' }}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                  本月工资
                </span>
                <span
                  className="amount-lg"
                  style={{
                    color: 'var(--color-accent)',
                    textShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
                  }}
                >
                  ¥{salaryResult.net_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批量计算结果列表 */}
      {salaryList.length > 0 && showMultiSelect && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              工资计算结果 ({salaryList.length} 人)
            </h3>
            <span
              className="badge"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #a07408 100%)',
                color: 'white',
                padding: '6px 12px'
              }}
            >
              {yearMonth} 月
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>员工姓名</th>
                  <th style={{ textAlign: 'right' }}>固定薪酬</th>
                  <th style={{ textAlign: 'right' }}>绩效薪酬</th>
                  <th style={{ textAlign: 'right' }}>考勤扣款</th>
                  <th style={{ textAlign: 'right' }}>实发工资</th>
                </tr>
              </thead>
              <tbody>
                {salaryList.map((item) => (
                  <tr key={item.employee_id}>
                    <td className="font-medium">{item.employee_name}</td>
                    <td style={{ textAlign: 'right' }}>
                      ¥{item.fixed_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      ¥{item.performance_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ textAlign: 'right', color: item.attendance_deduction > 0 ? 'var(--color-danger)' : 'inherit' }}>
                      {item.attendance_deduction > 0 ? `-¥${item.attendance_deduction.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-accent)' }}>
                      ¥{item.net_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: 'var(--color-bg-secondary)' }}>
                  <td className="font-semibold">合计</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ¥{salaryList.reduce((sum, item) => sum + item.fixed_salary, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ¥{salaryList.reduce((sum, item) => sum + item.performance_salary, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--color-danger)' }}>
                    -¥{salaryList.reduce((sum, item) => sum + item.attendance_deduction, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-accent)', fontSize: '16px' }}>
                    ¥{salaryList.reduce((sum, item) => sum + item.net_salary, 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
