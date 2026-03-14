import { useState } from 'react'
import type { Attendance, Employee } from '../types'
import { MonthPicker } from './MonthPicker'

interface AttendanceFormProps {
  employees: Employee[]
  yearMonth: string
  employeeName?: string
  initialData?: Attendance
  onSubmit: (data: Attendance) => void
  onCancel: () => void
}

export function AttendanceForm({ employees, yearMonth, employeeName, initialData, onSubmit, onCancel }: AttendanceFormProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number>(
    initialData?.employee_id || 0
  )
  const [formData, setFormData] = useState<Attendance>(
    initialData || {
      employee_id: 0,
      year_month: yearMonth,
      work_days: 23,
      normal_days: 21,
      sick_leave_days: 0,
      late_count: 0,
      early_leave_count: 0,
      overtime_hours: 0
    }
  )

  const handleEmployeeChange = (empId: number) => {
    setSelectedEmployeeId(empId)
    setFormData({ ...formData, employee_id: empId })
  }

  const currentEmployee = employees.find(e => e.id === selectedEmployeeId)
  const displayName = currentEmployee?.name || employeeName || '请选择员工'

  const handleSubmit = () => {
    console.log('[AttendanceForm] handleSubmit called')
    console.log('[AttendanceForm] selectedEmployeeId:', selectedEmployeeId)
    console.log('[AttendanceForm] formData:', formData)
    console.log('[AttendanceForm] yearMonth:', yearMonth)

    if (!selectedEmployeeId) {
      alert('请选择员工')
      return
    }
    if (!formData.year_month) {
      alert('请选择考勤月份')
      return
    }
    const submitData = { ...formData, employee_id: selectedEmployeeId, year_month: formData.year_month }
    console.log('[AttendanceForm] 提交数据:', JSON.stringify(submitData))
    onSubmit(submitData)
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content animate-scale" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-semibold"
              style={{
                background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)',
                boxShadow: '0 2px 8px rgba(184, 134, 11, 0.3)'
              }}
            >
              {displayName.charAt(0)}
            </div>
            <div>
              <h3>录入考勤</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {displayName}
              </p>
            </div>
          </div>
        </div>
        <div className="modal-body">
          <div className="space-y-5">
            {/* 员工选择 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                选择员工 <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <select
                value={selectedEmployeeId || ''}
                onChange={(e) => handleEmployeeChange(Number(e.target.value))}
                className="input select"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
              >
                <option value="">请选择员工</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.employee_no ? `(${emp.employee_no})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* 考勤月份 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                考勤月份 <span style={{ color: 'var(--color-danger)' }}>*</span>
              </label>
              <MonthPicker
                value={formData.year_month || yearMonth}
                onChange={(val) => setFormData({ ...formData, year_month: val })}
              />
            </div>

            {/* 本月出勤天数 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                本月应出勤天数
              </label>
              <input
                type="number"
                value={formData.work_days}
                onChange={(e) => setFormData({ ...formData, work_days: Number(e.target.value) })}
                className="input"
                min={0}
                max={31}
              />
            </div>

            {/* 正常出勤天数 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                实际出勤天数
              </label>
              <input
                type="number"
                value={formData.normal_days}
                onChange={(e) => setFormData({ ...formData, normal_days: Number(e.target.value) })}
                className="input"
                min={0}
                max={31}
              />
            </div>

            {/* 事假天数 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                事假天数
              </label>
              <input
                type="number"
                value={formData.sick_leave_days}
                onChange={(e) => setFormData({ ...formData, sick_leave_days: Number(e.target.value) })}
                className="input"
                min={0}
                max={31}
                step={0.5}
              />
              <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                事假将按固定工资 ÷ 21.75 进行扣款
              </p>
            </div>

            {/* 迟到次数 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                迟到次数
              </label>
              <input
                type="number"
                value={formData.late_count}
                onChange={(e) => setFormData({ ...formData, late_count: Number(e.target.value) })}
                className="input"
                min={0}
              />
            </div>

            {/* 早退次数 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                早退次数
              </label>
              <input
                type="number"
                value={formData.early_leave_count}
                onChange={(e) => setFormData({ ...formData, early_leave_count: Number(e.target.value) })}
                className="input"
                min={0}
              />
            </div>

            {/* 加班小时数 */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                加班小时数
              </label>
              <input
                type="number"
                value={formData.overtime_hours}
                onChange={(e) => setFormData({ ...formData, overtime_hours: Number(e.target.value) })}
                className="input"
                min={0}
                step={0.5}
              />
            </div>

            {/* 提示 */}
            <div
              className="p-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fef9e7 100%)',
                border: '1px solid rgba(217, 119, 6, 0.2)'
              }}
            >
              <div className="flex gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <p className="font-medium mb-1" style={{ color: 'var(--color-warning)' }}>考勤扣款规则</p>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    考勤扣款 = 事假天数 × (固定工资 ÷ 21.75)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            保存
          </button>
        </div>
      </div>
    </div>
  )
}
