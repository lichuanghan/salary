import type { Employee, SalaryResult } from '../types'

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
    <div className="card" style={{ padding: '24px' }}>
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

        {/* 员工选择 */}
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
              const emp = employees.find((em) => em.id === Number(e.target.value))
              onSelectEmployee(emp || null)
            }}
            className="input select"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          >
            <option value="">请选择员工</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <button
            onClick={onOpenAttendance}
            disabled={!selectedEmployee}
            className="btn btn-secondary flex-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            录入考勤
          </button>
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
        </div>
      </div>

      {/* 计算结果 */}
      {salaryResult && (
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
    </div>
  )
}
