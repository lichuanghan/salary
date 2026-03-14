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

  // 计算合计
  const totalFixed = salaryList.reduce((sum, item) => sum + item.fixed_salary, 0)
  const totalPerformance = salaryList.reduce((sum, item) => sum + item.performance_salary, 0)
  const totalDeduction = salaryList.reduce((sum, item) => sum + item.attendance_deduction, 0)
  const totalNet = salaryList.reduce((sum, item) => sum + item.net_salary, 0)

  return (
    <div>
      {/* 头部区域 */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)',
            boxShadow: '0 4px 12px rgba(184, 134, 11, 0.35)'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            工资核算
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
            {showMultiSelect ? '批量计算员工工资' : '计算单员工工资'}
          </p>
        </div>
      </div>

      {/* 主内容区：表单 + 结果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* 左侧：表单控制区 */}
        <div className="space-y-5">
          {/* 核算月份 */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)' }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              核算月份
            </label>
            <input
              type="month"
              value={yearMonth}
              onChange={(e) => onYearMonthChange(e.target.value)}
              className="input select"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                fontSize: '16px',
                padding: '10px 14px'
              }}
            />
          </div>

          {/* 模式切换 */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)' }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
              选择模式
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowMultiSelect(false); setSelectedIds([]) }}
                className={`btn flex-1 ${!showMultiSelect ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12h8" />
                </svg>
                单选模式
              </button>
              <button
                onClick={() => { setShowMultiSelect(true); onSelectEmployee(null) }}
                className={`btn flex-1 ${showMultiSelect ? 'btn-primary' : 'btn-secondary'}`}
                style={{ justifyContent: 'center' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
                多选模式
              </button>
            </div>
          </div>

          {/* 员工选择 */}
          <div
            className="p-5 rounded-xl"
            style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border-light)' }}
          >
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline-block mr-2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {showMultiSelect ? `选择员工 (已选 ${selectedIds.length} 人)` : '选择员工'}
            </label>

            {/* 单选模式 */}
            {!showMultiSelect && (
              <select
                value={selectedEmployee?.id || ''}
                onChange={(e) => {
                  const emp = employees.find((em) => em.id === Number(e.target.value))
                  onSelectEmployee(emp || null)
                }}
                className="input select"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  fontSize: '15px',
                  padding: '12px 14px'
                }}
              >
                <option value="">请选择员工</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.employee_no ? `(${emp.employee_no})` : ''}
                  </option>
                ))}
              </select>
            )}

            {/* 多选模式 */}
            {showMultiSelect && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    共 {employees.length} 名员工
                  </span>
                  <button
                    onClick={handleCheckAll}
                    className="btn btn-sm btn-secondary"
                  >
                    {selectedIds.length === employees.length ? '取消全选' : '全选'}
                  </button>
                </div>
                <div
                  className="grid grid-cols-2 gap-2 p-3 rounded-lg"
                  style={{
                    backgroundColor: 'var(--color-bg-primary)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    border: '1px solid var(--color-border-light)'
                  }}
                >
                  {employees.map((emp) => (
                    <label
                      key={emp.id}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-all hover:bg-white/60"
                      style={{
                        background: selectedIds.includes(emp.id!) ? 'rgba(184, 134, 11, 0.1)' : 'transparent',
                        border: selectedIds.includes(emp.id!) ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid transparent'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.id!)}
                        onChange={() => handleToggleEmployee(emp.id!)}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--color-accent)' }}
                      />
                      <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>
                        {emp.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 计算按钮 */}
          <button
            onClick={() => showMultiSelect ? onBatchCalculate(selectedIds) : onCalculate()}
            disabled={showMultiSelect ? selectedIds.length === 0 : !selectedEmployee}
            className="btn btn-primary w-full py-4"
            style={{
              fontSize: '16px',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(184, 134, 11, 0.3)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
            </svg>
            {showMultiSelect ? `批量计算工资 (${selectedIds.length} 人)` : '计算工资'}
          </button>
        </div>

        {/* 右侧：结果展示区 */}
        <div>
          {/* 单个结果 */}
          {salaryResult && !showMultiSelect && (
            <div
              className="p-6 rounded-2xl animate-scale"
              style={{
                background: 'linear-gradient(145deg, #fdf6e3 0%, #fef9e7 50%, #faf5eb 100%)',
                border: '1px solid rgba(184, 134, 11, 0.2)',
                boxShadow: '0 8px 32px rgba(184, 134, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
              }}
            >
              {/* 员工信息头 */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, var(--color-accent) 0%, #a07408 100%)',
                      boxShadow: '0 4px 12px rgba(184, 134, 11, 0.4)'
                    }}
                  >
                    {salaryResult.employee_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {salaryResult.employee_name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      {yearMonth} 月工资单
                    </p>
                  </div>
                </div>
                <span
                  className="badge"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-accent) 0%, #a07408 100%)',
                    color: 'white',
                    padding: '8px 16px',
                    fontSize: '14px'
                  }}
                >
                  实发工资
                </span>
              </div>

              {/* 工资明细 */}
              <div className="space-y-3">
                <div
                  className="flex justify-between items-center py-3 px-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                >
                  <span style={{ color: 'var(--color-text-secondary)' }}>固定薪酬</span>
                  <span className="amount font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}>
                    ¥{salaryResult.fixed_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center py-3 px-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                >
                  <span style={{ color: 'var(--color-text-secondary)' }}>绩效薪酬</span>
                  <span className="amount font-semibold" style={{ color: 'var(--color-text-primary)', fontSize: '16px' }}>
                    ¥{salaryResult.performance_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {salaryResult.attendance_deduction > 0 && (
                  <div
                    className="flex justify-between items-center py-3 px-4 rounded-xl"
                    style={{ background: 'rgba(220, 38, 38, 0.08)' }}
                  >
                    <span style={{ color: 'var(--color-danger)' }}>考勤扣减</span>
                    <span className="amount font-semibold" style={{ color: 'var(--color-danger)', fontSize: '16px' }}>
                      -¥{salaryResult.attendance_deduction.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              {/* 合计 */}
              <div
                className="mt-6 pt-5"
                style={{ borderTop: '2px dashed rgba(184, 134, 11, 0.25)' }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg" style={{ color: 'var(--color-text-primary)' }}>
                    本月工资
                  </span>
                  <span
                    className="amount-lg font-bold"
                    style={{
                      color: 'var(--color-accent)',
                      fontSize: '28px',
                      textShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
                    }}
                  >
                    ¥{salaryResult.net_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 批量结果 */}
          {salaryList.length > 0 && showMultiSelect && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border-light)',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* 表头 */}
              <div
                className="px-5 py-4"
                style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)' }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-lg">
                    工资计算结果
                  </h3>
                  <span
                    className="badge"
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      padding: '6px 14px'
                    }}
                  >
                    {yearMonth} 月 · {salaryList.length} 人
                  </span>
                </div>
              </div>

              {/* 表格 */}
              <div className="overflow-x-auto">
                <table className="table" style={{ marginBottom: 0 }}>
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
                        <td>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                              style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)' }}
                            >
                              {item.employee_name.charAt(0)}
                            </div>
                            <span className="font-medium">{item.employee_name}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          ¥{item.fixed_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          ¥{item.performance_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                        </td>
                        <td style={{ textAlign: 'right', color: item.attendance_deduction > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)' }}>
                          {item.attendance_deduction > 0 ? `-¥${item.attendance_deduction.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-accent)', fontSize: '15px' }}>
                          ¥{item.net_salary.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: 'var(--color-bg-tertiary)' }}>
                      <td className="font-bold">合计</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        ¥{totalFixed.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        ¥{totalPerformance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-danger)' }}>
                        -¥{totalDeduction.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--color-accent)', fontSize: '17px' }}>
                        ¥{totalNet.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* 空状态 */}
          {!salaryResult && salaryList.length === 0 && (
            <div
              className="flex flex-col items-center justify-center p-12 rounded-2xl"
              style={{
                background: 'var(--color-bg-secondary)',
                border: '1px dashed var(--color-border)',
                minHeight: '300px'
              }}
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #f5f0e0 100%)' }}
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                暂无计算结果
              </p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
                选择员工后点击"计算工资"按钮<br />即可查看工资明细
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
