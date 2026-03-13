import { useState, useEffect } from 'react'
import { AttendanceForm, AttendanceRules } from '../components'
import * as api from '../hooks/api'
import type { Employee, Attendance } from '../types'

export function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [yearMonth, setYearMonth] = useState('2026-03')
  const [showModal, setShowModal] = useState(false)
  const [showRules, setShowRules] = useState(false)
  const [editingAttendance, setEditingAttendance] = useState<Attendance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEmployees()
  }, [])

  useEffect(() => {
    loadAttendances()
  }, [yearMonth])

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees()
      setEmployees(data)
    } catch (error) {
      console.error('加载员工失败:', error)
    }
  }

  const loadAttendances = async () => {
    try {
      setLoading(true)
      const data = await api.getAttendances(yearMonth)
      setAttendances(data)
    } catch (error) {
      console.error('加载考勤记录失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAttendance = async (data: Attendance) => {
    try {
      await api.saveAttendance(data)
      setShowModal(false)
      setEditingAttendance(null)
      loadAttendances()
    } catch (error) {
      console.error('保存考勤失败:', error)
    }
  }

  const openAddModal = () => {
    setEditingAttendance(null)
    setShowModal(true)
  }

  const openEditModal = (emp: Employee) => {
    const existing = attendances.find(a => a.employee_id === emp.id)
    setEditingAttendance(existing || {
      employee_id: emp.id || 0,
      year_month: yearMonth,
      work_days: 23,
      normal_days: 21,
      sick_leave_days: 0,
      late_count: 0,
      early_leave_count: 0,
      overtime_hours: 0
    })
    setShowModal(true)
  }

  const getEmployeeName = (employeeId: number) => {
    const emp = employees.find(e => e.id === employeeId)
    return emp?.name || '未知'
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="animate-scale">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          考勤管理
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          管理员工考勤记录
        </p>
      </div>

      {/* 筛选区域 */}
      <div className="animate-scale" style={{ animationDelay: '50ms' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                考勤月份
              </label>
              <input
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                className="input select"
                style={{ backgroundColor: 'var(--color-bg-secondary)', width: '160px' }}
              />
            </div>
            <div className="flex-1" />
            <button onClick={() => setShowRules(true)} className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              扣款规则
            </button>
            <button onClick={openAddModal} className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              录入考勤
            </button>
          </div>
        </div>
      </div>

      {/* 考勤记录列表 */}
      <div className="animate-scale" style={{ animationDelay: '100ms' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #f5f0e0 100%)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                考勤记录
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {yearMonth} 月 · 共 {attendances.length} 条记录
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              加载中...
            </div>
          ) : attendances.length > 0 ? (
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="table">
                <thead>
                  <tr>
                    <th>员工</th>
                    <th style={{ textAlign: 'right' }}>应出勤</th>
                    <th style={{ textAlign: 'right' }}>实际出勤</th>
                    <th style={{ textAlign: 'right' }}>事假</th>
                    <th style={{ textAlign: 'right' }}>迟到</th>
                    <th style={{ textAlign: 'right' }}>早退</th>
                    <th style={{ textAlign: 'right' }}>加班(小时)</th>
                    <th style={{ textAlign: 'center' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att) => (
                    <tr key={att.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-medium"
                            style={{ background: 'linear-gradient(135deg, var(--color-accent) 0%, #9a7209 100%)' }}
                          >
                            {getEmployeeName(att.employee_id).charAt(0)}
                          </div>
                          <span className="font-medium">{getEmployeeName(att.employee_id)}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>{att.work_days} 天</td>
                      <td style={{ textAlign: 'right' }}>{att.normal_days} 天</td>
                      <td style={{ textAlign: 'right', color: att.sick_leave_days > 0 ? 'var(--color-danger)' : 'inherit' }}>
                        {att.sick_leave_days} 天
                      </td>
                      <td style={{ textAlign: 'right', color: att.late_count > 0 ? 'var(--color-danger)' : 'inherit' }}>
                        {att.late_count} 次
                      </td>
                      <td style={{ textAlign: 'right', color: att.early_leave_count > 0 ? 'var(--color-danger)' : 'inherit' }}>
                        {att.early_leave_count} 次
                      </td>
                      <td style={{ textAlign: 'right', color: att.overtime_hours > 0 ? 'var(--color-success)' : 'inherit' }}>
                        {att.overtime_hours}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            const emp = employees.find(e => e.id === att.employee_id)
                            if (emp) openEditModal(emp)
                          }}
                          className="btn btn-secondary btn-sm"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          编辑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-light) 0%, #f5f0e0 100%)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>暂无考勤记录</p>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                点击上方"录入考勤"按钮添加考勤记录
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 考勤录入弹窗 */}
      {showModal && (
        <AttendanceForm
          employeeName={editingAttendance ? getEmployeeName(editingAttendance.employee_id) : '请选择员工'}
          initialData={editingAttendance || undefined}
          onSubmit={handleSaveAttendance}
          onCancel={() => {
            setShowModal(false)
            setEditingAttendance(null)
          }}
        />
      )}

      {/* 扣款规则弹窗 */}
      {showRules && (
        <AttendanceRules onClose={() => setShowRules(false)} />
      )}
    </div>
  )
}
